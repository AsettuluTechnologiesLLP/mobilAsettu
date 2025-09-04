// src/screens/Households/model/households.ts

// ============ LIST (summary used by tiles) ============

export type MyRole = 'PRIMARY OWNER' | 'OWNER' | 'TENANT' | 'MEMBER' | 'VIEWER' | string;

export const withViewerOwnership = (
  raw: string | null | undefined,
  isOwner: boolean,
): string | null => {
  if (!raw) return null;
  return !isOwner && raw.trim().toLowerCase() === 'owned' ? 'Rented' : raw;
};

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
/** ---------- DETAILS (page) ---------- */

export interface MemberDTO {
  userId: string;
  name: string;
  role: string;
  status: string; // 'ACTIVE' | 'INVITED' | 'REMOVED' | ...
  // forward-compatible fields if BE adds them later:
  canRemove?: boolean;
  allowedRoles?: string[];
  phone?: string | null;
}

export interface RefsDTO {
  occupancyOptions: string[];
  typeOptions: string[];
  ownershipOptions: string[];
  /** NEW: renamed to match BE column `member_role_options` */
  memberRoleOptions: string[];
  memberStatusOptions: string[];
  /**
   * Viewer-aware roles allowed for inviting via “+”.
   * Optional to avoid compile breaks if BE temporarily omits it.
   */
  inviteRoleOptions?: string[];
}

export interface HouseholdDetailDTO {
  id: string;
  name: string;

  owner: { name: string | null; phone: string | null };

  address: { line1: string; city: string; state: string; pincode: string };

  statuses: {
    /** raw DB label (e.g., "Owned" | "Rented") */
    propertyOwnership: string | null;
    occupancy: string | null;
    type: string | null;
    /**
     * What non-owners should see for ownership at a glance.
     * (Server already maps Owned→Rented for non-owners.)
     */
    viewerPropertyOwnership: string | null;
  };

  members: MemberDTO[];

  counts: {
    membersActive: number;
    ownersActive: number;
    otherOwnersActive: number;
  };

  my: { role: string; isOwner: boolean; membershipStatus: string };

  permissions: {
    canEdit: boolean;
    canInvite: boolean;
    canRemoveMembers: boolean;
    canTransferOwnership: boolean;
    canDeleteHousehold: boolean;
    canLeave: boolean;
  };

  refs: RefsDTO;

  updatedAt: string | null;
  /** Optimistic concurrency token (currently same as updatedAt) */
  version: string | null;
}
