// src/services/api.ts
import NetInfo from '@react-native-community/netinfo';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, Method } from 'axios';

import ERROR_MESSAGES from '../constants/errors';
import logger from '../utils/logger';

/** Set this to your base API; you already had this */
const API_URL = 'http://192.168.1.7:8080/api';
const TIMEOUT_DURATION = 10_000;

/** All requests default to JSON */
const http: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT_DURATION,
  headers: { 'Content-Type': 'application/json' },
});

/** Endpoints that must NOT send Authorization and must NOT trigger refresh flow */
const AUTH_WHITELIST = ['/auth/sendotp', '/auth/verifyotp', '/auth/refreshtoken'];

/** Helper to check if an endpoint should skip auth/refresh */
function isWhitelisted(url?: string): boolean {
  if (!url) return false;
  // url is usually relative (e.g. '/user/getprofile')
  // In case someone passes absolute, strip base
  const path = url.startsWith('http') ? url.replace(API_URL, '') : url;
  return AUTH_WHITELIST.some((p) => path.startsWith(p));
}

/** Backends typically expect 'Bearer <token>' */
const USE_BEARER = true;

/** Module-local token storage (kept in memory) */
let _accessToken: string | null = null;
let _refreshToken: string | null = null;

/** Expose a way for the app to react (e.g., logout) when refresh fails */
let _onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  _onUnauthorized = fn;
}

/** Set/clear tokens globally */
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

/** Exported helpers if you need to peek (rare) */
export const getAccessToken = () => _accessToken;
export const getRefreshToken = () => _refreshToken;

/* ─────────────────────────────────────────────────────────────
 * Request interceptor:
 *  - Ensure Authorization header for non-auth endpoints
 *  - Keep Content-Type as JSON (already default)
 * ────────────────────────────────────────────────────────────*/
http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Always check connectivity early
  const net = await NetInfo.fetch();
  if (net.isInternetReachable === false || net.isConnected === false) {
    // Throwing here routes to the response interceptor catch
    throw new Error(ERROR_MESSAGES.NO_INTERNET);
  }

  // Skip auth for whitelisted endpoints
  if (isWhitelisted(config.url)) {
    // Ensure we don't accidentally send old auth headers
    if (config.headers) delete (config.headers as any).Authorization;
    return config;
  }

  // Attach Authorization if we have it
  if (_accessToken) {
    (config.headers as any).Authorization = USE_BEARER ? `Bearer ${_accessToken}` : _accessToken;
  }

  return config;
});

/* ─────────────────────────────────────────────────────────────
 * Response interceptor with refresh-on-401 and retry-once
 * ────────────────────────────────────────────────────────────*/
let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  pendingQueue.push(cb);
}

function onRefreshed(newToken: string) {
  pendingQueue.forEach((cb) => cb(newToken));
  pendingQueue = [];
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const ax = error as AxiosError;
    const original = ax.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle our explicit offline error thrown from request interceptor
    if (error?.message === ERROR_MESSAGES.NO_INTERNET) {
      return Promise.reject(new Error(ERROR_MESSAGES.NO_INTERNET));
    }

    // If no response, treat as network error
    if (!ax.response) {
      return Promise.reject(new Error(ERROR_MESSAGES.UNKNOWN_ERROR));
    }

    const status = ax.response.status;

    // Do not attempt refresh for whitelisted endpoints (including refresh itself)
    if (isWhitelisted(original?.url)) {
      return Promise.reject(ax);
    }

    // Attempt refresh on 401 once
    if (status === 401 && !original?._retry && _refreshToken) {
      original._retry = true;

      if (isRefreshing) {
        // Queue until refresh completes
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            // retry with new token
            (original.headers as any).Authorization = USE_BEARER ? `Bearer ${token}` : token;
            resolve(http(original));
          });
        });
      }

      isRefreshing = true;
      try {
        // Call refresh endpoint directly via the instance (it's whitelisted)
        const res = await http.request<RefreshResponse>({
          url: '/auth/refreshtoken',
          method: 'POST',
          data: { refreshToken: _refreshToken },
        });

        const newAccess = res.data?.data?.accessToken;
        const newRefresh = res.data?.data?.refreshToken ?? _refreshToken;

        if (!newAccess) throw new Error('No access token in refresh');

        // Update tokens in memory + default header
        setAuthTokens({ accessToken: newAccess, refreshToken: newRefresh });

        // Flush queued requests
        onRefreshed(newAccess);
        isRefreshing = false;

        // Retry the original request with the new token
        (original.headers as any).Authorization = USE_BEARER ? `Bearer ${newAccess}` : newAccess;
        return http(original);
      } catch (e) {
        isRefreshing = false;
        pendingQueue = []; // drop queued requests
        // Clear tokens; let the app logout if it wants
        setAuthTokens(null);
        if (_onUnauthorized) _onUnauthorized();
        return Promise.reject(e);
      }
    }

    // For non-401 errors (or 401 with no refresh token), pass back a clean Error
    const msg =
      (ax.response.data as any)?.message ||
      (ax.response.data as any)?.error ||
      ERROR_MESSAGES.SERVER_ERROR;

    return Promise.reject(new Error(msg));
  },
);

/* ─────────────────────────────────────────────────────────────
 * Master API CALL function
 * ────────────────────────────────────────────────────────────*/
async function apiCall<T>(
  endpoint: string,
  method: Method,
  data?: Record<string, any>,
): Promise<T> {
  const start = Date.now();

  logger.debug(`[API] → ${method} ${endpoint}`);
  if (data !== undefined) logger.debug(`[API] payload`, data);

  try {
    const res = await http.request<T>({ url: endpoint, method, data });
    const ms = Date.now() - start;
    logger.debug(`[API] ← ${res.status} ${method} ${endpoint} (${ms} ms)`);
    logger.info(`[API] body`, res.data);
    return res.data;
  } catch (err: any) {
    const ms = Date.now() - start;
    logger.error(`[API] ✖ ${method} ${endpoint} (${ms} ms): ${err?.message}`);
    throw err;
  }
}

/* ─────────────────────────────────────────────────────────────
 * Types & API functions (your existing ones + getProfile)
 * ────────────────────────────────────────────────────────────*/
export type SendOtpResponse = { success: boolean; error?: string };

export type VerifyOtpResponse = {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
};

export type RefreshResponse = {
  success: true;
  message?: string;
  data: { accessToken: string; refreshToken?: string; sessionId?: string };
};

export const getOtp = async (countryCode: string, phone: string) =>
  apiCall<SendOtpResponse>('/auth/sendotp', 'POST', { countryCode, phone });

export const resendOtp = async (countryCode: string, phone: string) =>
  apiCall<SendOtpResponse>('/auth/sendotp', 'POST', { countryCode, phone, isResend: true });

export const verifyOtp = async (countryCode: string, phone: string, otpCode: string) =>
  apiCall<VerifyOtpResponse>('/auth/verifyotp', 'POST', { countryCode, phone, otpCode });

export const refreshAccess = (refreshToken: string) =>
  apiCall<RefreshResponse>('/auth/refreshtoken', 'POST', { refreshToken });

/* ---------- Profile ---------- */
export type GetProfileResponse = {
  success: boolean;
  message?: string;
  data: {
    user_id: string;
    full_name: string;
    phoneNumber?: string;
    phoneCountryCode?: string;
    date_of_birth: string | null;
    gender: string | null;
    profile_picture: string | null;
    preferred_language: string | null;
    is_profile_complete: boolean;
    created_at: string;
    updated_at: string;
  };
};

export const getProfile = () => apiCall<GetProfileResponse>('/user/getprofile', 'GET');

// ---- Update Profile ----
export type UpdateProfilePayload = {
  fullName?: string;
  dateOfBirth?: string; // DD-MM-YYYY (e.g., "25-08-2010")
  gender?: 'male' | 'female';
  preferredLanguage?: string; // e.g., "en"

  // Plan for near-future backend changes (send only if your backend accepts them):
  phoneNumber?: string;
  phoneCountryCode?: string; // e.g., "+91"
  avatarKey?: string; // curated avatar id like "a03"
  // profilePicture?: string;          // (not used now, but supported by backend if you ever need)
};

export type UpdateProfileResponse = {
  success: boolean;
  message?: string;
  data?: any | null;
};

export const updateProfile = (payload: UpdateProfilePayload) =>
  apiCall<UpdateProfileResponse>('/user/updateprofile', 'PATCH', payload);
