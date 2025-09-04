import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colors, fontSizes, radii, spacing } from '@ui/tokens';
import React, { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleProp, TextInput, View, ViewStyle } from 'react-native';

type Props = {
  /** "DD-MM-YYYY" or empty/null */
  value: string | null;
  onChange: (next: string) => void;

  /** Optional: style the outer wrapper (spacing controlled by the screen) */
  style?: StyleProp<ViewStyle>;

  /** Optional: draw red border when true (error text lives in the screen) */
  hasError?: boolean;

  /** Min/Max constraints (no future by default) */
  minDate?: Date;
  maxDate?: Date;
};

/* helpers */
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const fmt = (d: Date) => `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
const parse = (s?: string | null) => {
  if (!s) return null;
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return isNaN(d.getTime()) ? null : d;
};

/* defaults: no future dates */
const TODAY = new Date();
const DEFAULT_MAX = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
const DEFAULT_MIN = new Date(1900, 0, 1);

export default function DobField({
  value,
  onChange,
  style,
  hasError = false,
  minDate = DEFAULT_MIN,
  maxDate = DEFAULT_MAX,
}: Props) {
  const committedDate = useMemo(() => parse(value) ?? DEFAULT_MAX, [value]);
  const [iosOpen, setIosOpen] = useState(false);
  const [iosTemp, setIosTemp] = useState<Date>(committedDate);

  const label = value ? value : 'DD-MM-YYYY';

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: committedDate,
        onChange: (_e, d) => d && onChange(fmt(d)),
        mode: 'date',
        is24Hour: true,
        minimumDate: minDate,
        maximumDate: maxDate,
      });
    } else {
      setIosTemp(committedDate);
      setIosOpen(true);
    }
  };

  const confirmIos = () => {
    onChange(fmt(iosTemp));
    setIosOpen(false);
  };

  return (
    <View style={style}>
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        style={({ pressed }) => ({
          height: 44,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: hasError ? colors.error : pressed ? colors.textSecondary : colors.border,
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
          style={{ color: value ? colors.text : colors.textSecondary, fontSize: fontSizes.md }}
          pointerEvents="none"
        />
      </Pressable>

      {Platform.OS === 'ios' && (
        <Modal
          visible={iosOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setIosOpen(false)}
        >
          <Pressable
            onPress={() => setIosOpen(false)}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' }}
          >
            <Pressable
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
              <DateTimePicker
                value={iosTemp}
                onChange={(_, d) => d && setIosTemp(d)}
                mode="date"
                display="spinner"
                maximumDate={maxDate}
                minimumDate={minDate}
                style={{ alignSelf: 'stretch' }}
              />
              <View style={{ marginTop: spacing.sm }}>
                <Pressable
                  onPress={confirmIos}
                  style={{ alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12 }}
                >
                  <TextInput editable={false} value="Done" style={{ color: colors.text }} />
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
