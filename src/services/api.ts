// src/services/api.ts
import ERROR_MESSAGES from '@constants/errors'; // use path alias
import NetInfo from '@react-native-community/netinfo';
import logger from '@utils/logger';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, Method } from 'axios';

/** Base config */
const API_URL = 'http://192.168.1.6:8080/api';
const TIMEOUT_DURATION = 10_000;

/** Axios instance */
export const http: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT_DURATION,
  headers: { 'Content-Type': 'application/json' },
});

/** Endpoints that do not require Authorization or refresh */
const AUTH_WHITELIST = ['/auth/sendotp', '/auth/verifyotp', '/auth/refreshtoken'];
const USE_BEARER = true;

/** In-memory auth */
let _accessToken: string | null = null;
let _refreshToken: string | null = null;

/** Global handler for terminal auth failures (e.g., logout) */
let _onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  _onUnauthorized = fn;
}

/** Manage tokens */
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

export const getAccessToken = () => _accessToken;
export const getRefreshToken = () => _refreshToken;

/** Helpers */
function isWhitelisted(url?: string): boolean {
  if (!url) return false;
  const path = url.startsWith('http') ? url.replace(API_URL, '') : url;
  return AUTH_WHITELIST.some((p) => path.startsWith(p));
}

/** Central error parser: always derive a user-friendly message */
export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<any>;

    // No HTTP response => network/timeout
    if (!ax.response) {
      if (ax.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
      return ERROR_MESSAGES.UNKNOWN_ERROR || 'Network error. Please check your connection.';
    }

    const data = ax.response.data;

    // Prefer server-provided fields
    if (data) {
      if (typeof data === 'string') return data;
      if (typeof data.error === 'string') return data.error; // { error: "Invalid OTP" }
      if (typeof data.message === 'string') return data.message; // { message: "..." }

      // Common validation shape: { errors: { field: ["msg"] } }
      if (data.errors && typeof data.errors === 'object') {
        const first = Object.values(data.errors)[0];
        if (Array.isArray(first) && first.length) return String(first[0]);
      }
    }

    // Fallback with status code
    return `Request failed (${ax.response.status})`;
  }

  // Non-Axios thrown error
  return (err as any)?.message ?? 'Something went wrong';
}

/* ─────────────────────────────────────────────────────────────
 * Request interceptor:
 *  - Connectivity check
 *  - Attach Authorization (unless whitelisted)
 * ────────────────────────────────────────────────────────────*/
http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const net = await NetInfo.fetch();
  if (net.isInternetReachable === false || net.isConnected === false) {
    // Throwing routes to response interceptor catch
    throw new Error(ERROR_MESSAGES.NO_INTERNET);
  }

  if (isWhitelisted(config.url)) {
    if (config.headers) delete (config.headers as any).Authorization;
    return config;
  }

  if (_accessToken) {
    (config.headers as any).Authorization = USE_BEARER ? `Bearer ${_accessToken}` : _accessToken;
  }

  return config;
});

/* ─────────────────────────────────────────────────────────────
 * Response interceptor:
 *  - Unified error mapping (including WHITELISTED endpoints)
 *  - Refresh-on-401 with queueing + single-flight
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
    // Map our explicit offline error
    if ((error as any)?.message === ERROR_MESSAGES.NO_INTERNET) {
      return Promise.reject(new Error(ERROR_MESSAGES.NO_INTERNET));
    }

    const ax = error as AxiosError;
    const original = (ax.config ?? undefined) as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // If no response at all, return unified message
    if (!ax.response) {
      return Promise.reject(new Error(getApiErrorMessage(ax)));
    }

    const status = ax.response.status;

    // For whitelisted endpoints, DO NOT refresh; still map message properly
    const originalUrl = original?.url;
    if (isWhitelisted(originalUrl)) {
      const msg = getApiErrorMessage(ax);
      return Promise.reject(new Error(msg));
    }

    // Refresh on 401 once if we have a refresh token
    if (status === 401 && !original?._retry && _refreshToken) {
      if (original) original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            if (!original) {
              // No original request to retry — surface original error message
              reject(new Error(getApiErrorMessage(ax)));
              return;
            }
            if (original.headers) {
              (original.headers as any).Authorization = USE_BEARER ? `Bearer ${token}` : token;
            }
            resolve(http(original));
          });
        });
      }

      isRefreshing = true;
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

        if (!original) {
          // Nothing to retry; just resolve with a benign error/message
          return Promise.reject(new Error('Original request missing'));
        }
        if (original.headers) {
          (original.headers as any).Authorization = USE_BEARER ? `Bearer ${newAccess}` : newAccess;
        }
        return http(original);
      } catch (e) {
        isRefreshing = false;
        pendingQueue = [];
        setAuthTokens(null);
        _onUnauthorized?.();
        return Promise.reject(new Error(getApiErrorMessage(e)));
      }
    }

    // All other errors: unified message
    return Promise.reject(new Error(getApiErrorMessage(ax)));
  },
);

/* ─────────────────────────────────────────────────────────────
 * Core API call utility (typed)
 * ────────────────────────────────────────────────────────────*/
export async function apiCall<T>(
  endpoint: string,
  method: Method,
  data?: Record<string, any>,
): Promise<T> {
  const start = Date.now();
  logger.debug(`[API] → ${method} ${endpoint}`);
  if (data !== undefined) logger.debug('[API] payload', data);

  try {
    const res = await http.request<T>({ url: endpoint, method, data });
    const ms = Date.now() - start;
    logger.debug(`[API] ← ${res.status} ${method} ${endpoint} (${ms} ms)`);
    logger.info('[API] body', res.data);
    return res.data;
  } catch (err: any) {
    const ms = Date.now() - start;
    logger.error(`[API] ✖ ${method} ${endpoint} (${ms} ms): ${err?.message}`);
    throw err;
  }
}

/* ─────────────────────────────────────────────────────────────
 * Types & high-level API functions
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

/** Auth */
export const getOtp = async (countryCode: string, phone: string) =>
  apiCall<SendOtpResponse>('/auth/sendotp', 'POST', { countryCode, phone });

export const resendOtp = async (countryCode: string, phone: string) =>
  apiCall<SendOtpResponse>('/auth/sendotp', 'POST', { countryCode, phone, isResend: true });

export const verifyOtp = async (countryCode: string, phone: string, otpCode: string) =>
  apiCall<VerifyOtpResponse>('/auth/verifyotp', 'POST', { countryCode, phone, otpCode });

export const refreshAccess = (refreshToken: string) =>
  apiCall<RefreshResponse>('/auth/refreshtoken', 'POST', { refreshToken });

/** Profile */
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

export type UpdateProfilePayload = {
  fullName?: string;
  dateOfBirth?: string; // DD-MM-YYYY
  gender?: 'male' | 'female';
  preferredLanguage?: string;
  phoneNumber?: string;
  phoneCountryCode?: string; // e.g., "+91"
  avatarKey?: string;
  // profilePicture?: string;
};

export type UpdateProfileResponse = {
  success: boolean;
  message?: string;
  data?: any | null;
};

export const updateProfile = (payload: UpdateProfilePayload) =>
  apiCall<UpdateProfileResponse>('/user/updateprofile', 'PATCH', payload);
