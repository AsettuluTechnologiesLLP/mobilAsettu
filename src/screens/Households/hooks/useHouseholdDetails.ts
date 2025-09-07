import { getHouseholdDetails, HouseholdDetailResponse } from '@services/api/householdApi';
import logger from '@utils/logger';
import { useCallback, useEffect, useRef, useState } from 'react';

import { HouseholdData } from '../model/householdTypes';

/**
 * Loads and manages Household Details (and exposes setData for optimistic updates).
 *
 * Usage:
 * const { data, loading, error, refresh, setData } = useHouseholdDetails(householdId);
 */
const useHouseholdDetails = (householdId: string) => {
  const [data, setHouseholdData] = useState<HouseholdData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!householdId) return;

    setLoading(true);
    setError(null);

    try {
      logger.info('HH:hook:load:start', { householdId });

      // Correct API that accepts an ID
      const response: HouseholdDetailResponse = await getHouseholdDetails(householdId);
      const { success, data: payload, message } = response;

      if (!success || !payload) {
        throw new Error(message || 'Failed to fetch household details');
      }

      if (isMounted.current) {
        setHouseholdData(payload as HouseholdData);
      }
      logger.info('HH:hook:load:success', {
        id: payload.id,
        version: payload.version,
      });
    } catch (err: any) {
      const msg = err?.message || 'Unknown error';
      logger.error('HH:hook:load:error', { error: msg });
      if (isMounted.current) setError(msg);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [householdId]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return {
    data,
    loading,
    error,
    refresh,
    // expose setData so callers can do optimistic updates
    setData: (updater: HouseholdData | ((prev: HouseholdData | null) => HouseholdData | null)) => {
      if (!isMounted.current) return;
      setHouseholdData((prev) =>
        typeof updater === 'function' ? (updater as any)(prev) : updater,
      );
    },
  };
};

export default useHouseholdDetails;
