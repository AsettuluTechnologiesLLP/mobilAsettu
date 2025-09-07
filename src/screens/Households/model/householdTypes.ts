// ---------- Shared option type for dropdowns / refs ----------
export type HouseholdRef = { id: number; name: string };

// ---------- Member-related types ----------
export type MemberRole = 'Primary Owner' | 'Owner' | 'Member' | 'Tenant' | (string & {}); // allow future roles

export type MemberStatus = 'ACTIVE' | 'REMOVED' | 'LEFT' | 'INVITED' | (string & {});

export type HouseholdMember = {
  userId: string;
  name: string; // can be phone string when name is not available (as per your API)
  role: MemberRole;
  status: MemberStatus;
  memberId?: string;
};

// ---------- Atomic value objects from your payload ----------
export type HouseholdOwner = {
  name: string;
  phone: string;
};

export type HouseholdAddress = {
  line1: string;
  city: string;
  state: string;
  pincode: string;
};

export type HouseholdStatuses = {
  propertyOwnership: string; // e.g., "Owned" | "Rented"
  occupancy: string; // e.g., "Self Occupied" | "Rented" | "Vacant"
  type: string; // e.g., "Apartment Flat", etc.
  viewerPropertyOwnership: string; // viewer's ownership label
};

export type HouseholdCounts = {
  membersActive: number;
  ownersActive: number;
  otherOwnersActive: number;
};

export type HouseholdMy = {
  role: string;
  isOwner: boolean;
  membershipStatus: string;
  userId?: string; // ← NEW (optional)
  memberId?: string; // ← NEW (optional)
};

// ---------- Permissions exactly as in your API ----------
export type HouseholdPermissions = {
  canEdit: boolean;
  canInvite: boolean;
  canRemoveMembers: boolean;
  canTransferOwnership: boolean;
  canDeleteHousehold: boolean;
  canLeave: boolean;
};

// ---------- Refs section for dropdowns / pickers ----------
export type HouseholdRefs = {
  occupancyOptions: HouseholdRef[];
  typeOptions: HouseholdRef[];
  ownershipOptions: HouseholdRef[];
  memberRoleOptions: HouseholdRef[];
  memberStatusOptions: HouseholdRef[];
  inviteRoleOptions: HouseholdRef[];
};

// ---------- Main "data" object from your API ----------
export type HouseholdData = {
  id: string;
  name: string;
  owner: HouseholdOwner;
  address: HouseholdAddress;
  statuses: HouseholdStatuses;
  members: HouseholdMember[];
  counts: HouseholdCounts;
  my: HouseholdMy;
  permissions: HouseholdPermissions;
  refs: HouseholdRefs;
  updatedAt: string;
  version: string;
};

// ---------- Full API envelope ----------
export type HouseholdDetailsAPI = {
  success: boolean;
  message: string;
  data: HouseholdData;
};

// ---------- Helper payloads for mutations ----------

// What BasicDetailsCard will emit on Save (partial update allowed)
export type UpdateBasicDetailsPayload = {
  name?: string;
  address?: Partial<HouseholdAddress>;
  statuses?: Partial<Pick<HouseholdStatuses, 'propertyOwnership' | 'occupancy' | 'type'>>;
};

// Members mutations
export type ChangeMemberRolePayload = {
  userId: string;
  roleName: string; // must match one of refs.memberRoleOptions[].name
};

export type RemoveMemberPayload = {
  userId: string;
};
