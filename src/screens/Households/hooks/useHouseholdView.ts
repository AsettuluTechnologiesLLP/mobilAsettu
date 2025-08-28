// src/screens/Households/hooks/useHouseholdView.ts
import { viewHousehold, ViewHouseholdResponse } from '@services/api';
import logger from '@utils/logger';
import { useCallback, useEffect, useState } from 'react';

import type { HouseholdDetailDTO } from '../model/households';
import { withViewerOwnership } from '../model/households';

export default function useHouseholdView(householdId: string) {
  const [data, setData] = useState<HouseholdDetailDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!householdId) {
      setData(null);
      setLoading(false);
      setError('Missing householdId');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      logger.info('useHouseholdView.load:start', { householdId });
      const resp: ViewHouseholdResponse = await viewHousehold(householdId);
      if (!resp?.success) {
        const msg = resp?.message || 'Failed to fetch household';
        logger.warn('useHouseholdView.load:non-success', { msg });
        setData(null);
        setError(msg);
      } else {
        const normalized = withViewerOwnership(resp.data);
        setData(normalized);
        logger.info('useHouseholdView.load:success', {
          id: normalized.id,
          role: normalized.my?.role,
          ownersActive: normalized.counts?.ownersActive,
          membersActive: normalized.counts?.membersActive,
        });
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch household';
      logger.error('useHouseholdView.load:error', { msg });
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  const refresh = useCallback(async () => {
    if (!householdId) return;
    setRefreshing(true);
    try {
      const resp: ViewHouseholdResponse = await viewHousehold(householdId);
      setData(resp?.success ? withViewerOwnership(resp.data) : null);
    } catch (err: any) {
      logger.error('useHouseholdView.refresh:error', { err: err?.message });
    } finally {
      setRefreshing(false);
    }
  }, [householdId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refreshing, error, load, refresh };
}
