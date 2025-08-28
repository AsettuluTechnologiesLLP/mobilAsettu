// src/services/api/householdApi.ts
import type { HouseholdDetailDTO } from '../../screens/Households/model/households';
import { apiCall } from '../http/call';

/** -------------------------
 *  LIST MY HOUSEHOLDS
 *  ------------------------- */
export type ViewHouseholdsItemApi = {
  household_id: string;
  household_name: string;
  household_owner_name: string;
  household_address: string;
  household_city: string;
  my_role: string;
};

export type ViewHouseholdsResponse = {
  success: boolean;
  message?: string;
  data: ViewHouseholdsItemApi[];
};

export const viewHouseholds = () =>
  apiCall<ViewHouseholdsResponse>('/household/viewhouseholds', 'GET');

/** -------------------------
 *  GET ONE HOUSEHOLD (DETAILS)
 *  ------------------------- */
export type ViewHouseholdResponse = {
  success: boolean;
  message?: string;
  data: HouseholdDetailDTO; // ← strongly typed to our details DTO
};

export const viewHousehold = (householdId: string) =>
  apiCall<ViewHouseholdResponse>(`/household/view/${householdId}`, 'GET');
