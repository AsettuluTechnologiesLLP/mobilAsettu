// src/screens/Households/model/households.ts

// ============ LIST (summary used by tiles) ============

export type MyRole = 'PRIMARY OWNER' | 'OWNER' | 'TENANT' | 'MEMBER' | 'VIEWER' | string;

/** Raw row from BE list endpoint (/household/viewhouseholds or equivalent). */
export interface HouseholdSummaryDTO {
  household_id: string;
  household_name: string;
  owner_display_name?: string | null;
  household_address?: string | null;
  household_city?: string | null;
  my_role: MyRole;
  is_user_owner?: boolean | null;
  member_count?: number | null;
  property_ownership_status?: string | null;
  occupancy_status?: string | null;
  household_type?: string | null;
  updated_at?: string | null; // ISO
}

/** UI-friendly list item for tiles. */
export interface HouseholdListItem {
  id: string;
  name: string;
  ownerDisplayName: string;
  addressLine: string;
  city: string;
  myRole: MyRole;
  isUserOwner: boolean;
  memberCount: number;
  propertyOwnershipStatus: string | null;
  occupancyStatus: string | null;
  householdType: string | null;
  updatedAt: Date | null;
}

/** Utility: check if role implies ownership. */
export const isOwnerRole = (role: MyRole): boolean => role === 'PRIMARY OWNER' || role === 'OWNER';

/** Map one summary DTO to UI list item. */
export const toHouseholdListItem = (dto: HouseholdSummaryDTO): HouseholdListItem => ({
  id: dto.household_id,
  name: dto.household_name,
  ownerDisplayName: dto.owner_display_name ?? '',
  addressLine: dto.household_address ?? '',
  city: dto.household_city ?? '',
  myRole: dto.my_role,
  isUserOwner: dto.is_user_owner ?? isOwnerRole(dto.my_role),
  memberCount: dto.member_count ?? 0,
  propertyOwnershipStatus: dto.property_ownership_status ?? null,
  occupancyStatus: dto.occupancy_status ?? null,
  householdType: dto.household_type ?? null,
  updatedAt: dto.updated_at ? new Date(dto.updated_at) : null,
});

/** Map array of summary DTOs to UI list items. */
export const mapHouseholdSummary = (rows?: HouseholdSummaryDTO[] | null): HouseholdListItem[] =>
  rows ? rows.map(toHouseholdListItem) : [];

// ============ DETAILS (full view payload) ============

export type MemberStatus = 'ACTIVE' | 'REMOVED' | 'LEFT' | 'INVITED' | string;

export interface HouseholdMemberDTO {
  userId: string;
  name: string;
  role: MyRole;
  status: MemberStatus;
}

export interface PermissionsDTO {
  canEdit: boolean;
  canInvite: boolean;
  canRemoveMembers: boolean;
  canTransferOwnership: boolean;
  canDeleteHousehold: boolean;
  canLeave: boolean;
}

export interface RefsDTO {
  occupancyOptions: string[];
  typeOptions: string[];
  ownershipOptions: string[];
}

/** Exact shape returned by the details endpoint/service. */
export interface HouseholdDetailDTO {
  id: string;
  name: string;
  owner: { name: string | null; phone: string | null };
  address: { line1: string; city: string; state: string; pincode: string };
  statuses: {
    /** Raw labels from DB */
    propertyOwnership: string | null;
    occupancy: string | null;
    type: string | null;
    /**
     * Viewer lens: if user is NOT owner and raw is "Owned" -> "Rented".
     * Backend sets this; FE also ensures via helper below.
     */
    viewerPropertyOwnership: string | null;
  };
  members: HouseholdMemberDTO[];
  counts: {
    membersActive: number;
    ownersActive: number;
    otherOwnersActive: number;
  };
  my: { role: MyRole; isOwner: boolean; membershipStatus: MemberStatus };
  permissions: PermissionsDTO;
  refs: RefsDTO;
  updatedAt: string | null;
  version: string | null; // optimistic token (often same as updatedAt)
}

/** Safety-normalizer: guarantee viewerPropertyOwnership is populated. */
export const withViewerOwnership = (d: HouseholdDetailDTO): HouseholdDetailDTO => {
  if (!d?.statuses) return d;
  const raw = (d.statuses.propertyOwnership || '').toLowerCase();
  const viewer =
    d.statuses.viewerPropertyOwnership ??
    (!d.my.isOwner && raw === 'owned' ? 'Rented' : d.statuses.propertyOwnership);
  return { ...d, statuses: { ...d.statuses, viewerPropertyOwnership: viewer } };
};
