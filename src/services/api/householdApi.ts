// src/services/api/householdApi.ts
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
 *  HOUSEHOLD DETAILS (read)
 *  ------------------------- */
export type IdName = { id: number; name: string };

export type HouseholdDetailDTO = {
  id: string;
  name: string;
  owner: { name: string; phone: string };
  address: { line1: string; city: string; state: string; pincode: string };
  statuses: {
    propertyOwnership: string; // e.g. "Owned"
    occupancy: string; // e.g. "Rented"
    type: string; // e.g. "Apartment Flat"
    viewerPropertyOwnership: string;
  };
  members: Array<{ userId: string; name: string; role: string; status: string }>;
  counts: { membersActive: number; ownersActive: number; otherOwnersActive: number };
  my: { role: string; isOwner: boolean; membershipStatus: string };
  permissions: {
    canEdit: boolean;
    canInvite: boolean;
    canRemoveMembers: boolean;
    canTransferOwnership: boolean;
    canDeleteHousehold: boolean;
    canLeave: boolean;
  };
  refs: {
    occupancyOptions: IdName[];
    typeOptions: IdName[];
    ownershipOptions: IdName[];
    memberRoleOptions: IdName[];
    memberStatusOptions: IdName[];
    inviteRoleOptions: IdName[];
  };
  updatedAt: string;
  version: string;
};

// Friendly alias used by UI/types
export type HouseholdData = HouseholdDetailDTO;

export type HouseholdDetailResponse = {
  success: boolean;
  message?: string;
  data: HouseholdDetailDTO;
};

// Adjust the path if your backend uses a different one (e.g. `/household/details/:id`)
export const getHouseholdDetails = (id: string) =>
  apiCall<HouseholdDetailResponse>(`/household/view/${id}`, 'GET');

/** -------------------------
 *  HOUSEHOLD UPDATE (basics)
 *  ------------------------- */
export type UpdateHouseholdBasicsPayload = {
  name?: string;
  householdTypeId?: number;
  ownershipStatusId?: number;
  occupancyStatusId?: number;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    landmark?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
  };
};

export type UpdateHouseholdResponse = {
  success: boolean;
  message?: string;
  data?: null;
};

export const updateHouseholdBasics = (id: string, payload: UpdateHouseholdBasicsPayload) =>
  apiCall<UpdateHouseholdResponse>(`/household/update/${id}`, 'PATCH', payload);

// Common small response
export type BasicResponse = { success: boolean; message?: string };

/** -------------------------
 *  HOUSEHOLD ADD MEMBER
 *  ------------------------- */
export type AddMemberPayload = {
  phone: string;
  countryCode: string; // e.g. "+91"
  roleId: number;
};

export const addHouseholdMember = (householdId: string, payload: AddMemberPayload) =>
  apiCall<BasicResponse>(`/householdmembers/add/${householdId}`, 'POST', payload);

/** -------------------------
 *  HOUSEHOLD REMOVE MEMBER
 *  ------------------------- */
export type RemoveMemberPayload = {
  householdMemberId: string;
  householdId: string;
  phone: string | null;
  countryCode: string | null;
};

export const removeHouseholdMember = (householdId: string, payload: RemoveMemberPayload) =>
  apiCall<BasicResponse>(`/householdmembers/${householdId}/remove`, 'DELETE', payload);

/** -------------------------
 *  HOUSEHOLD UPDATE MEMBER ROLE
 *  ------------------------- */
export type UpdateMemberRolePayload = { roleId: number };

export const updateHouseholdMemberRole = (
  householdId: string,
  householdMemberId: string,
  payload: UpdateMemberRolePayload,
) =>
  apiCall<BasicResponse>(
    `/householdmembers/update/${householdId}/${householdMemberId}`,
    'PATCH',
    payload,
  );

/** -------------------------
 *  HOUSEHOLD CREATE
 *  ------------------------- */
export type CreateHouseholdPayload = {
  householdName: string; // NOTE: backend expects "householdName"
  householdTypeId: number;
  ownershipStatusId: number;
  occupancyStatusId: number;
  address: {
    addressLine1: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  };
};

export type CreateHouseholdResponse = {
  success: boolean;
  message?: string;
  data?: { id?: string; householdId?: string } | null;
};

export const createHousehold = (payload: CreateHouseholdPayload) =>
  apiCall<CreateHouseholdResponse>('/household/add', 'POST', payload);

/** -------------------------
 *  HOUSEHOLD REFS (for Create screen)
 *  ------------------------- */
export type RefsResponse = { success: boolean; message?: string; data: IdName[] };

export const getHouseholdTypes = () => apiCall<RefsResponse>('/household/types', 'GET');

export const getHouseholdOwnershipStatuses = () =>
  apiCall<RefsResponse>('/household/ownershipstatuses', 'GET');

export const getHouseholdOccupancyStatuses = () =>
  apiCall<RefsResponse>('/household/occupancystatuses', 'GET');

/** -------------------------
 *  HOUSEHOLD REMOVE (delete)
 *  ------------------------- */
export type RemoveHouseholdResponse = { success: boolean; message?: string };

export const removeHousehold = (id: string) =>
  apiCall<RemoveHouseholdResponse>(`/household/remove/${id}`, 'DELETE');
// If your backend requires a different path, adjust here (e.g. `/household/${id}/remove`).
