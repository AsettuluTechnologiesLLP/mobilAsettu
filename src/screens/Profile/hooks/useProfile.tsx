// src/screens/Profile/hooks/useProfile.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@screens/Auth/hooks/useAuth';
import { getProfile as apiGetProfile } from '@services/api';
import logger from '@utils/logger';
import React, {
  createContext,
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
  dateOfBirth?: string; // ISO
  preferredLanguage?: string;
  isProfileComplete?: boolean | Record<string, any>;
  createdAt?: string; // ISO
  updatedAt?: string | number; // ISO or number from client
};

type ProfileContextValue = {
  profile: Profile | null;
  loading: boolean;
  error?: string | null;
  lastFetched: number | null;
  refresh: (opts?: { force?: boolean; source?: string }) => Promise<void>;
  refreshIfStale: () => void;
  setLocal: (patch: Partial<Profile>) => void; // optimistic local update
  clear: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

const STORAGE_KEY = 'PROFILE_CACHE_V1';
const TTL_MS = 10 * 60 * 1000; // 10 min
const COOLDOWN_MS = 1500; // dedupe accidental bursts

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth(); // 'checking' | 'unauthenticated' | 'authenticated'

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const dirtyRef = useRef(false);
  const inFlightRef = useRef(false);
  const lastKickRef = useRef(0);
  const didInitialAuthFetchRef = useRef(false);

  // hydrate cache on mount
  useEffect(() => {
    logger.debug('[useProfile] EFFECT-0 Mounted');
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as { profile: Profile; lastFetched: number };
          setProfile(cached.profile);
          setLastFetched(cached.lastFetched);
          logger.debug('[useProfile] cache loaded');
        }
      } catch (e: any) {
        logger.warn('[useProfile] cache load failed', e?.message);
      }
    })();
    return () => logger.debug('[useProfile] EFFECT-0 Unmounted');
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
      logger.warn('[Profile] cache save failed', e?.message);
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
    async ({ force = false, source = 'unknown' }: { force?: boolean; source?: string } = {}) => {
      if (inFlightRef.current) {
        logger.debug('[Profile] refresh skipped (in-flight)', { source });
        return;
      }

      const now = Date.now();
      const bypassCooldown = source === 'after-save'; // ← allow after-save to always fetch

      if (!bypassCooldown && now - lastKickRef.current < COOLDOWN_MS) {
        logger.debug('[Profile] refresh skipped (cooldown)', { source });
        return;
      }
      lastKickRef.current = now;

      if (!force && !isStale()) {
        logger.debug('[Profile] refresh skipped (not stale)', { source });
        return;
      }

      setLoading(true);
      setError(null);
      inFlightRef.current = true;
      logger.info('[Profile] refresh → getProfile', { source });

      try {
        const res = await apiGetProfile();
        const d = (res as any)?.data ?? res;

        const normalized: Profile = {
          id: d?.user_id,
          name: d?.full_name,
          email: d?.email ?? undefined,
          gender: d?.gender ?? undefined,
          dateOfBirth: d?.date_of_birth ?? undefined,
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
        logger.debug('[Profile] refresh ✓', { source });
      } catch (e: any) {
        setError(e?.message || 'Failed to load profile');
        logger.warn('[Profile] refresh ✗', { source, message: e?.message });
      } finally {
        inFlightRef.current = false;
        setLoading(false);
      }
    },
    [isStale, persist],
  );

  const refreshIfStale = useCallback(() => {
    if (isStale()) refresh({ source: 'refreshIfStale' }).catch(() => {});
  }, [isStale, refresh]);

    setProfile((prev) => {
      const next = { ...(prev || {}), ...patch };
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ profile: next, lastFetched: Date.now() }),
      ).catch(() => {});
      return next;
    });
    dirtyRef.current = true;
  }, []);

  // keep latest refresh/clear in refs so auth effect depends only on `status`
  const refreshRef = useRef(refresh);
  const clearRef = useRef(clear);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);
  useEffect(() => {
    clearRef.current = clear;
  }, [clear]);

  // fetch ONCE on login; clear on logout
  useEffect(() => {
    logger.debug('[useProfile] EFFECT-1 Auth status changed :', status);

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

    return () => logger.debug('[useProfile] EFFECT-1 Unmounted');
  }, [status]); // only status → no loops

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

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within <ProfileProvider>');
  return ctx;
}
