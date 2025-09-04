// src/screens/Profile/hooks/useProfile.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@screens/Auth/hooks/useAuth';
import { getProfile as apiGetProfile } from '@services/api';
import logger from '@utils/logger';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type Profile = {
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
  avatarUrl?: string;
  avatarKey?: string;
  gender?: 'male' | 'female' | string;
  dateOfBirth?: string;
  preferredLanguage?: string;
  isProfileComplete?: boolean | Record<string, any>;
  createdAt?: string;
  updatedAt?: string | number;
};

type RefreshOpts = { force?: boolean; source?: string };

type ProfileContextValue = {
  profile: Profile | null;
  loading: boolean;
  error?: string | null;
  lastFetched: number | null;

  refresh: (opts?: RefreshOpts) => Promise<void>;

  refreshIfStale: () => void;

  setLocal: (patch: Partial<Profile>) => void;

  clear: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

const STORAGE_KEY = 'PROFILE_CACHE_V1';
const TTL_MS = 10 * 60 * 1000;
const COOLDOWN_MS = 1500;

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { status } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const dirtyRef = useRef(false);
  const inFlightRef = useRef(false);
  const lastKickRef = useRef(0);
  const didInitialAuthFetchRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as { profile: Profile; lastFetched: number };
          setProfile(cached.profile);
          setLastFetched(cached.lastFetched);
        }
      } catch (e: any) {
        logger.warn('[useProfile] cache load failed', e?.message);
      }
    })();
  }, []);

  const persist = useCallback(async (p: Profile, fetchedAt: number) => {
    setProfile(p);
    setLastFetched(fetchedAt);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ profile: p, lastFetched: fetchedAt }),
      );
    } catch (e: any) {
      logger.warn('[useProfile] cache save failed', e?.message);
    }
  }, []);

  const clear = useCallback(async () => {
    setProfile(null);
    setLastFetched(null);
    setError(null);
    dirtyRef.current = false;
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const isStale = useCallback(() => {
    if (!lastFetched) return true;
    if (dirtyRef.current) return true;
    return Date.now() - lastFetched > TTL_MS;
  }, [lastFetched]);

  const refresh = useCallback(
    async ({ force = false, source = 'unknown' }: RefreshOpts = {}) => {
      if (inFlightRef.current) {
        logger.debug('[useProfile] refresh skipped (in-flight)', { source });
        return;
      }

      const now = Date.now();
      const bypassCooldown = source === 'after-save'; // always fetch right after a save
      if (!bypassCooldown && now - lastKickRef.current < COOLDOWN_MS) {
        logger.debug('[useProfile] refresh skipped (cooldown)', { source });
        return;
      }
      lastKickRef.current = now;

      if (!force && !isStale()) {
        logger.debug('[useProfile] refresh skipped (not stale)', { source });
        return;
      }

      setLoading(true);
      setError(null);
      inFlightRef.current = true;

      try {
        const res = await apiGetProfile();
        const d = (res as any)?.data ?? res;

        const normalized: Profile = {
          id: d?.user_id,
          name: d?.full_name,
          email: d?.email ?? undefined,
          gender: d?.gender ?? undefined,
          dateOfBirth: d?.date_of_birth ?? undefined, // ISO
          phoneNumber: d?.phone ?? d?.phoneNumber ?? undefined,
          phoneCountryCode: d?.country_code ?? d?.phoneCountryCode ?? undefined,
          avatarUrl: d?.profile_picture ?? d?.avatar_picture ?? undefined,
          preferredLanguage: d?.preferred_language ?? undefined,
          isProfileComplete: d?.is_profile_complete ?? undefined,
          createdAt: d?.created_at ?? undefined,
          updatedAt: d?.updated_at ?? Date.now(),
        };

        await persist(normalized, Date.now());
        dirtyRef.current = false;
      } catch (e: any) {
        setError(e?.message || 'Failed to load profile');
        logger.warn('[useProfile] refresh ✗', { source, message: e?.message });
      } finally {
        inFlightRef.current = false;
        setLoading(false);
      }
    },
    [isStale, persist],
  );

  const refreshIfStale = useCallback(() => {
    if (isStale()) {
      refresh({ source: 'refreshIfStale' }).catch(() => {});
    }
  }, [isStale, refresh]);

  const setLocal = useCallback((partial: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...(prev || {}), ...partial };
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ profile: next, lastFetched: Date.now() }),
      ).catch(() => {});
      return next;
    });
    dirtyRef.current = true;
  }, []);

  const refreshRef = useRef(refresh);
  const clearRef = useRef(clear);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);
  useEffect(() => {
    clearRef.current = clear;
  }, [clear]);

  useEffect(() => {
    if (status === 'authenticated') {
      if (didInitialAuthFetchRef.current) return;
      didInitialAuthFetchRef.current = true;
      Promise.resolve().then(() => {
        refreshRef.current({ force: true, source: 'auth-login' }).catch(() => {});
      });
    } else if (status === 'unauthenticated') {
      didInitialAuthFetchRef.current = false;
      clearRef.current().catch(() => {});
    }
  }, [status]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      loading,
      error,
      lastFetched,
      refresh,
      refreshIfStale,
      setLocal,
      clear,
    }),
    [profile, loading, error, lastFetched, refresh, refreshIfStale, setLocal, clear],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within <ProfileProvider>');
  return ctx;
}
