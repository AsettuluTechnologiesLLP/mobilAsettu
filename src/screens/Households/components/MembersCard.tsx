// src/screens/Households/components/MembersCard.tsx
import { Button, Text } from '@ui';
import { SmallPill } from '@ui';
import { colors, fontSizes, lineHeights, radii, spacing } from '@ui/tokens';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { SimplePickerModal } from './HouseholdDetails.parts';

type Member = {
  userId: string;
  name: string;
  phone?: string | null;
  role: string;
  status?: string | null; // ACTIVE | INVITED | ...
  canRemove?: boolean; // if explicitly false, hide trash
  allowedRoles?: string[] | null;
};

type Props = {
  title?: string;
  members: Member[];
  countActive?: number | null;

  canInvite?: boolean;
  inviteRoleOptions?: string[];

  onInvite?: (phone: string, role: string) => Promise<void> | void;
  onChangeRole?: (memberId: string, newRole: string) => Promise<void> | void;
  onRemove?: (memberId: string) => Promise<void> | void;

  savingId?: string | null; // member currently saving (role change OR '__invite__')
  removingId?: string | null; // member currently being removed
};

const ROW_HEIGHT = 48; // consistent row height
const CONTROL_HEIGHT = 40; // inputs/selects/buttons inside rows

export default function MembersCard({
  title = 'Members',
  members,
  countActive = null,
  canInvite = false,
  inviteRoleOptions = [],

  onInvite,
  onChangeRole,
  onRemove,

  savingId = null,
  removingId = null,
}: Props) {
  // Collapsible
  const [expanded, setExpanded] = useState(true);

  // Draft row state
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftPhone, setDraftPhone] = useState('');
  const [draftRole, setDraftRole] = useState<string | null>(null);
  const [draftRoleOpen, setDraftRoleOpen] = useState(false); // ← inline dropdown toggle

  // helpers
  const sanitizePhone = (input: string) => input.replace(/\D/g, '').slice(0, 10);
  const isValidIndianMobile = (digits: string) => /^[6-9]\d{9}$/.test(digits);

  // state
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // derived
  const isPhoneValid = isValidIndianMobile(draftPhone);

  // Role picker for EXISTING members (keep modal there)
  const [picker, setPicker] = useState<{
    memberId?: string;
    title: string;
    options: string[];
    value: string | null;
    onSelect: (val: string | null) => void;
  } | null>(null);
  const closePicker = () => setPicker(null);

  // Actions
  const handleRolePress = (m: Member) => {
    const options = (m.allowedRoles || []).filter(Boolean) as string[];
    if (!options.length) return;
    setPicker({
      memberId: m.userId,
      title: `Change role for ${m.name}`,
      options,
      value: m.role,
      onSelect: async (val) => {
        if (!val || val === m.role) return closePicker();
        try {
          await onChangeRole?.(m.userId, val);
        } finally {
          closePicker();
        }
      },
    });
  };

  const handleRemove = (m: Member) => {
    Alert.alert(
      'Remove member',
      `Remove ${m.name} from this household?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await onRemove?.(m.userId);
          },
        },
      ],
      { cancelable: true },
    );
  };

  const openDraft = () => {
    setDraftOpen(true);
    setExpanded(true);
    setDraftPhone('');
    setDraftRole(null);
    setDraftRoleOpen(false);
  };
  const cancelDraft = () => {
    setDraftOpen(false);
    setDraftPhone('');
    setDraftRole(null);
    setDraftRoleOpen(false);
  };

  const inviteDraft = () => {
    const digits = sanitizePhone(draftPhone);
    if (!isValidIndianMobile(digits)) {
      Alert.alert(
        'Invalid phone number',
        'Please enter a 10-digit mobile starting with 6, 7, 8, or 9.',
      );
      return;
    }
    if (!draftRole) {
      Alert.alert('Role required', 'Please choose a role.');
      return;
    }
    Alert.alert(
      'Add member',
      `Add ${digits} as ${draftRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            await onInvite?.(digits, draftRole); // pass the clean 10-digit number
            cancelDraft();
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={card.wrap}>
      {/* Header */}
      <View style={card.header}>
        <Text style={card.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={card.headerRight}>
          {typeof countActive === 'number' ? <SmallPill label={countActive} /> : null}
          {canInvite ? (
            <SmallPill
              icon={draftOpen ? '×' : '＋'}
              iconOnly
              onPress={draftOpen ? cancelDraft : openDraft}
            />
          ) : null}
          <SmallPill icon={expanded ? '▼' : '▶'} iconOnly onPress={() => setExpanded((e) => !e)} />
        </View>
      </View>

      {/* Divider between header & content */}
      <View style={card.divider} />

      {/* Content */}
      {expanded ? (
        <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
          {/* Draft: simple form with inline dropdown */}
          {draftOpen ? (
            <View style={form.wrap}>
              <Text style={form.title}>Add member</Text>

              {/* Phone row */}
              <View style={form.row}>
                <Text style={form.label}>Phone</Text>
                <TextInput
                  value={draftPhone}
                  onChangeText={(t) => {
                    const digits = sanitizePhone(t);
                    setDraftPhone(digits);
                    if (!digits) {
                      setPhoneError(null);
                      return;
                    }
                    setPhoneError(
                      isValidIndianMobile(digits)
                        ? null
                        : 'Enter 10 digits starting with 6, 7, 8, or 9',
                    );
                  }}
                  placeholder="10-digit mobile"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={10}
                  style={form.inputInline}
                  autoCorrect={false}
                />
              </View>
              {phoneError ? (
                <Text style={{ color: colors.error, marginTop: 4 }}>{phoneError}</Text>
              ) : null}

              {/* Role row (inline dropdown) */}
              <View style={[form.row, { marginTop: spacing.sm }]}>
                <Text style={form.label}>Role</Text>
                <Pressable onPress={() => setDraftRoleOpen((o) => !o)} style={form.selectInline}>
                  <Text
                    style={[
                      form.selectText, // not bold; matches input tone
                      !draftRole ? { color: colors.textMuted } : null,
                    ]}
                    numberOfLines={1}
                  >
                    {draftRole || 'Select'}
                  </Text>
                  <Text style={form.chevron}>{draftRoleOpen ? '▲' : '▼'}</Text>
                </Pressable>
              </View>

              {/* Inline dropdown options */}
              {draftRoleOpen ? (
                <View style={form.dropdown}>
                  {(inviteRoleOptions || []).map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => {
                        setDraftRole(opt);
                        setDraftRoleOpen(false);
                      }}
                      style={({ pressed }) => [
                        form.option,
                        pressed ? { backgroundColor: '#F1F5FF' } : null,
                      ]}
                    >
                      <Text style={form.optionTxt}>{opt}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {/* Actions — smaller pills side-by-side */}
              <View style={form.actionsRow}>
                <Button title="Add" onPress={inviteDraft} disabled={!isPhoneValid || !draftRole} />
                <Button title="Cancel" onPress={cancelDraft} />
              </View>
            </View>
          ) : null}

          {/* Existing members */}
          <View style={{ marginTop: draftOpen ? spacing.sm : 0 }}>
            {members.length ? (
              members.map((m) => {
                const saving = savingId === m.userId;
                const removing = removingId === m.userId;

                const showTrash = m.canRemove !== false;

                return (
                  <View key={m.userId} style={row.wrap}>
                    {/* Name / status */}
                    <View style={[row.cellFlex]}>
                      <Text style={row.name} numberOfLines={1}>
                        {m.name || m.phone || '—'}
                      </Text>
                      {m.status && m.status !== 'ACTIVE' ? (
                        <Text style={row.subtle}>{m.status}</Text>
                      ) : null}
                    </View>

                    {/* Role (editable if allowed) */}
                    <View style={[row.cellFixed]}>
                      <Text style={row.label}>Role</Text>
                      {(m.allowedRoles || []).length ? (
                        <Pressable
                          onPress={() => handleRolePress(m)}
                          disabled={saving || removing}
                          style={[row.select, saving || removing ? row.disabled : null]}
                        >
                          <Text style={row.selectTxt} numberOfLines={1}>
                            {m.role}
                          </Text>
                          {saving ? (
                            <ActivityIndicator size="small" style={{ marginLeft: spacing.xs }} />
                          ) : null}
                        </Pressable>
                      ) : (
                        <Text style={[row.value, { marginTop: 6 }]} numberOfLines={1}>
                          {m.role}
                        </Text>
                      )}
                    </View>

                    {/* Trash */}
                    <View style={row.actions}>
                      {showTrash ? (
                        <Pressable
                          onPress={() => handleRemove(m)}
                          disabled={removing || saving}
                          style={card.iconBtn}
                        >
                          {removing ? (
                            <ActivityIndicator />
                          ) : (
                            <Text style={[card.iconTxt, { fontWeight: '700' }]}>🗑️</Text>
                          )}
                        </Pressable>
                      ) : (
                        <View style={{ width: 28 }} />
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={{ color: colors.textMuted }}>No members listed.</Text>
            )}
          </View>

          {/* Invite in-flight indicator */}
          {savingId === '__invite__' ? (
            <View style={{ marginTop: spacing.sm }}>
              <ActivityIndicator />
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Modal picker for existing members only */}
      <SimplePickerModal
        open={!!picker}
        title={picker?.title || ''}
        options={picker?.options || []}
        value={picker?.value || null}
        onSelect={(val) => picker?.onSelect(val ?? null)}
        onClose={closePicker}
      />
    </View>
  );
}

/* ---------------- styles ---------------- */

const card = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    height: 52,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.tileBackground,
  },
  title: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTxt: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.xs,
    color: colors.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});

const form = StyleSheet.create({
  wrap: {
    padding: spacing.md,
    backgroundColor: '#FAFBFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    textAlign: 'center',
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    minWidth: 80,
    marginRight: spacing.sm,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  inputInline: {
    flex: 1,
    height: CONTROL_HEIGHT,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF',
    color: colors.textPrimary,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  selectInline: {
    flex: 1,
    height: CONTROL_HEIGHT,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: fontSizes.sm, // match input (no bold)
    lineHeight: lineHeights.sm,
    color: colors.textPrimary,
    fontWeight: '400',
  },
  chevron: {
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.textSecondary,
  },
  dropdown: {
    marginTop: spacing.xs,
    marginLeft: 80 + spacing.sm, // align under the select (label width + gap)
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 10,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionTxt: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textPrimary,
  },
  actionsRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});

const row = StyleSheet.create({
  wrap: {
    minHeight: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cellFlex: {
    flex: 1,
    paddingRight: spacing.sm,
    paddingLeft: spacing.sm,
  },
  cellFixed: {
    width: 160,
    paddingRight: spacing.sm,
  },
  actions: {
    width: 72,
    alignItems: 'flex-end',
    paddingRight: spacing.sm,
  },
  name: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  subtle: {
    marginTop: 2,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.textMuted,
  },
  label: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.textSecondary,
  },
  value: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textPrimary,
  },
  input: {
    marginTop: 4,
    height: CONTROL_HEIGHT,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF',
    color: colors.textPrimary,
  },
  select: {
    marginTop: 4,
    height: CONTROL_HEIGHT,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  selectTxt: {
    flex: 1,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
