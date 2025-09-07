// Centralized, dumb client-side gating (server still enforces all writes).
// Used by MembersCard (and later, BasicDetailsCard if needed).

import type { HouseholdPermissions, HouseholdRef } from '../model/householdTypes';

const norm = (s?: string) => (s || '').trim().toLowerCase();
const isPO = (r?: string) => norm(r) === 'primary owner';
const isOwner = (r?: string) => norm(r) === 'owner';

export type Viewer = {
  userId?: string; // prefer data.my.userId (fallback: auth user id)
  role?: string; // data.my.role
};

export type Target = {
  userId: string; // member.userId
  role?: string; // member.role
  memberId?: string; // member.memberId (optional until API adds it)
};

export type Context = {
  perms: HouseholdPermissions; // data.permissions
  roleOptions: HouseholdRef[]; // refs.memberRoleOptions
};

export const isSelf = (viewer: Viewer, target: Target) =>
  !!viewer.userId && viewer.userId === target.userId;

/** Change Role button visibility (UX only) */
export function canShowChangeRole(viewer: Viewer, target: Target, ctx: Context): boolean {
  if (!ctx.perms?.canEdit) return false;
  if (isSelf(viewer, target)) return false; // never on self
  if (isPO(target.role)) return false; // never change PO row
  return isPO(viewer.role) || isOwner(viewer.role);
}

/** Remove button visibility (for removing OTHERS; self uses Leave) */
export function canShowRemove(viewer: Viewer, target: Target, ctx: Context): boolean {
  if (!ctx.perms?.canRemoveMembers) return false;
  if (isSelf(viewer, target)) return false; // self uses Leave
  if (isPO(target.role)) return false; // never remove PO row
  return isPO(viewer.role) || isOwner(viewer.role);
}

/** Leave button visibility (self only; PO cannot leave self) */
export function canShowLeave(viewer: Viewer, target: Target, ctx: Context): boolean {
  if (!ctx.perms?.canLeave) return false;
  if (!isSelf(viewer, target)) return false; // only on self
  if (isPO(viewer.role)) return false; // PO cannot leave themselves
  return true; // Owner/Member/Tenant may leave
}

/** Which roles should appear in the picker for THIS target */
export function allowedRoleTargets(viewer: Viewer, target: Target, ctx: Context): HouseholdRef[] {
  // If the button itself shouldn't show, list should be empty.
  if (!canShowChangeRole(viewer, target, ctx)) return [];

  // Baseline: all options except Primary Owner.
  const withoutPO = ctx.roleOptions.filter((opt) => !isPO(opt.name));
  return withoutPO;
}
