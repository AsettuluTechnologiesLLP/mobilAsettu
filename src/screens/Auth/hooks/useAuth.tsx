// src/screens/Auth/hooks/useAuth.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthTokens, setUnauthorizedHandler } from '@services/api';
import { Buffer } from 'buffer';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import APP_CONFIG from '../../../constants/appConfig';
import { refreshAccess } from '../../../services/api';
import logger from '../../../utils/logger';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

type AuthContextType = {
  status: AuthStatus;
  login: (tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshIfNeeded: () => Promise<void>;
  /** NEW: always a string; '' when unknown */
  userId: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

// ───────────────────────────────── helpers ─────────────────────────────────
const mask = (s?: string | null) => {
  if (!s) return '(none)';
  const len = s.length;
  const head = s.slice(0, 8);
  const tail = s.slice(-4);
  return `${head}…${tail} (len=${len})`;
};

const decodeJwtPayload = (token: string): any | null => {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const json = Buffer.from(payloadPart.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
      'utf8',
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getJwtExp = (token: string): number | null => {
  const payload = decodeJwtPayload(token);
  return payload && typeof payload.exp === 'number' ? payload.exp : null;
};

function isAccessTokenValid(token: string) {
  const now = Math.floor(Date.now() / 1000);
  const exp = getJwtExp(token);
  const valid = !!exp && exp > now + 15; // 15s buffer
  logger.debug('[useAuth] Access validity check', { exp, now, valid });
  return valid;
}

/** NEW: extract a best-effort user id from the access token payload */
const extractUserId = (token?: string | null): string => {
  if (!token) return '';
  const p = decodeJwtPayload(token);
  return (p?.sub || p?.userId || p?.uid || '') as string;
};

// ─────────────────────────────── component ───────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking');
  /** NEW: user id state synced with current access token */
  const [userId, setUserId] = useState<string>('');

  // If any API call returns 401 via your client, this will be invoked.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => {
      setUnauthorizedHandler(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (tokens: { accessToken: string; refreshToken: string }) => {
    await AsyncStorage.multiSet([
      ['accessToken', tokens.accessToken],
      ['refreshToken', tokens.refreshToken],
    ]);

    setAuthTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    setUserId(extractUserId(tokens.accessToken)); // ← NEW
    logger.debug('[useAuth] login(): tokens saved', {
      access: mask(tokens.accessToken),
      refresh: mask(tokens.refreshToken),
    });
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    logger.debug('[useAuth] logout(): clearing tokens');
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    setAuthTokens(null);
    setUserId(''); // ← NEW
    setStatus('unauthenticated');
  }, []);

  const refreshIfNeeded = useCallback(async () => {
    logger.debug('[useAuth] refreshIfNeeded()');
    try {
      const [access, refresh] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('refreshToken'),
      ]);
      logger.debug('[useAuth] refreshIfNeeded(): tokens', {
        access: mask(access),
        refresh: mask(refresh),
      });

      if (access && isAccessTokenValid(access)) {
        setAuthTokens({ accessToken: access, refreshToken: refresh });
        setUserId(extractUserId(access)); // ← NEW
        logger.debug('[useAuth] refreshIfNeeded(): access valid → no refresh');
        return;
      }

      if (!refresh) {
        logger.debug('[useAuth] refreshIfNeeded(): no refresh token → unauthenticated');
        setAuthTokens(null);
        setUserId(''); // ← NEW
        setStatus('unauthenticated');
        return;
      }

      logger.debug('[useAuth] refreshIfNeeded(): trying refresh');
      const res = await tryRefresh(refresh);
      if (res?.accessToken) {
        await AsyncStorage.setItem('accessToken', res.accessToken);
        if (res.refreshToken) {
          await AsyncStorage.setItem('refreshToken', res.refreshToken);
        }
        setAuthTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken ?? refresh });
        setUserId(extractUserId(res.accessToken)); // ← NEW
        logger.debug('[useAuth] refreshIfNeeded(): Status → Authenticated');
        setStatus('authenticated');
      } else {
        logger.warn('[useAuth] refreshIfNeeded(): refresh failed → logout');
        await logout();
      }
    } catch (e) {
      logger.error('[useAuth] refreshIfNeeded(): exception', e as any);
      await logout();
    }
  }, [logout]);

  // Boot: show splash, then hydrate tokens → set status and userId accordingly
  useEffect(() => {
    logger.debug('[useAuth] Splash Delay : ', { splashMs: APP_CONFIG.SPLASH_DELAY_MS });

    (async () => {
      try {
        const delay = new Promise<void>((resolve) =>
          setTimeout(resolve, APP_CONFIG.SPLASH_DELAY_MS),
        );

        const [access, refresh] = await Promise.all([
          AsyncStorage.getItem('accessToken'),
          AsyncStorage.getItem('refreshToken'),
          delay,
        ]);

        logger.debug('[useAuth] Tokens@boot', {
          access: mask(access),
          refresh: mask(refresh),
        });

        if (access && isAccessTokenValid(access)) {
          setAuthTokens({ accessToken: access, refreshToken: refresh });
          setUserId(extractUserId(access)); // ← NEW
          setStatus('authenticated');
          return;
        }

        if (refresh) {
          const res = await tryRefresh(refresh);
          if (res?.accessToken) {
            await AsyncStorage.setItem('accessToken', res.accessToken);
            if (res.refreshToken) {
              await AsyncStorage.setItem('refreshToken', res.refreshToken);
            }
            setAuthTokens({
              accessToken: res.accessToken,
              refreshToken: res.refreshToken ?? refresh,
            });
            setUserId(extractUserId(res.accessToken)); // ← NEW
            setStatus('authenticated');
            return;
          }
          logger.warn('[useAuth] Refresh returned Null/Invalid');
        }

        setAuthTokens(null);
        setUserId(''); // ← NEW
        setStatus('unauthenticated');
      } catch (e) {
        setAuthTokens(null);
        setUserId(''); // ← NEW
        logger.error('[useAuth] Exception', e as any);
        setStatus('unauthenticated');
      }
    })();

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const value = useMemo(
    () => ({ status, login, logout, refreshIfNeeded, userId }), // ← NEW
    [status, login, logout, refreshIfNeeded, userId],
  );

  logger.debug('[useAuth] Status : ', { status, userId });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Public hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

// ─────────────────────────── refresh helper ───────────────────────────
async function tryRefresh(
  _refreshToken: string,
): Promise<{ accessToken: string; refreshToken?: string } | null> {
  try {
    const res = await refreshAccess(_refreshToken);

    const accessToken = (res as any).accessToken ?? (res as any).data?.accessToken ?? null;
    const newRefresh = (res as any).refreshToken ?? (res as any).data?.refreshToken ?? null;

    if ((res as any)?.success && accessToken) {
      return { accessToken, refreshToken: newRefresh ?? undefined };
    }

    logger.warn('⚠️ [useAuth] tryRefresh(): unsuccessful payload', res);
  } catch (e: any) {
    logger.error('[useAuth] tryRefresh(): refresh call failed', e?.message);
  }
  return null;
}
