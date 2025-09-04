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
  data: HouseholdDetailDTO;
};

export const viewHousehold = (householdId: string) =>
  apiCall<ViewHouseholdResponse>(`/household/view/${householdId}`, 'GET');

/** -------------------------
 *  UPDATE HOUSEHOLD (PATCH)
 *  ------------------------- */
export type UpdateHouseholdPayload = {
  name?: string;
  statuses?: {
    propertyOwnership?: string | null;
    occupancy?: string | null;
    type?: string | null;
  };
  version: string;
};

export type UpdateHouseholdResponse = {
  success: boolean;
  message?: string;
  data: HouseholdDetailDTO;
};

export const updateHousehold = (householdId: string, payload: UpdateHouseholdPayload) =>
  apiCall<UpdateHouseholdResponse>(`/household/update/${householdId}`, 'PATCH', payload);

/** ========================================================================
 *  MEMBERS — ADD (matches your backend: POST /api/householdmembers/add/:id)
 *  ======================================================================== */
export type AddHouseholdMemberPayload = {
  phone: string; // "9686600098" (digits only)
  countryCode: string; // "+91"
  roleId: number; // 1..4 (PRIMARY_OWNER, OWNER, MEMBER, TENANT)
};

export type AddHouseholdMemberResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
};

/** Map role name → ID (case-insensitive).
 *  Defaults to TENANT (4) if unknown. */
export const mapRoleNameToId = (name: string): number => {
  const key = (name || '').trim().toUpperCase();
  switch (key) {
    case 'PRIMARY OWNER':
    case 'PRIMARY_OWNER':
    case 'PRIMARYOWNER':
      return 1;
    case 'OWNER':
      return 2;
    case 'MEMBER':
      return 3;
    case 'TENANT':
      return 4;
    default:
      return 4; // safe default
  }
};

export const addHouseholdMember = (householdId: string, payload: AddHouseholdMemberPayload) =>
  apiCall<AddHouseholdMemberResponse>(
    `/householdmembers/add/${householdId}`, // note: client prefixes with /api
    'POST',
    payload,
  );

/** -------------------------
 *  (Existing planned endpoints — keep as-is if you use them later)
 *  ------------------------- */
export type InviteMemberPayload = { phone: string; roleName: string; version: string };
export type InviteMemberResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
};
export const inviteMember = (householdId: string, payload: InviteMemberPayload) =>
  apiCall<InviteMemberResponse>(`/household/${householdId}/members`, 'POST', payload);

export type ChangeMemberRolePayload = { roleName: string; version: string };
export type ChangeMemberRoleResponse = { success: boolean; message?: string; data?: unknown };
export const changeMemberRole = (
  householdId: string,
  memberId: string,
  payload: ChangeMemberRolePayload,
) =>
  apiCall<ChangeMemberRoleResponse>(
    `/household/${householdId}/members/${memberId}/role`,
    'PATCH',
    payload,
  );

export type RemoveMemberPayload = { version: string };
export type RemoveMemberResponse = { success: boolean; message?: string; data?: unknown };
export const removeMember = (householdId: string, memberId: string, payload: RemoveMemberPayload) =>
  apiCall<RemoveMemberResponse>(`/household/${householdId}/members/${memberId}`, 'DELETE', payload);
