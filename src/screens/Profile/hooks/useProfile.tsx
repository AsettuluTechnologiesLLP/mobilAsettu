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

type Profile = {
  id?: string;
  name?: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
  avatarUrl?: string;
  avatarKey?: string;
  gender?: string;
  dateOfBirth?: string; // ISO
  preferredLanguage?: string;
  isProfileComplete?: boolean;
  createdAt?: string; // ISO
  updatedAt?: string | number; // ISO or number from client
};

type ProfileContextValue = {
  profile: Profile | null;
  loading: boolean;
  error?: string | null;
  lastFetched: number | null;
  refresh: (opts?: { force?: boolean }) => Promise<void>;
  refreshIfStale: () => void;
  setLocal: (patch: Partial<Profile>) => void; // optimistic local update
  clear: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

const STORAGE_KEY = 'PROFILE_CACHE_V1';
const TTL_MS = 10 * 60 * 1000;

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth(); // 'checking' | 'unauthenticated' | 'authenticated'
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const dirtyRef = useRef(false);

  const inFlightRef = useRef(false);
  const lastKickRef = useRef(0);
  const COOLDOWN_MS = 1200;
  const didInitialAuthFetchRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as { profile: Profile; lastFetched: number };
          setProfile(cached.profile);
          setLastFetched(cached.lastFetched);
          logger.debug('[Profile] cache loaded');
        }
      } catch (e: any) {
        logger.warn('[Profile] cache load failed', e?.message);
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
    async ({ force = false }: { force?: boolean } = {}) => {
      if (inFlightRef.current) return;
      const now = Date.now();
      if (!force && now - lastKickRef.current < COOLDOWN_MS) {
        return;
      }
      lastKickRef.current = now;

      if (!force && !isStale()) return;

      inFlightRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const res = await apiGetProfile();
        const d = (res as any)?.data ?? res;

        const normalized: Profile = {
          id: d?.user_id,
          name: d?.full_name,
          phoneNumber: d?.phoneNumber,
          phoneCountryCode: d?.phoneCountryCode,
          avatarUrl: d?.profile_picture ?? undefined,
          avatarKey: d?.avatarKey ?? undefined,
          gender: d?.gender ?? undefined,
          dateOfBirth: d?.date_of_birth ?? undefined,
          preferredLanguage: d?.preferred_language ?? undefined,
          isProfileComplete: !!d?.is_profile_complete,
          createdAt: d?.created_at ?? undefined,
          updatedAt: d?.updated_at ?? Date.now(),
        };

        await persist(normalized, Date.now());
        dirtyRef.current = false;
        logger.debug('[Profile] refresh ✓');
      } catch (e: any) {
        setError(e?.message || 'Failed to load profile');
        logger.warn('[Profile] refresh ✗', e?.message);
      } finally {
        inFlightRef.current = false;
        setLoading(false);
      }
    },
    [isStale, persist],
  );

  const refreshIfStale = useCallback(() => {
    if (isStale()) refresh().catch(() => {});
  }, [isStale, refresh]);

  const setLocal = useCallback((patch: Partial<Profile>) => {
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

  useEffect(() => {
    if (status === 'authenticated') {
      if (didInitialAuthFetchRef.current) return;
      didInitialAuthFetchRef.current = true;
      refresh({ force: true }).catch(() => {});
    } else if (status === 'unauthenticated') {
      didInitialAuthFetchRef.current = false;
      clear().catch(() => {});
    }
  }, [status, refresh, clear]);

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
