import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Button, Text } from '@ui';
import { colors, fontSizes, radii, spacing } from '@ui/tokens';
import React, { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, TextInput, View } from 'react-native';

type Props = {
  /** Stored DOB as "DD-MM-YYYY" or empty/null */
  value: string | null;
  onChange: (next: string) => void;
  error?: string | null;

  /** Optional constraints */
  minDate?: Date;
  maxDate?: Date;
};

/* ---------- helpers ---------- */

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDDMMYYYY(d: Date) {
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

function parseDDMMYYYY(s?: string | null): Date | null {
  if (!s) return null;
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return isNaN(d.getTime()) ? null : d;
}

/* Default constraints: don’t allow future dates */
const TODAY = new Date();
const DEFAULT_MAX = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
const DEFAULT_MIN = new Date(1900, 0, 1);

/* ---------- component ---------- */

export default function DobField({
  value,
  onChange,
  error,
  minDate = DEFAULT_MIN,
  maxDate = DEFAULT_MAX,
}: Props) {
  const committedDate = useMemo(() => parseDDMMYYYY(value) ?? DEFAULT_MAX, [value]);
  const [iosOpen, setIosOpen] = useState(false);
  const [iosTemp, setIosTemp] = useState<Date>(committedDate);

  const label = value ? value : 'DD-MM-YYYY';

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: committedDate,
        onChange: (_event, selected) => {
          if (selected) onChange(formatDDMMYYYY(selected));
        },
        mode: 'date',
        is24Hour: true,
        minimumDate: minDate,
        maximumDate: maxDate,
      });
    } else {
      // iOS modal
      setIosTemp(committedDate);
      setIosOpen(true);
    }
  };

  const closeIos = () => setIosOpen(false);
  const confirmIos = () => {
    onChange(formatDDMMYYYY(iosTemp));
    setIosOpen(false);
  };

  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text
        weight="semibold"
        color={colors.textPrimary}
        style={{ fontSize: fontSizes.sm, marginBottom: spacing.xs }}
      >
        Date of birth
      </Text>

      {/* Non-editable field that opens the picker */}
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        style={({ pressed }) => ({
          height: 44,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: pressed ? colors.textSecondary : colors.border,
          backgroundColor: colors.card,
          paddingHorizontal: spacing.md,
          justifyContent: 'center',
        })}
      >
        <TextInput
          editable={false}
          value={label}
          placeholder="DD-MM-YYYY"
          placeholderTextColor={colors.textMuted}
          style={{
            color: value ? colors.text : colors.textSecondary,
            fontSize: fontSizes.md,
          }}
          pointerEvents="none"
        />
      </Pressable>

      {/* reserved error slot so layout doesn’t jump */}
      <View style={{ minHeight: fontSizes.sm + spacing.xs, marginTop: spacing.xs }}>
        {error ? (
          <Text color={colors.error} style={{ fontSize: fontSizes.sm }}>
            {error}
          </Text>
        ) : null}
      </View>

      {/* iOS modal picker */}
      {Platform.OS === 'ios' && (
        <Modal visible={iosOpen} animationType="slide" transparent onRequestClose={closeIos}>
          <Pressable
            onPress={closeIos}
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.25)',
              justifyContent: 'flex-end',
            }}
          >
            <Pressable
              // capture taps inside the sheet
              onPress={() => {}}
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: radii.lg,
                borderTopRightRadius: radii.lg,
                paddingHorizontal: spacing.md,
                paddingTop: spacing.md,
                paddingBottom: spacing.lg,
              }}
            >
              <View style={{ alignItems: 'flex-end', marginBottom: spacing.sm }}>
                <Button title="Done" onPress={confirmIos} />
              </View>

              <DateTimePicker
                value={iosTemp}
                onChange={(_, d) => {
                  if (d) setIosTemp(d); // don’t commit until Done
                }}
                mode="date"
                display="spinner"
                maximumDate={maxDate}
                minimumDate={minDate}
                style={{ alignSelf: 'stretch' }}
              />

              <View style={{ marginTop: spacing.sm }}>
                <Button variant="secondary" title="Cancel" onPress={closeIos} />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
