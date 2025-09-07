import {
  getHouseholdOccupancyStatuses,
  getHouseholdOwnershipStatuses,
  getHouseholdTypes,
  type IdName,
} from '@services/api/householdApi';
import logger from '@utils/logger';
import { useCallback, useEffect, useState } from 'react';

type CacheShape = {
  types: IdName[];
  ownership: IdName[];
  occupancy: IdName[];
  fetchedAt: number;
  inflight: Promise<void> | null;
  error: string | null;
};

const CACHE: CacheShape = {
  types: [],
  ownership: [],
  occupancy: [],
  fetchedAt: 0,
  inflight: null,
  error: null,
};

const STALE_MS = 24 * 60 * 60 * 1000; // 24h

async function _fetchAll(): Promise<void> {
  const req = (async () => {
    const [t, o, oc] = await Promise.all([
      getHouseholdTypes(),
      getHouseholdOwnershipStatuses(),
      getHouseholdOccupancyStatuses(),
    ]);
    if (!t?.success) throw new Error(t?.message || 'Failed to load household types');
    if (!o?.success) throw new Error(o?.message || 'Failed to load ownership statuses');
    if (!oc?.success) throw new Error(oc?.message || 'Failed to load occupancy statuses');

    CACHE.types = t.data || [];
    CACHE.ownership = o.data || [];
    CACHE.occupancy = oc.data || [];
    CACHE.error = null;
    CACHE.fetchedAt = Date.now();
    logger.info('[HHCreateRefs] loaded', {
      types: CACHE.types.length,
      ownership: CACHE.ownership.length,
      occupancy: CACHE.occupancy.length,
    });
  })();

  CACHE.inflight = req.finally(() => (CACHE.inflight = null));
  return CACHE.inflight;
}

export default function useHouseholdCreateRefs() {
  const [types, setTypes] = useState<IdName[]>(CACHE.types);
  const [ownership, setOwnership] = useState<IdName[]>(CACHE.ownership);
  const [occupancy, setOccupancy] = useState<IdName[]>(CACHE.occupancy);
  const [loading, setLoading] = useState<boolean>(CACHE.types.length === 0);
  const [error, setError] = useState<string | null>(CACHE.error);

  const setFromCache = useCallback(() => {
    setTypes(CACHE.types.slice());
    setOwnership(CACHE.ownership.slice());
    setOccupancy(CACHE.occupancy.slice());
    setError(CACHE.error);
  }, []);

  const fetchFresh = useCallback(async () => {
    if (CACHE.inflight) {
      setLoading(true);
      try {
        await CACHE.inflight;
        setFromCache();
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    try {
      await _fetchAll();
      setFromCache();
    } catch (e: any) {
      const msg = e?.message || 'Unable to load reference data';
      logger.error('[HHCreateRefs] error', msg);
      CACHE.error = msg;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [setFromCache]);

  useEffect(() => {
    setFromCache();
    const stale = Date.now() - CACHE.fetchedAt > STALE_MS;
    if (CACHE.types.length === 0 || stale) {
      // soft fetch; show loader only on first ever mount
      fetchFresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    await fetchFresh();
  }, [fetchFresh]);

  return {
    typeOptions: types,
    ownershipOptions: ownership,
    occupancyOptions: occupancy,
    loading,
    error,
    refresh,
  };
}
