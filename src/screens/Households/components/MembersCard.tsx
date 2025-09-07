// src/screens/Households/components/MembersCard.tsx
import { colors } from '@ui/tokens';
import React, { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HouseholdData, HouseholdPermissions, HouseholdRef } from '../model/householdTypes';
import AddMemberModal from './AddMemberModal';

// Stable separator
const ListSeparator = () => <View style={{ height: 10 }} />;

// Role helpers
const norm = (s?: string) => (s || '').trim().toLowerCase();
const roleEq = (a?: string, b?: string) => norm(a) === norm(b);

const canChangeRoleRow = (viewerRole?: string, targetRole?: string, isSelf?: boolean) => {
  if (roleEq(viewerRole, 'primary owner')) return !isSelf; // PO: can change others; not self
  if (roleEq(viewerRole, 'owner')) return !isSelf && !roleEq(targetRole, 'primary owner');
  return false; // Member/Tenant: never
};

const canRemoveRow = (viewerRole?: string, targetRole?: string, isSelf?: boolean) => {
  // Self removal handled via Leave
  if (isSelf) return false;
  if (roleEq(viewerRole, 'primary owner')) return true; // PO: can remove anyone (UI prevents removing PO itself elsewhere)
  if (roleEq(viewerRole, 'owner')) return !roleEq(targetRole, 'primary owner');
  return false;
};

type Props = {
  currentUserId: string;
  members: HouseholdData['members'];
  refs: { memberRoleOptions: HouseholdRef[] };
  permissions: HouseholdPermissions;

  // Add member
  canAdd: boolean;
  onAddMember: (p: { phone: string; countryCode: string; roleId: number }) => Promise<boolean>;

  // Per-row gating
  viewerRole?: string;

  // UX
  savingMemberId?: string | null;
  errorMessage?: string | null;

  // Events
  onChangeRole: (userId: string, roleName: string) => void;
  onRemoveMember: (userId: string) => void;
  onLeaveHousehold: () => void;
};

const MembersCard: React.FC<Props> = ({
  currentUserId,
  members,
  refs,
  permissions,
  canAdd,
  onAddMember,
  viewerRole,
  savingMemberId,
  errorMessage,
  onChangeRole,
  onRemoveMember,
  onLeaveHousehold,
}) => {
  const [picker, setPicker] = useState<{ userId: string; open: boolean } | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const list = useMemo(() => members.slice(), [members]);

  const onPickRole = useCallback(
    (userId: string, roleName: string) => {
      onChangeRole(userId, roleName);
      setPicker(null);
    },
    [onChangeRole],
  );

  const renderRow = useCallback(
    (item: HouseholdData['members'][number]) => {
      const isSelf = item.userId === currentUserId;

      const showChangeRole =
        !!permissions.canEdit && canChangeRoleRow(viewerRole, item.role, isSelf);

      // Only allow Leave for self when viewer is NOT Primary Owner
      const showLeave = isSelf && !!permissions.canLeave && !roleEq(viewerRole, 'primary owner');

      const showRemove =
        !isSelf && !!permissions.canRemoveMembers && canRemoveRow(viewerRole, item.role, isSelf);

      return (
        <View style={styles.row} key={item.userId}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name || 'Unknown User'}</Text>
            <View style={styles.badges}>
              <Text style={styles.badge}>{item.role}</Text>
              <Text style={[styles.badge, styles.muted]}>{item.status}</Text>
            </View>
          </View>

          {showChangeRole && (
            <Pressable
              style={styles.smallBtn}
              onPress={() => setPicker({ userId: item.userId, open: true })}
              disabled={savingMemberId === item.userId}
            >
              <Text style={styles.smallBtnText}>
                {savingMemberId === item.userId ? 'Saving…' : 'Change Role'}
              </Text>
            </Pressable>
          )}

          {showRemove && (
            <Pressable
              style={[styles.smallBtn, styles.dangerBtn]}
              onPress={() => onRemoveMember(item.userId)}
            >
              <Text style={[styles.smallBtnText, styles.dangerText]}>Remove</Text>
            </Pressable>
          )}

          {showLeave && (
            <Pressable style={[styles.smallBtn, styles.dangerBtn]} onPress={onLeaveHousehold}>
              <Text style={[styles.smallBtnText, styles.dangerText]}>Leave</Text>
            </Pressable>
          )}
        </View>
      );
    },
    [
      currentUserId,
      permissions.canEdit,
      permissions.canLeave,
      permissions.canRemoveMembers,
      viewerRole,
      savingMemberId,
      onRemoveMember,
      onLeaveHousehold,
    ],
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Members</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {canAdd && (
            <Pressable style={styles.btn} onPress={() => setAddOpen(true)}>
              <Text style={styles.btnText}>Add Member</Text>
            </Pressable>
          )}
        </View>
      </View>

      {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

      {/* Plain list to avoid nested VirtualizedList warning */}
      <View>
        {list.map((item, idx) => (
          <View key={item.userId}>
            {idx > 0 ? <ListSeparator /> : null}
            {renderRow(item)}
          </View>
        ))}
      </View>

      {/* Role picker */}
      <Modal
        transparent
        visible={!!picker?.open}
        onRequestClose={() => setPicker(null)}
        animationType="fade"
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select Role</Text>

            {refs.memberRoleOptions.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={styles.option}
                onPress={() => picker && onPickRole(picker.userId, opt.name)}
              >
                <Text style={styles.optionText}>{opt.name}</Text>
              </TouchableOpacity>
            ))}

            <Pressable style={[styles.btn, styles.ghost]} onPress={() => setPicker(null)}>
              <Text style={[styles.btnText, styles.ghostBtnText]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Add Member modal */}
      <AddMemberModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={onAddMember}
        roleOptions={refs.memberRoleOptions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },

  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },

  badges: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  badge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.badgeBg,
    color: colors.badgeText,
    overflow: 'hidden',
  },
  muted: {
    backgroundColor: colors.badgeBgMuted,
    color: colors.textMuted,
  },

  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  smallBtnText: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },

  dangerBtn: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
  },
  dangerText: { color: colors.danger, fontWeight: '700' },

  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.buttonBackground,
    borderRadius: 10,
  },
  btnText: { color: colors.buttonTextOn, fontWeight: '700' },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  ghostBtnText: { color: colors.textPrimary },

  error: { color: colors.danger, marginBottom: 8 },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionText: { fontSize: 14, color: colors.textPrimary },
});

export default MembersCard;
