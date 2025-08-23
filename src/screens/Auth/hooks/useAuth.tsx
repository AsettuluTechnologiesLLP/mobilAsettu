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

  logger.debug('[useAuth] AuthProvider >>>>>> Mounted');

  // When API-layer refresh fails, auto-logout cleanly
  useEffect(() => {
    logger.debug('[useAuth] EFFECT-0 >>>>>> Mounted');
    setUnauthorizedHandler(() => {
      logger.warn('[useAuth] onUnauthorized → logout()');
      logout();
    });
    return () => {
      setUnauthorizedHandler(null);
      logger.debug('[useAuth] EFFECT-0 <<<<<< Unmounted');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- stable callbacks ---
  const login = useCallback(async (tokens: { accessToken: string; refreshToken: string }) => {
    logger.debug('[useAuth] login(): persisting tokens', {
      access: mask(tokens.accessToken),
      refresh: mask(tokens.refreshToken),
    });

    // Persist to storage
    await AsyncStorage.multiSet([
      ['accessToken', tokens.accessToken],
      ['refreshToken', tokens.refreshToken],
    ]);

    // Sync to API layer (sets Authorization header globally)
    setAuthTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });

    logger.info('[useAuth] Status → Authenticated');
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    logger.debug('[useAuth] logout(): clearing tokens');
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);

    // Clear API layer headers/tokens
    setAuthTokens(null);

    logger.info('[useAuth] Status → UnAuthenticated');
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
        // Ensure API layer has current header (idempotent)
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
        // Store rotated tokens if provided
        await AsyncStorage.setItem('accessToken', res.accessToken);
        if (res.refreshToken) {
          await AsyncStorage.setItem('refreshToken', res.refreshToken);
        }
        // Sync to API layer
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

  // --- initial auth check on mount ---
  useEffect(() => {
    logger.debug('[useAuth] EFFECT-1 >>>>>> Mounted : With SplashDelay ', {
      splashMs: APP_CONFIG.SPLASH_DELAY_MS,
    });

    (async () => {
      try {
        // Enforce splash delay & read tokens in parallel
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
          // Keep API layer in sync
          setAuthTokens({ accessToken: access, refreshToken: refresh });
          logger.debug('[useAuth] Valid Access OK → Authenticated');
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
            logger.debug('[useAuth] Refresh OK → Authenticated');
            setStatus('authenticated');
            return;
          }
          logger.warn('[useAuth] Refresh returned Null/Invalid');
        }

        // No valid tokens
        setAuthTokens(null);
        logger.debug('[useAuth] No Valid Tokens → UnAuthenticated');
        setStatus('unauthenticated');
      } catch (e) {
        setAuthTokens(null);
        logger.error('[useAuth] Exception', e as any);
        setStatus('unauthenticated');
      }
    })();
    return () => {
      setUnauthorizedHandler(null);
      logger.debug('[useAuth] EFFECT-1 <<<<<< Unmounted');
    };
  }, []);

  // value memo depends on the stable callbacks + status
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

/** Try to refresh; returns new tokens (access + optional rotated refresh) or null */
async function tryRefresh(
  _refreshToken: string,
): Promise<{ accessToken: string; refreshToken?: string | null } | null> {
  try {
    const res = await refreshAccess(_refreshToken);

    // Accept both flat and nested shapes (defensive)
    const accessToken = (res as any).accessToken ?? (res as any).data?.accessToken ?? null;
    const newRefresh = (res as any).refreshToken ?? (res as any).data?.refreshToken ?? null;

    if (res?.success && accessToken) {
      logger.debug('[useAuth] tryRefresh(): ✓', {
        access: mask(accessToken),
        rotated: !!newRefresh,
      });
      return { accessToken, refreshToken: newRefresh };
    }

    logger.warn('⚠️ [useAuth] tryRefresh(): unsuccessful payload', res);
  } catch (e: any) {
    logger.error('[useAuth] tryRefresh(): refresh call failed', e?.message);
  }
  return null;
}
