import { changeMemberRole, inviteMember, removeMember } from '@services/api';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

/**
 * Small helper hook to wire MembersCard actions to the API.
 * - Requires: householdId, a getter for the latest `version`, and a `refresh()` to pull fresh data.
 */
export default function useMemberMutations(
  householdId: string,
  getVersion: () => string | null | undefined,
  refresh: () => Promise<void>,
) {
  const [savingId, setSavingId] = useState<string | null>(null); // role changes OR invite (see effectiveSavingId)
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [inviting, setInviting] = useState<boolean>(false);

  // Memoize to satisfy exhaustive-deps and keep identity stable
  const requireVersion = useCallback((): string | null => {
    const v = getVersion();
    if (!v) {
      Alert.alert('Try again', 'Missing version. Please refresh and retry.');
      return null;
    }
    return v;
  }, [getVersion]);

  const onInvite = useCallback(
    async (phone: string, roleName: string) => {
      const version = requireVersion();
      if (!version) return;

      try {
        setInviting(true);
        const resp = await inviteMember(householdId, { phone, roleName, version });
        if (!resp?.success) {
          Alert.alert('Invite failed', resp?.message || 'Unable to invite member.');
          return;
        }
        await refresh();
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Unknown error';
        Alert.alert('Invite failed', msg);
      } finally {
        setInviting(false);
      }
    },
    [householdId, refresh, requireVersion],
  );

  const onChangeRole = useCallback(
    async (memberId: string, roleName: string) => {
      const version = requireVersion();
      if (!version) return;

      try {
        setSavingId(memberId);
        const resp = await changeMemberRole(householdId, memberId, { roleName, version });
        if (!resp?.success) {
          Alert.alert('Update failed', resp?.message || 'Unable to change role.');
          return;
        }
        await refresh();
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Unknown error';
        Alert.alert('Update failed', msg);
      } finally {
        setSavingId(null);
      }
    },
    [householdId, refresh, requireVersion],
  );

  const onRemove = useCallback(
    async (memberId: string) => {
      const version = requireVersion();
      if (!version) return;

      try {
        setRemovingId(memberId);
        const resp = await removeMember(householdId, memberId, { version });
        if (!resp?.success) {
          Alert.alert('Remove failed', resp?.message || 'Unable to remove member.');
          return;
        }
        await refresh();
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Unknown error';
        Alert.alert('Remove failed', msg);
      } finally {
        setRemovingId(null);
      }
    },
    [householdId, refresh, requireVersion],
  );

  // Map "inviting" to a synthetic saving id for MembersCard to show a spinner
  const effectiveSavingId = inviting ? '__invite__' : savingId;

  return {
    onInvite,
    onChangeRole,
    onRemove,
    savingId: effectiveSavingId,
    removingId,
  };
}
