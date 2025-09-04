import { useFocusEffect } from '@react-navigation/native';
import { viewHouseholds, ViewHouseholdsResponse } from '@services/api';
import logger from '@utils/logger';
import { useCallback, useState } from 'react';

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

export default function useHouseholdsViewAll() {
  const [households, setHouseholds] = useState<HouseholdListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      logger.info('useHouseholdsViewAll.load:start');
      const resp = await viewHouseholds();
      if (!resp?.success) {
        logger.warn('useHouseholdsViewAll.load:non-success', { message: resp?.message });
        setHouseholds([]);
        setError(resp?.message || 'Failed to fetch households');
      } else {
        const mapped = mapApi(resp.data);
        setHouseholds(mapped);
        logger.info('useHouseholdsViewAll.load:success', { count: mapped.length });
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch households';
      logger.error('useHouseholdsViewAll.load:error', { msg });
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const resp = await viewHouseholds();
      setHouseholds(resp?.success ? mapApi(resp.data) : []);
    } catch (err: any) {
      logger.error('useHouseholdsViewAll.refresh:error', { err: err?.message });
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ✅ single source of truth: fetch when screen is focused
  useFocusEffect(
    useCallback(() => {
      load();
      return () => {}; // optional: cancel in-flight request if you add abort logic
    }, [load]),
  );

  return { households, loading, refreshing, error, load, refresh };
}
