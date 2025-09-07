import { colors } from '@ui/tokens';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { HouseholdRef } from '../model/householdTypes';

// Stable sheet container
const Sheet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.backdrop}>
    <View style={styles.sheet}>{children}</View>
  </View>
);

// Stable list bits to avoid nested-component lint
const RoleSeparator = () => <View style={{ height: 8 }} />;
const RoleOption = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <Text style={styles.optionText}>{label}</Text>
  </TouchableOpacity>
);

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: { phone: string; countryCode: string; roleId: number }) => Promise<boolean>;
  roleOptions: HouseholdRef[];
  defaultCountryCode?: string; // e.g. "+91"
};

const AddMemberModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
  roleOptions,
  defaultCountryCode = '+91',
}) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickedRoleName = useMemo(
    () => roleOptions.find((r) => r.id === roleId)?.name ?? '',
    [roleId, roleOptions],
  );

  const valid = useMemo(() => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7 && !!roleId && countryCode.trim().length > 0;
  }, [phone, roleId, countryCode]);

  const reset = useCallback(() => {
    setPhone('');
    setCountryCode(defaultCountryCode);
    setRoleId(null);
    setRolePickerOpen(false);
    setSubmitting(false);
    setError(null);
  }, [defaultCountryCode]);

  const closeAll = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const doSubmit = useCallback(async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || !roleId || countryCode.trim().length === 0) return;

    setSubmitting(true);
    setError(null);
    const ok = await onSubmit({
      phone: phone.trim(),
      countryCode: countryCode.trim(),
      roleId,
    });
    setSubmitting(false);
    if (ok) closeAll();
    else setError('Could not add member. Please try again.');
  }, [phone, countryCode, roleId, onSubmit, closeAll]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closeAll}>
      <Sheet>
        <Text style={styles.title}>Add Member</Text>
        {!!error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="9686600098"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Country Code</Text>
        <TextInput
          style={styles.input}
          placeholder="+91"
          placeholderTextColor={colors.textMuted}
          value={countryCode}
          onChangeText={setCountryCode}
        />

        <Text style={styles.label}>Role</Text>
        <Pressable style={styles.input} onPress={() => setRolePickerOpen(true)}>
          <Text style={styles.inputText}>{pickedRoleName || 'Select role…'}</Text>
        </Pressable>

        {/* Role picker */}
        <Modal
          transparent
          visible={rolePickerOpen}
          animationType="fade"
          onRequestClose={() => setRolePickerOpen(false)}
        >
          <Sheet>
            <Text style={styles.sheetTitle}>Select Role</Text>
            <FlatList
              data={roleOptions}
              keyExtractor={(o) => String(o.id)}
              ItemSeparatorComponent={RoleSeparator}
              renderItem={({ item }) => (
                <RoleOption
                  label={item.name}
                  onPress={() => {
                    setRoleId(item.id);
                    setRolePickerOpen(false);
                  }}
                />
              )}
            />
            <Pressable style={[styles.btn, styles.ghost]} onPress={() => setRolePickerOpen(false)}>
              <Text style={[styles.btnText, styles.ghostBtnText]}>Cancel</Text>
            </Pressable>
          </Sheet>
        </Modal>

        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.ghost]} onPress={closeAll}>
            <Text style={[styles.btnText, styles.ghostBtnText]}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, !valid || submitting ? styles.btnDisabled : null]}
            onPress={doSubmit}
            disabled={!valid || submitting}
          >
            <Text style={styles.btnText}>{submitting ? 'Adding…' : 'Add'}</Text>
          </Pressable>
        </View>
      </Sheet>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    width: '88%',
    maxHeight: '80%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  label: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  inputText: { fontSize: 14, color: colors.textPrimary },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },

  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.buttonBackground,
    borderRadius: 10,
  },
  btnText: { color: colors.buttonTextOn, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },

  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  ghostBtnText: { color: colors.textPrimary },

  option: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionText: { fontSize: 14, color: colors.textPrimary },

  error: { color: colors.danger, marginBottom: 8 },
});

export default AddMemberModal;
