import { type CreateHouseholdPayload, type IdName } from '@services/api/householdApi';
import { colors } from '@ui/tokens';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  typeOptions: IdName[];
  ownershipOptions: IdName[];
  occupancyOptions: IdName[];
  onChange?: (state: { isValid: boolean; payload?: CreateHouseholdPayload }) => void;
};

const isSixDigitPin = (s: string) => /^\d{6}$/.test(String(s || '').trim());

const CreateBasicDetailsForm: React.FC<Props> = ({
  typeOptions,
  ownershipOptions,
  occupancyOptions,
  onChange,
}) => {
  // Text fields
  const [householdName, setHouseholdName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('');

  // Selects
  const [type, setType] = useState<IdName | null>(null);
  const [ownership, setOwnership] = useState<IdName | null>(null);
  const [occupancy, setOccupancy] = useState<IdName | null>(null);

  // simple selector modal
  const [pickerOpen, setPickerOpen] = useState<null | {
    kind: 'type' | 'ownership' | 'occupancy';
  }>(null);

  const isValid = useMemo(() => {
    if (!householdName.trim()) return false;
    if (!addressLine1.trim()) return false;
    if (!city.trim() || !state.trim() || !country.trim()) return false;
    if (!isSixDigitPin(pincode)) return false;
    if (!type || !ownership || !occupancy) return false;
    return true;
  }, [householdName, addressLine1, city, state, country, pincode, type, ownership, occupancy]);

  const payload: CreateHouseholdPayload | undefined = isValid
    ? {
        householdName: householdName.trim(),
        householdTypeId: type!.id,
        ownershipStatusId: ownership!.id,
        occupancyStatusId: occupancy!.id,
        address: {
          addressLine1: addressLine1.trim(),
          landmark: landmark.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          pincode: pincode.trim(),
        },
      }
    : undefined;

  useEffect(() => {
    onChange?.({ isValid, payload });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isValid,
    householdName,
    addressLine1,
    landmark,
    city,
    state,
    country,
    pincode,
    type,
    ownership,
    occupancy,
  ]);

  const renderPicker = (kind: 'type' | 'ownership' | 'occupancy') => {
    const opts =
      kind === 'type' ? typeOptions : kind === 'ownership' ? ownershipOptions : occupancyOptions;
    const title =
      kind === 'type'
        ? 'Select Type'
        : kind === 'ownership'
        ? 'Select Ownership'
        : 'Select Occupancy';

    const currentId =
      kind === 'type' ? type?.id : kind === 'ownership' ? ownership?.id : occupancy?.id;

    const onPick = (opt: IdName) => {
      if (kind === 'type') setType(opt);
      else if (kind === 'ownership') setOwnership(opt);
      else setOccupancy(opt);
      setPickerOpen(null);
    };

    return (
      <Modal transparent visible animationType="fade" onRequestClose={() => setPickerOpen(null)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{title}</Text>
            {opts.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.option,
                  currentId === opt.id ? { borderColor: colors.textPrimary } : null,
                ]}
                onPress={() => onPick(opt)}
              >
                <Text style={styles.optionText}>{opt.name}</Text>
              </TouchableOpacity>
            ))}
            <Pressable style={[styles.btn, styles.ghost]} onPress={() => setPickerOpen(null)}>
              <Text style={[styles.btnText, styles.ghostBtnText]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Basic Details</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Household name *</Text>
        <TextInput
          value={householdName}
          onChangeText={setHouseholdName}
          placeholder="e.g., MyHome Vihanga B10-601"
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.row2}>
        <View style={[styles.field, styles.flex1]}>
          <Text style={styles.label}>Type *</Text>
          <Pressable style={styles.select} onPress={() => setPickerOpen({ kind: 'type' })}>
            <Text style={styles.selectText}>{type?.name || 'Choose type'}</Text>
          </Pressable>
        </View>

        <View style={[styles.field, styles.flex1]}>
          <Text style={styles.label}>Ownership *</Text>
          <Pressable style={styles.select} onPress={() => setPickerOpen({ kind: 'ownership' })}>
            <Text style={styles.selectText}>{ownership?.name || 'Choose ownership'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Occupancy *</Text>
        <Pressable style={styles.select} onPress={() => setPickerOpen({ kind: 'occupancy' })}>
          <Text style={styles.selectText}>{occupancy?.name || 'Choose occupancy'}</Text>
        </Pressable>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Address line 1 *</Text>
        <TextInput
          value={addressLine1}
          onChangeText={setAddressLine1}
          placeholder="Apartment / Plot, Road"
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Landmark</Text>
        <TextInput
          value={landmark}
          onChangeText={setLandmark}
          placeholder="(optional)"
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.row3}>
        <View style={[styles.field, styles.flex1]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Hyderabad"
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={[styles.field, styles.flex1]}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            value={state}
            onChangeText={setState}
            placeholder="Telangana"
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      <View style={styles.row3}>
        <View style={[styles.field, styles.flex1]}>
          <Text style={styles.label}>Country *</Text>
          <TextInput
            value={country}
            onChangeText={setCountry}
            placeholder="India"
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={[styles.field, styles.flex1]}>
          <Text style={styles.label}>PIN code *</Text>
          <TextInput
            value={pincode}
            onChangeText={setPincode}
            placeholder="500032"
            keyboardType="number-pad"
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            maxLength={6}
          />
          {!isSixDigitPin(pincode) && pincode.length > 0 ? (
            <Text style={styles.hintError}>Enter a valid 6-digit PIN</Text>
          ) : null}
        </View>
      </View>

      {/* selector modal */}
      {pickerOpen ? renderPicker(pickerOpen.kind) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },

  field: { marginBottom: 8 },
  label: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
  },

  row2: { flexDirection: 'row', gap: 12 },
  row3: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },

  select: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectText: { color: colors.textPrimary },

  hintError: { marginTop: 4, color: colors.danger, fontSize: 11 },

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
    marginBottom: 8,
  },
  optionText: { fontSize: 14, color: colors.textPrimary },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.buttonBackground,
    borderRadius: 10,
  },
  btnText: { color: colors.buttonTextOn, fontWeight: '700' },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  ghostBtnText: { color: colors.textPrimary },
});

export default CreateBasicDetailsForm;
