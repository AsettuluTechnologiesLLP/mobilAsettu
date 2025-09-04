// src/screens/Profile/hooks/useProfile.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@screens/Auth/hooks/useAuth';
import { getProfile as apiGetProfile } from '@services/api/profileApi';
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
  email?: string | null;
  phoneNumber?: string;
  phoneCountryCode?: string;
  avatarUrl?: string;
  avatarKey?: string;
  gender?: string;
  dateOfBirth?: string | null;
  preferredLanguage?: string | null;
  isProfileComplete?: any;
  createdAt?: string;
  updatedAt?: string | number;
};

type ProfileContextValue = {
  profile: Profile | null;
  loading: boolean;
  error?: string | null;
  lastFetched: number | null;
  refresh: (opts?: { force?: boolean; source?: string }) => Promise<void>;
  refreshIfStale: () => void;
  setLocal: (patch: Partial<Profile>) => void;
  clear: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

const STORAGE_KEY = 'PROFILE_CACHE_V1';
const TTL_MS = 5 * 60 * 1000;
const COOLDOWN_MS = 1000;

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth(); // 'checking' | 'unauthenticated' | 'authenticated'
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const inFlightRef = useRef(false);
  const lastKickRef = useRef(0);
  const didInitialAuthFetchRef = useRef(false);
  const dirtyRef = useRef(false);

  // load cache
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
    async ({ force = false }: { force?: boolean; source?: string } = {}) => {
      if (inFlightRef.current) return;
      const now = Date.now();
      if (!force && now - lastKickRef.current < COOLDOWN_MS) return;
      lastKickRef.current = now;

      if (!force && !isStale()) return;

      inFlightRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const d = await apiGetProfile();

        const normalized: Profile = {
          id: d.userId,
          name: d.fullName ?? '',
          email: d.email ?? null, // make sure Profile has `email?: string | null`
          gender: d.gender ?? undefined,
          dateOfBirth: d.dateOfBirth ?? null, // "DD-MM-YYYY" string from backend
          phoneCountryCode: d.countryCode ?? '',
          phoneNumber: d.phone ?? '',
          avatarUrl: d.avatarPicture ?? undefined,
          preferredLanguage: d.preferredLanguage ?? undefined,
          isProfileComplete: d.isProfileComplete ?? undefined,
          createdAt: d.createdAt ?? undefined,
          updatedAt: d.updatedAt ?? Date.now(),
        };

        await persist(normalized, Date.now());
        dirtyRef.current = false;
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
      const next = { ...(prev || {}), ...patch } as Profile;
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
      refresh({ force: true, source: 'auth-mounted' }).catch(() => {});
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
