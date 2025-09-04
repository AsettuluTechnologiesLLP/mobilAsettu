// src/screens/Households/hooks/useHouseholdView.ts
import { viewHousehold } from '@services/api';
import logger from '@utils/logger';
import { useCallback, useEffect, useState } from 'react';

import type { HouseholdDetailDTO } from '../model/households';

export default function useHouseholdView(householdId: string) {
  const [data, setData] = useState<HouseholdDetailDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      logger.info('useHouseholdView.load:start', { householdId });
      const resp = await viewHousehold(householdId);
      if (!resp?.success) {
        setData(null);
        setError(resp?.message || 'Failed to fetch household');
        logger.warn('useHouseholdView.load:non-success', { message: resp?.message });
      } else {
        setData(resp.data);
        logger.info('useHouseholdView.load:success', { id: resp.data?.id });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch household';
      setError(msg);
      setData(null);
      logger.error('useHouseholdView.load:error', { msg });
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const resp = await viewHousehold(householdId);
      setData(resp?.success ? resp.data : null);
      if (!resp?.success) setError(resp?.message || 'Failed to refresh household');
    } catch (err: any) {
      logger.error('useHouseholdView.refresh:error', { err: err?.message });
    } finally {
      setRefreshing(false);
    }
  }, [householdId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refreshing, error, refresh };
}
