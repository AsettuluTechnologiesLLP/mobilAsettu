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

// ─────────────────────────────── component ───────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking');

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
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    logger.debug('[useAuth] logout(): clearing tokens');
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);

    setAuthTokens(null);
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
        logger.debug('[useAuth] refreshIfNeeded(): access valid → no refresh');
        return;
      }

      if (!refresh) {
        logger.debug('[useAuth] refreshIfNeeded(): no refresh token → unauthenticated');
        setAuthTokens(null);
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

  useEffect(() => {
    logger.debug('[useAuth] Splash Delay : ', {
      splashMs: APP_CONFIG.SPLASH_DELAY_MS,
    });

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
          setStatus('authenticated');
          return;
        }

        if (refresh) {
          logger.debug('[useAuth] Attempting refresh with existing refresh token');
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
            setStatus('authenticated');
            return;
          }
          logger.warn('[useAuth] Refresh returned Null/Invalid');
        }

        setAuthTokens(null);
        setStatus('unauthenticated');
      } catch (e) {
        setAuthTokens(null);
        logger.error('[useAuth] Exception', e as any);
        setStatus('unauthenticated');
      }
    })();
    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const value = useMemo(
    () => ({ status, login, logout, refreshIfNeeded }),
    [status, login, logout, refreshIfNeeded],
  );

  logger.debug('[useAuth] Status : ', { status });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

async function tryRefresh(
  _refreshToken: string,
): Promise<{ accessToken: string; refreshToken?: string | null } | null> {
  try {
    const res = await refreshAccess(_refreshToken);

    const accessToken = (res as any).accessToken ?? (res as any).data?.accessToken ?? null;
    const newRefresh = (res as any).refreshToken ?? (res as any).data?.refreshToken ?? null;

    if (res?.success && accessToken) {
      return { accessToken, refreshToken: newRefresh };
    }

    logger.warn('⚠️ [useAuth] tryRefresh(): unsuccessful payload', res);
  } catch (e: any) {
    logger.error('[useAuth] tryRefresh(): refresh call failed', e?.message);
  }
  return null;
}
