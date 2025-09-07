import ERROR_MESSAGES from '@constants/errors';
import NetInfo from '@react-native-community/netinfo';
import logger from '@utils/logger';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { getApiErrorMessage } from './error';

/** ───────── Config ───────── **/
const API_URL = 'http://192.168.1.5:8080/api';
const TIMEOUT_DURATION = 10_000;
const AUTH_WHITELIST = ['/auth/sendotp', '/auth/verifyotp', '/auth/refreshtoken'];
const USE_BEARER = true;

// Toggle this if you ever want to reduce noise
const HTTP_LOG = true;

/** ───────── Axios instance ───────── **/
export const http: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT_DURATION,
  headers: { 'Content-Type': 'application/json' },
});

/** ───────── Auth state (in-memory) ───────── **/
let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (fn: (() => void) | null) => (_onUnauthorized = fn);
export const getAccessToken = () => _accessToken;
export const getRefreshToken = () => _refreshToken;

export function setAuthTokens(
  tokens: { accessToken: string; refreshToken?: string | null } | null,
) {
  _accessToken = tokens?.accessToken ?? null;
  _refreshToken = tokens?.refreshToken ?? null;

  if (_accessToken) {
    http.defaults.headers.common.Authorization = USE_BEARER
      ? `Bearer ${_accessToken}`
      : _accessToken;
  } else {
    delete http.defaults.headers.common.Authorization;
  }
}

/** ───────── Helpers ───────── **/
function isWhitelisted(url?: string): boolean {
  if (!url) return false;
  const path = url.startsWith('http') ? url.replace(API_URL, '') : url;
  return AUTH_WHITELIST.some((p) => path.startsWith(p));
}

type Meta = { start: number; requestId: string };
type AugmentedConfig = InternalAxiosRequestConfig & { __meta?: Meta };

const genId = () => Math.random().toString(36).slice(2, 8);

const SENSITIVE_KEYS = new Set([
  'authorization',
  'Authorization',
  'accessToken',
  'refreshToken',
  'password',
  // 'otp',
  // 'otpCode',
  'token',
]);

function redactDeep(value: any): any {
  if (value == null) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redactDeep);

  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(value)) {
    out[k] = SENSITIVE_KEYS.has(k) ? '***' : redactDeep(v);
  }
  return out;
}

/** ───────── Interceptors ───────── **/

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Online check
  const net = await NetInfo.fetch();
  if (net.isInternetReachable === false || net.isConnected === false) {
    const msg = ERROR_MESSAGES.NO_INTERNET;
    if (HTTP_LOG) logger.error('[HTTP] ✖ offline', msg);
    throw new Error(msg);
  }

  // Attach meta for timing + correlation
  const cfg = config as AugmentedConfig;
  cfg.__meta = { start: Date.now(), requestId: genId() };

  // Auth header (unless whitelisted)
  if (isWhitelisted(config.url)) {
    if (config.headers) delete (config.headers as any).Authorization;
  } else if (_accessToken) {
    (config.headers as any).Authorization = USE_BEARER ? `Bearer ${_accessToken}` : _accessToken;
  }

  if (HTTP_LOG) {
    const method = (config.method || 'GET').toUpperCase();
    const url = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
    const redactedHeaders = redactDeep(config.headers || {});
    const redactedPayload = redactDeep(config.data);

    logger.info(`[HTTP] → → → → [${cfg.__meta.requestId}] ${method} ${url}`);
    if (redactedHeaders && Object.keys(redactedHeaders).length) {
      logger.debug('[HTTP] Request Headers', redactedHeaders);
    }
    if (config.data !== undefined) {
      logger.info('[HTTP] Request Payload', redactedPayload);
    }
  }

  return config;
});

/* 401 refresh with single-flight queue */
let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];
const subscribeTokenRefresh = (cb: (t: string) => void) => pendingQueue.push(cb);
const onRefreshed = (t: string) => {
  pendingQueue.forEach((cb) => cb(t));
  pendingQueue = [];
};

type RefreshResponse = {
  success: true;
  data: { accessToken: string; refreshToken?: string; sessionId?: string };
};

http.interceptors.response.use(
  (res) => {
    const meta = (res.config as AugmentedConfig).__meta;
    if (HTTP_LOG) {
      const method = (res.config.method || 'GET').toUpperCase();
      const url = res.config.baseURL ? `${res.config.baseURL}${res.config.url}` : res.config.url;
      const ms = meta ? Date.now() - meta.start : undefined;
      logger.debug(
        `[HTTP] ← [${meta?.requestId ?? '-'}] ${res.status} ${method} ${url}${
          ms ? ` (${ms} ms)` : ''
        }`,
      );
      logger.info('[HTTP] Response Body', redactDeep(res.data));
    }
    return res;
  },
  async (error) => {
    // Map offline message (thrown by request interceptor)
    if ((error as any)?.message === ERROR_MESSAGES.NO_INTERNET) {
      if (HTTP_LOG) logger.error('[HTTP] ✖ OFFLINE', ERROR_MESSAGES.NO_INTERNET);
      return Promise.reject(new Error(ERROR_MESSAGES.NO_INTERNET));
    }

    const ax = error as AxiosError;
    const original = (ax.config as AugmentedConfig) || undefined;
    const meta = original?.__meta;

    const method = (original?.method || 'GET').toUpperCase();
    const url = original?.baseURL ? `${original.baseURL}${original.url}` : original?.url;
    const ms = meta ? Date.now() - meta.start : undefined;

    // If no response at all
    if (!ax.response) {
      const msg = getApiErrorMessage(ax);
      if (HTTP_LOG) {
        logger.error(
          `[HTTP] ✖ [${meta?.requestId ?? '-'}] ${method} ${url ?? ''}${
            ms ? ` (${ms} ms)` : ''
          }: ${msg}`,
        );
      }
      return Promise.reject(new Error(msg));
    }

    const status = ax.response.status;

    // Whitelisted endpoints: don't refresh; still log + map message
    if (isWhitelisted(original?.url)) {
      const msg = getApiErrorMessage(ax);
      if (HTTP_LOG) {
        logger.error(
          `[HTTP] ✖ [${meta?.requestId ?? '-'}] ${status} ${method} ${url}${
            ms ? ` (${ms} ms)` : ''
          }: ${msg}`,
        );
        logger.info('[HTTP] error body', redactDeep(ax.response.data));
      }
      return Promise.reject(new Error(msg));
    }

    // Try refresh once when 401
    const origCfg = original as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (status === 401 && !origCfg?._retry && _refreshToken) {
      if (origCfg) origCfg._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            if (!origCfg) {
              const msg = getApiErrorMessage(ax);
              if (HTTP_LOG) logger.error('[HTTP] ✖ refresh: missing original request');
              reject(new Error(msg));
              return;
            }
            if (origCfg.headers) {
              (origCfg.headers as any).Authorization = USE_BEARER ? `Bearer ${token}` : token;
            }
            resolve(http(origCfg));
          });
        });
      }

      isRefreshing = true;
      if (HTTP_LOG) logger.debug('[HTTP] ↻ refreshing access token…');

      try {
        const res = await http.request<RefreshResponse>({
          url: '/auth/refreshtoken',
          method: 'POST',
          data: { refreshToken: _refreshToken },
        });

        const newAccess = res.data?.data?.accessToken;
        const newRefresh = res.data?.data?.refreshToken ?? _refreshToken;
        if (!newAccess) throw new Error('No access token in refresh');

        setAuthTokens({ accessToken: newAccess, refreshToken: newRefresh });
        onRefreshed(newAccess);
        isRefreshing = false;
        if (HTTP_LOG) logger.debug('[HTTP] ✓ refresh success');

        if (!origCfg) return Promise.reject(new Error('Original request missing'));
        if (origCfg.headers) {
          (origCfg.headers as any).Authorization = USE_BEARER ? `Bearer ${newAccess}` : newAccess;
        }
        return http(origCfg);
      } catch (e) {
        isRefreshing = false;
        pendingQueue = [];
        setAuthTokens(null);
        _onUnauthorized?.();

        const msg = getApiErrorMessage(e);
        if (HTTP_LOG) logger.error('[HTTP] ✖ refresh failed:', msg);
        return Promise.reject(new Error(msg));
      }
    }

    // All other errors
    const msg = getApiErrorMessage(ax);
    if (HTTP_LOG) {
      logger.error(
        `[HTTP] ✖ [${meta?.requestId ?? '-'}] ${status} ${method} ${url}${
          ms ? ` (${ms} ms)` : ''
        }: ${msg}`,
      );
      logger.info('[HTTP] error body', redactDeep(ax.response.data));
    }
    return Promise.reject(new Error(msg));
  },
);
