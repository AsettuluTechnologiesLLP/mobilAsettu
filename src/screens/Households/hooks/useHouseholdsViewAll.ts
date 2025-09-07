// src/screens/Households/hooks/useHouseholdsViewAll.ts
import { useFocusEffect } from '@react-navigation/native';
import { viewHouseholds, ViewHouseholdsResponse } from '@services/api';
import logger from '@utils/logger';
import { useCallback, useEffect, useState } from 'react';

export type HouseholdListItem = {
  id: string;
  name: string;
  ownerName: string;
  address: string;
  city: string;
  myRole: string;
  ownerDisplayName?: string | null;
  addressLine?: string | null;
  isUserOwner?: boolean | null;
  memberCount?: number | null;
  propertyOwnershipStatus?: string | null;
  occupancyStatus?: string | null;
  householdType?: string | null;
  updatedAt?: string | null;
};

const toInt = (v: any): number | null => {
  if (v == null) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = parseInt(String(v), 10);
  return Number.isNaN(n) ? null : n;
};
const toBool = (v: any): boolean | null => {
  if (v == null) return null;
  if (typeof v === 'boolean') return v;
  const s = String(v).toLowerCase();
  if (['true', 't', '1'].includes(s)) return true;
  if (['false', 'f', '0'].includes(s)) return false;
  return null;
};

/** ── Cache + Bus ── */
type CacheShape = {
  items: HouseholdListItem[];
  fetchedAt: number;
  error: string | null;
  inflight: Promise<void> | null;
};
const CACHE: CacheShape = { items: [], fetchedAt: 0, error: null, inflight: null };
const STALE_TIME_MS = 30_000;

// super-light pub/sub (in-file)
type Listener = () => void;
const LISTENERS = new Set<Listener>();
function notifyCacheChange() {
  for (const cb of Array.from(LISTENERS)) {
    try {
      cb();
    } catch (e) {
      /* no-op */
    }
  }
}

const mapApi = (data: ViewHouseholdsResponse['data']): HouseholdListItem[] =>
  (data || []).map((h: any) => {
    const base: HouseholdListItem = {
      id: h.household_id,
      name: h.household_name,
      ownerName: h.household_owner_name ?? h.owner_display_name ?? '',
      address: h.household_address ?? h.address_line_1 ?? '',
      city: h.household_city ?? '',
      myRole: h.my_role ?? '',
    };
    const roleUpper = String(base.myRole || '').toUpperCase();
    base.ownerDisplayName = h.owner_display_name ?? base.ownerName ?? null;
    base.addressLine = h.household_address ?? h.address_line_1 ?? base.address ?? null;
    const isUserOwnerFromApi = toBool(h.is_user_owner);
    base.isUserOwner =
      isUserOwnerFromApi !== null
        ? isUserOwnerFromApi
        : roleUpper === 'PRIMARY OWNER' || roleUpper === 'OWNER';
    base.memberCount = toInt(h.member_count);
    base.propertyOwnershipStatus = h.property_ownership_status ?? null;
    base.occupancyStatus = h.occupancy_status ?? null;
    base.householdType = h.household_type ?? null;
    base.updatedAt = h.updated_at ?? null;
    return base;
  });

async function _doFetch(): Promise<void> {
  const req = (async () => {
    const resp = await viewHouseholds();
    if (!resp?.success) throw new Error(resp?.message || 'Failed to fetch households');
    CACHE.items = mapApi(resp.data);
    CACHE.error = null;
    CACHE.fetchedAt = Date.now();
    logger.info('[HHList] fetch success', { count: CACHE.items.length });
  })();

  CACHE.inflight = req.finally(() => (CACHE.inflight = null));
  return CACHE.inflight;
}

/** ── Public cache mutators (used by other screens) ── */
export function upsertHouseholdInCache(item: HouseholdListItem) {
  const idx = CACHE.items.findIndex((x) => x.id === item.id);
  if (idx >= 0) CACHE.items[idx] = { ...CACHE.items[idx], ...item };
  else CACHE.items.unshift(item);
  CACHE.fetchedAt = Date.now();
  notifyCacheChange();
}
export function removeHouseholdFromCache(id: string) {
  const idx = CACHE.items.findIndex((x) => x.id === id);
  if (idx >= 0) CACHE.items.splice(idx, 1);
  CACHE.fetchedAt = Date.now();
  notifyCacheChange();
}

/** ── Hook ── */
export default function useHouseholdsViewAll() {
  const [households, setHouseholds] = useState<HouseholdListItem[]>(CACHE.items);
  const [loading, setLoading] = useState<boolean>(CACHE.items.length === 0);
  const [refreshing, setRefreshing] = useState<boolean>(false); // user pull-to-refresh
  const [softRefreshing, setSoftRefreshing] = useState<boolean>(false); // silent background refresh
  const [error, setError] = useState<string | null>(CACHE.error);

  const setFromCache = useCallback(() => {
    setHouseholds(CACHE.items.slice());
    setError(CACHE.error);
  }, []);

  const fetchFresh = useCallback(
    async (mode: 'load' | 'refresh', { silent = false } = {}) => {
      // Coalesce
      if (CACHE.inflight) {
        mode === 'load' ? setLoading(true) : silent ? setSoftRefreshing(true) : setRefreshing(true);
        try {
          await CACHE.inflight;
          setFromCache();
        } finally {
          setLoading(false);
          setRefreshing(false);
          setSoftRefreshing(false);
        }
        return;
      }

      if (mode === 'load') setLoading(true);
      else silent ? setSoftRefreshing(true) : setRefreshing(true);

      try {
        await _doFetch();
        setFromCache();
      } catch (e: any) {
        const msg = e?.message || 'Unable to load households';
        logger.error('[HHList] fetch error', msg);
        // keep old list → no flicker
        setError(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setSoftRefreshing(false);
      }
    },
    [setFromCache],
  );

  // Initial mount: hydrate, then maybe soft refresh if stale
  useEffect(() => {
    setFromCache();
    const stale = Date.now() - CACHE.fetchedAt > STALE_TIME_MS;
    if (CACHE.items.length === 0) fetchFresh('load');
    else if (stale) fetchFresh('refresh', { silent: true });

    // subscribe to cache bus → instant updates when other screens mutate cache
    const unsub = (() => {
      const cb = () => setFromCache();
      LISTENERS.add(cb);
      return () => LISTENERS.delete(cb);
    })();

    return () => {
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On focus: soft (silent) refresh if stale (prevents iOS spinner flicker)
  useFocusEffect(
    useCallback(() => {
      const stale = Date.now() - CACHE.fetchedAt > STALE_TIME_MS;
      if (stale) fetchFresh('refresh', { silent: true });
    }, [fetchFresh]),
  );

  // Public actions
  const refresh = useCallback(async () => {
    await fetchFresh('refresh', { silent: false }); // user pull → show spinner
  }, [fetchFresh]);

  const load = useCallback(async () => {
    if (CACHE.items.length === 0) await fetchFresh('load');
    else await fetchFresh('refresh', { silent: true });
  }, [fetchFresh]);

  return { households, loading, refreshing, softRefreshing, error, load, refresh };
}
