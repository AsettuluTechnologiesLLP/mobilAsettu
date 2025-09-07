// src/screens/Households/HouseholdDetailsScreen.tsx
// NEW: auth user id (fallback if backend doesn't send my.userId yet)
import ROUTES from '@navigation/routes';
import { useAuth } from '@screens/Auth/hooks/useAuth';
import {
  addHouseholdMember,
  removeHousehold,
  removeHouseholdMember,
  updateHouseholdBasics,
  UpdateHouseholdBasicsPayload,
  updateHouseholdMemberRole,
} from '@services/api/householdApi';
import { colors } from '@ui/tokens';
import logger from '@utils/logger';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import BasicDetailsCard from './components/BasicDetailsCard';
import MembersCard from './components/MembersCard';
import useHouseholdDetails from './hooks/useHouseholdDetails';
// import { removeHouseholdFromCache } from './hooks/useHouseholdsViewAll';
import { HouseholdData, UpdateBasicDetailsPayload } from './model/householdTypes';

type Props = {
  route: { params: { householdId: string; currentUserId?: string } };
  navigation: any;
};

const HouseholdDetailsScreen: React.FC<Props> = ({ route, navigation: _navigation }) => {
  const { householdId, currentUserId: navUserId = '' } = route.params;

  const { userId: authUserId } = useAuth();
  const { data, loading, error, refresh, setData } = useHouseholdDetails(householdId);

  const [deleting, setDeleting] = useState(false);

  // Prefer backend identity when available → else auth → else nav param
  const effectiveCurrentUserId = data?.my?.userId || authUserId || navUserId || '';

  // Local UI state
  const [savingBasic, setSavingBasic] = useState(false);
  const [basicError, setBasicError] = useState<string | null>(null);

  const [savingMemberId, setSavingMemberId] = useState<string | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setBasicError(null);
    setMembersError(null);
    await refresh();
  }, [refresh]);

  // --- Map UI basics → API payload (names → IDs; address keys) ---
  const mapToBasicsApiPayload = (
    ui: UpdateBasicDetailsPayload,
    snapshot: HouseholdData,
  ): UpdateHouseholdBasicsPayload => {
    const out: UpdateHouseholdBasicsPayload = {};

    if (ui.name) out.name = ui.name;

    if (ui.address) {
      out.address = {
        addressLine1: ui.address.line1 ?? snapshot.address.line1,
        city: ui.address.city ?? snapshot.address.city,
        state: ui.address.state ?? snapshot.address.state,
        pincode: ui.address.pincode ?? snapshot.address.pincode,
      };
    }

    const s = ui.statuses;
    if (s?.type) {
      const match = snapshot.refs.typeOptions.find((o) => o.name === s.type);
      if (match) out.householdTypeId = match.id;
    }
    if (s?.propertyOwnership) {
      const match = snapshot.refs.ownershipOptions.find((o) => o.name === s.propertyOwnership);
      if (match) out.ownershipStatusId = match.id;
    }
    if (s?.occupancy) {
      const match = snapshot.refs.occupancyOptions.find((o) => o.name === s.occupancy);
      if (match) out.occupancyStatusId = match.id;
    }

    return out;
  };

  // --- Helpers for Members slice ---
  const roleIdFromName = useCallback(
    (roleName: string) => data?.refs.memberRoleOptions.find((r) => r.name === roleName)?.id,
    [data?.refs.memberRoleOptions],
  );

  // Prefer server-provided memberId when backend adds it; fallback to userId
  const memberIdForUser = useCallback(
    (userId: string) => {
      const m = data?.members.find((x) => x.userId === userId) as any;
      return m?.memberId || userId;
    },
    [data?.members],
  );

  // ---- Handlers -------------------------------------------------------------
  const handleSaveBasic = useCallback(
    async (payload: UpdateBasicDetailsPayload) => {
      if (!data?.permissions?.canEdit) return;
      if (!payload || Object.keys(payload).length === 0) return;

      setBasicError(null);
      setSavingBasic(true);
      try {
        logger.info('HH:saveBasic:start', { householdId, payload });

        const apiPayload = mapToBasicsApiPayload(payload, data);
        const resp = await updateHouseholdBasics(householdId, apiPayload);
        if (!resp?.success) throw new Error(resp?.message || 'Failed to update household');

        // Local merge for snappy UI (or call refresh())
        if (setData) {
          setData((prev) => {
            if (!prev) return prev;
            const next: HouseholdData = { ...prev };

            if (payload.name !== undefined) next.name = payload.name;

            if (payload.address) {
              next.address = {
                ...prev.address,
                line1: payload.address.line1 ?? prev.address.line1,
                city: payload.address.city ?? prev.address.city,
                state: payload.address.state ?? prev.address.state,
                pincode: payload.address.pincode ?? prev.address.pincode,
              };
            }

            if (payload.statuses) {
              next.statuses = {
                ...prev.statuses,
                propertyOwnership:
                  payload.statuses.propertyOwnership ?? prev.statuses.propertyOwnership,
                occupancy: payload.statuses.occupancy ?? prev.statuses.occupancy,
                type: payload.statuses.type ?? prev.statuses.type,
                viewerPropertyOwnership: prev.statuses.viewerPropertyOwnership,
              };
            }
            return next;
          });
        } else {
          await refresh();
        }

        logger.info('HH:saveBasic:success', { householdId });
      } catch (e: any) {
        logger.error('HH:saveBasic:error', { error: e?.message });
        setBasicError(e?.message || 'Unable to save changes.');
      } finally {
        setSavingBasic(false);
      }
    },
    [data, householdId, refresh, setData],
  );

  // STEP 1: Add Member (working)
  const handleAddMember = useCallback(
    async ({
      phone,
      countryCode,
      roleId,
    }: {
      phone: string;
      countryCode: string;
      roleId: number;
    }) => {
      try {
        logger.info('HH:addMember:start', { householdId, phone, countryCode, roleId });
        const resp = await addHouseholdMember(householdId, { phone, countryCode, roleId });
        if (!resp?.success) throw new Error(resp?.message || 'Failed to add member');

        await refresh(); // reflect INVITED/new member
        logger.info('HH:addMember:success', { householdId });
        return true;
      } catch (e: any) {
        logger.error('HH:addMember:error', { error: e?.message });
        setMembersError(e?.message || 'Could not add member.');
        return false;
      }
    },
    [householdId, refresh],
  );

  // STEP 2: Change Role (working)
  const handleChangeRole = useCallback(
    async (userId: string, roleName: string) => {
      try {
        if (!data?.permissions?.canEdit) return;
        const roleId = roleIdFromName(roleName);
        if (!roleId) {
          Alert.alert('Invalid role', 'Please select a valid role.');
          return;
        }
        const memberId = memberIdForUser(userId);

        logger.info('HH:updateRole:start', { householdId, userId, roleName, roleId });
        setSavingMemberId(userId);

        const resp = await updateHouseholdMemberRole(householdId, memberId, { roleId });
        if (!resp?.success) throw new Error(resp?.message || 'Failed to update role');

        await refresh();
        logger.info('HH:updateRole:success', { householdId, userId });
      } catch (e: any) {
        logger.error('HH:updateRole:error', { error: e?.message });
        setMembersError(e?.message || 'Could not change role.');
      } finally {
        setSavingMemberId(null);
      }
    },
    [data?.permissions?.canEdit, householdId, memberIdForUser, refresh, roleIdFromName],
  );

  // STEP 3: Remove Member (new)
  const handleRemoveMember = useCallback(
    async (targetUserId: string) => {
      // 1) Hard perms check (server still enforces)
      if (!data?.permissions?.canRemoveMembers) return;

      // 2) Identify target row
      const target = data.members.find((m) => m.userId === targetUserId);
      if (!target) {
        Alert.alert('Not found', 'Member not found in this household.');
        return;
      }

      // 3) Client-side guardrails (mirror the UI policy)
      const myUserId = effectiveCurrentUserId;
      const targetRole = (target.role || '').toLowerCase();

      // Never remove Primary Owner
      if (targetRole === 'primary owner') {
        Alert.alert('Not allowed', 'Primary Owner cannot be removed.');
        return;
      }

      // Self removal goes through the Leave flow (so user sees the right wording)
      if (targetUserId === myUserId) {
        Alert.alert('Use Leave', 'To remove yourself, please use the Leave action on your row.', [
          { text: 'OK' },
        ]);
        return;
      }

      // Owners cannot remove Primary Owner (already handled above), others ok.
      // PO can remove anyone except themselves (handled above & by UI).

      // 4) Confirm
      Alert.alert('Remove Member', `Remove ${target.name || 'this user'} from the household?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setMembersError(null);
              setSavingMemberId(targetUserId);

              // Prefer memberId if your backend adds it; fallback to userId (your API currently accepts this)
              const memberId = (target as any)?.memberId || targetUserId;

              logger.info('HH:remove:start', { householdId, targetUserId, memberId });

              const resp = await removeHouseholdMember(householdId, {
                householdMemberId: memberId,
                householdId,
                phone: null,
                countryCode: null,
              });

              if (!resp?.success) throw new Error(resp?.message || 'Failed to remove member');

              await refresh();
              logger.info('HH:remove:success', { householdId, targetUserId });
            } catch (e: any) {
              logger.error('HH:remove:error', { error: e?.message });
              setMembersError(e?.message || 'Could not remove member.');
            } finally {
              setSavingMemberId(null);
            }
          },
        },
      ]);
    },
    [data, effectiveCurrentUserId, householdId, refresh],
  );

  // STEP 4: Leave Household (new)
  const handleLeaveHousehold = useCallback(() => {
    if (!data?.permissions?.canLeave) return;

    // Identify my membership row
    const myUserId = effectiveCurrentUserId;
    const myMemberId = myUserId ? memberIdForUser(myUserId) : undefined;

    // Safety: Primary Owner cannot leave (UI already hides it, but guard anyway)
    const myRole = (data?.my?.role || '').toLowerCase();
    if (myRole === 'primary owner') {
      Alert.alert('Not allowed', 'Primary Owner cannot leave their own household.');
      return;
    }

    if (!myMemberId) {
      Alert.alert('Cannot leave', 'Unable to identify your membership in this household.');
      return;
    }

    Alert.alert('Leave Household', 'Are you sure you want to leave this household?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            logger.info('HH:leave:start', { householdId, myUserId, myMemberId });
            setMembersError(null);
            setSavingMemberId(myUserId);

            const resp = await removeHouseholdMember(householdId, {
              householdMemberId: myMemberId,
              householdId,
              phone: null,
              countryCode: null,
            });
            if (!resp?.success) throw new Error(resp?.message || 'Could not leave household');
            logger.info('HH:leave:success', { householdId, myUserId });
            _navigation?.navigate({
              name: ROUTES.MANAGE_HOUSEHOLDS,
              params: { removedId: householdId },
              merge: true,
            } as any);
            _navigation?.goBack?.();
          } catch (e: any) {
            logger.error('HH:leave:error', { error: e?.message });
            setMembersError(e?.message || 'Could not leave household.');
          } finally {
            setSavingMemberId(null);
          }
        },
      },
    ]);
  }, [
    data?.permissions?.canLeave,
    data?.my?.role,
    effectiveCurrentUserId,
    householdId,
    memberIdForUser,
    _navigation,
  ]);

  const handleDeleteHousehold = useCallback(() => {
    if (!data?.permissions?.canDeleteHousehold) return;

    Alert.alert(
      'Delete household?',
      'This action cannot be undone. All members will lose access.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              logger.info('HH:delete:start', { householdId });

              const resp = await removeHousehold(householdId);
              if (!resp?.success) throw new Error(resp?.message || 'Failed to delete household');
              logger.info('HH:delete:success', { householdId });
              _navigation?.navigate({
                name: ROUTES.MANAGE_HOUSEHOLDS,
                params: { removedId: householdId },
                merge: true,
              } as any);
              _navigation?.goBack?.();
            } catch (e: any) {
              logger.error('HH:delete:error', { error: e?.message });
              Alert.alert('Delete failed', e?.message || 'Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  }, [data?.permissions?.canDeleteHousehold, householdId, _navigation]);

  // ---- Render ----------------------------------------------------------------

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text>{error || 'Failed to load household.'}</Text>
      </View>
    );
  }

  const { name, address, statuses, refs, permissions, members, my } = data;

  // Add Member visibility (PO or Owner + canInvite)
  const canAddMember = Boolean(
    permissions?.canInvite && ['primary owner', 'owner'].includes((my?.role || '').toLowerCase()),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={!!loading} onRefresh={onRefresh} />}
    >
      <BasicDetailsCard
        name={name}
        address={address}
        statuses={statuses}
        refs={{
          ownershipOptions: refs.ownershipOptions,
          occupancyOptions: refs.occupancyOptions,
          typeOptions: refs.typeOptions,
        }}
        permissions={permissions}
        saving={savingBasic}
        errorMessage={basicError}
        onSave={handleSaveBasic}
      />

      <MembersCard
        currentUserId={effectiveCurrentUserId}
        members={members}
        refs={{ memberRoleOptions: refs.memberRoleOptions }}
        permissions={permissions}
        // Add Member
        canAdd={canAddMember}
        onAddMember={handleAddMember}
        // Viewer
        viewerRole={my?.role}
        // UX
        savingMemberId={savingMemberId}
        errorMessage={membersError}
        // Events
        onChangeRole={handleChangeRole}
        onRemoveMember={handleRemoveMember}
        onLeaveHousehold={handleLeaveHousehold}
      />

      {permissions?.canDeleteHousehold ? (
        <Pressable
          style={[styles.deleteBtn, deleting && { opacity: 0.6 }]}
          disabled={deleting}
          onPress={handleDeleteHousehold}
        >
          <Text style={styles.deleteBtnText}>{deleting ? 'Deleting…' : 'Delete Household'}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { gap: 16, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.danger,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.dangerBorder,
  },
  deleteBtnText: { color: colors.primaryTextOn, fontWeight: '700' },
});

export default HouseholdDetailsScreen;
