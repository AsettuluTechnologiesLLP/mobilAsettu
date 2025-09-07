import { colors } from '@ui/tokens';
import React, { useCallback, useState } from 'react';
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

import {
  HouseholdData,
  HouseholdPermissions,
  HouseholdRef,
  UpdateBasicDetailsPayload,
} from '../model/householdTypes';

type Props = {
  // From HouseholdData
  name: HouseholdData['name'];
  address: HouseholdData['address'];
  statuses: HouseholdData['statuses'];
  refs: Pick<HouseholdData['refs'], 'ownershipOptions' | 'occupancyOptions' | 'typeOptions'>;
  permissions: HouseholdPermissions;

  // UX wiring
  saving?: boolean;
  errorMessage?: string | null;
  onSave: (payload: UpdateBasicDetailsPayload) => void;
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <View style={{ flex: 1 }}>{children}</View>
  </View>
);

const ReadOnly = ({ value }: { value?: string | null }) => (
  <Text style={styles.value}>{value || '—'}</Text>
);

// ---------- Extracted small presentational components (to avoid nested components rule)

const OptionRow = ({ optName, onPress }: { optName: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <Text style={styles.optionText}>{optName}</Text>
  </TouchableOpacity>
);

const OptionSeparator = () => <View style={{ height: 8 }} />;

const OptionList = ({
  title,
  options,
  onPick,
  onCancel,
}: {
  title: string;
  options: HouseholdRef[];
  onPick: (namePicked: string) => void;
  onCancel: () => void;
}) => {
  const renderItem = useCallback(
    ({ item }: { item: HouseholdRef }) => (
      <OptionRow optName={item.name} onPress={() => onPick(item.name)} />
    ),
    [onPick],
  );

  return (
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>{title}</Text>

        <FlatList
          data={options}
          keyExtractor={(o) => String(o.id)}
          ItemSeparatorComponent={OptionSeparator}
          renderItem={renderItem}
        />

        <Pressable style={[styles.btn, styles.ghost]} onPress={onCancel}>
          <Text style={[styles.btnText, styles.ghostBtnText]}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ---------- Simple select field (no nested component definitions inside render)
type SelectProps = {
  label: string;
  value: string;
  options: HouseholdRef[];
  onChange: (newName: string) => void;
};

const SelectField: React.FC<SelectProps> = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);

  const handlePick = useCallback(
    (picked: string) => {
      onChange(picked);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>

      {/* Trigger */}
      <Pressable style={styles.input} onPress={() => setOpen(true)}>
        <Text style={styles.inputText}>{value || 'Select…'}</Text>
      </Pressable>

      {/* Modal sheet */}
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <OptionList
          title={label}
          options={options}
          onPick={handlePick}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </View>
  );
};

// ---------- Helpers
const joinAddress = (addr: Props['address']) =>
  [addr.line1, [addr.city, addr.state].filter(Boolean).join(', '), addr.pincode]
    .filter(Boolean)
    .join(' • ');

// ---------- Main component
export const BasicDetailsCard: React.FC<Props> = ({
  name,
  address,
  statuses,
  refs,
  permissions,
  saving,
  errorMessage,
  onSave,
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  // Draft state for edit mode
  const [draftName, setDraftName] = useState(name);
  const [draftAddress, setDraftAddress] = useState({ ...address });
  const [draftStatuses, setDraftStatuses] = useState({ ...statuses });

  const canEdit = permissions.canEdit;

  const beginEdit = () => {
    if (!canEdit) return;
    setDraftName(name);
    setDraftAddress({ ...address });
    setDraftStatuses({ ...statuses });
    setMode('edit');
  };

  const cancel = () => setMode('view');

  const commit = () => {
    const payload: UpdateBasicDetailsPayload = {
      name: draftName !== name ? draftName : undefined,
      address: {},
      statuses: {},
    };

    if (draftAddress.line1 !== address.line1) payload.address!.line1 = draftAddress.line1;
    if (draftAddress.city !== address.city) payload.address!.city = draftAddress.city;
    if (draftAddress.state !== address.state) payload.address!.state = draftAddress.state;
    if (draftAddress.pincode !== address.pincode) payload.address!.pincode = draftAddress.pincode;

    if (draftStatuses.propertyOwnership !== statuses.propertyOwnership)
      payload.statuses!.propertyOwnership = draftStatuses.propertyOwnership;
    if (draftStatuses.occupancy !== statuses.occupancy)
      payload.statuses!.occupancy = draftStatuses.occupancy;
    if (draftStatuses.type !== statuses.type) payload.statuses!.type = draftStatuses.type;

    // prune empty nested objects so your backend receives a clean minimal patch
    if (payload.address && Object.keys(payload.address).length === 0) delete payload.address;
    if (payload.statuses && Object.keys(payload.statuses).length === 0) delete payload.statuses;

    onSave(payload);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Basic Details</Text>
          {/* <Text style={{ color: colors.muted ?? '#6B7280', fontSize: 12 }}>Household profile</Text> */}
        </View>

        {mode === 'view' && canEdit && (
          <Pressable style={styles.btn} onPress={beginEdit}>
            <Text style={styles.btnText}>Edit</Text>
          </Pressable>
        )}

        {mode === 'edit' && (
          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.ghost]} onPress={cancel}>
              <Text style={[styles.btnText, styles.ghostBtnText]}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.btn} onPress={commit} disabled={!!saving}>
              <Text style={styles.btnText}>{saving ? 'Saving…' : 'Save'}</Text>
            </Pressable>
          </View>
        )}
      </View>

      {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

      {mode === 'view' ? (
        <>
          <Row label="Name">
            <ReadOnly value={name} />
          </Row>
          <Row label="Address">
            <ReadOnly value={joinAddress(address)} />
          </Row>
          <Row label="Ownership">
            <ReadOnly value={statuses.propertyOwnership} />
          </Row>
          <Row label="Occupancy">
            <ReadOnly value={statuses.occupancy} />
          </Row>
          <Row label="Type">
            <ReadOnly value={statuses.type} />
          </Row>
        </>
      ) : (
        <>
          {/* Name & Address inputs */}
          <Row label="Name">
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              style={styles.input}
              placeholder="Household name"
              placeholderTextColor={colors.textMuted ?? '#6B7280'}
            />
          </Row>

          <Row label="Address Line 1">
            <TextInput
              value={draftAddress.line1}
              onChangeText={(t) => setDraftAddress((d) => ({ ...d, line1: t }))}
              style={styles.input}
              placeholder="Address line 1"
              placeholderTextColor={colors.textMuted ?? '#6B7280'}
            />
          </Row>

          <Row label="City">
            <TextInput
              value={draftAddress.city}
              onChangeText={(t) => setDraftAddress((d) => ({ ...d, city: t }))}
              style={styles.input}
              placeholder="City"
              placeholderTextColor={colors.textMuted ?? '#6B7280'}
            />
          </Row>

          <Row label="State">
            <TextInput
              value={draftAddress.state}
              onChangeText={(t) => setDraftAddress((d) => ({ ...d, state: t }))}
              style={styles.input}
              placeholder="State"
              placeholderTextColor={colors.textMuted ?? '#6B7280'}
            />
          </Row>

          <Row label="Pincode">
            <TextInput
              value={draftAddress.pincode}
              onChangeText={(t) => setDraftAddress((d) => ({ ...d, pincode: t }))}
              style={styles.input}
              placeholder="Pincode"
              placeholderTextColor={colors.textMuted ?? '#6B7280'}
              keyboardType="number-pad"
            />
          </Row>

          {/* Dropdowns powered by refs */}
          <SelectField
            label="Ownership"
            value={draftStatuses.propertyOwnership}
            options={refs.ownershipOptions}
            onChange={(picked) => setDraftStatuses((s) => ({ ...s, propertyOwnership: picked }))}
          />

          <SelectField
            label="Occupancy"
            value={draftStatuses.occupancy}
            options={refs.occupancyOptions}
            onChange={(picked) => setDraftStatuses((s) => ({ ...s, occupancy: picked }))}
          />

          <SelectField
            label="Type"
            value={draftStatuses.type}
            options={refs.typeOptions}
            onChange={(picked) => setDraftStatuses((s) => ({ ...s, type: picked }))}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card ?? '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border ?? '#E5E7EB',
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
  title: { fontSize: 18, fontWeight: '700', color: colors.text ?? '#111827' },

  row: { gap: 6, marginVertical: 6 },
  label: { color: colors.textMuted ?? '#6B7280', fontSize: 12 },
  value: { color: colors.text ?? '#111827', fontSize: 14 },

  input: {
    borderWidth: 1,
    borderColor: colors.border ?? '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: colors.surface ?? '#FFFFFF',
    color: colors.text ?? '#111827',
  },
  inputText: { fontSize: 14, color: colors.text ?? '#111827' },

  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.buttonBackground,
    borderRadius: 10,
  },

  btnText: {
    color: colors.buttonTextOn,
    fontWeight: '700',
  },

  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostBtnText: {
    color: colors.textPrimary, // dark text for outline button
  },

  actions: { flexDirection: 'row', gap: 8 },
  error: { color: colors.danger ?? '#B00020', marginBottom: 8 },

  // modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: colors.card ?? '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border ?? '#E5E7EB',
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: colors.text ?? '#111827' },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border ?? '#E5E7EB',
    backgroundColor: colors.surface ?? '#fff',
  },
  optionText: { fontSize: 14, color: colors.text ?? '#111827' },
});

export default BasicDetailsCard;
