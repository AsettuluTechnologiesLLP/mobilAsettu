import { colors, fontSizes, radii, spacing, Text, vscale } from '@ui';
import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
  ViewStyle,
} from 'react-native';

type Props = {
  value: string;
  onChangeText: (digits: string) => void;
  error?: string | null;
  placeholder?: string;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
  onValidityChange?: (valid: boolean) => void;
};

const DIAL_CODE = '+91';
const FLAG = '🇮🇳';

const sanitizeDigits = (s: string) => s.replace(/\D+/g, '').slice(0, 10);
const isValidIndianMobile = (digits: string) => /^\d{10}$/.test(digits) && /^[6-9]/.test(digits);

// Responsive letter spacing: smaller on compact screens to avoid overflow
const DEVICE_WIDTH = Dimensions.get('window').width;
const LETTER_SPACING = DEVICE_WIDTH < 360 ? 0.5 : DEVICE_WIDTH < 380 ? 0.9 : 1.2;

const PhoneInput = forwardRef<TextInput, Props>(function PhoneInput(
  {
    value,
    onChangeText,
    error,
    placeholder = 'Phone number',
    disabled = false,
    style,
    testID = 'phone-input',
    onValidityChange,
  },
  ref,
) {
  const [focused, setFocused] = useState(false);

  const internalError = useMemo(() => {
    const v = sanitizeDigits(value);
    if (v.length === 0) return null;
    if (!/^[6-9]/.test(v)) return 'Number must start with 6–9';
    if (v.length < 10) return 'Enter 10 digits';
    return null;
  }, [value]);

  const showError = error ?? internalError;
  const valid = isValidIndianMobile(sanitizeDigits(value));

  useEffect(() => {
    onValidityChange?.(valid);
  }, [valid, onValidityChange]);

  const borderColor = showError ? colors.error : focused ? colors.buttonBackground : colors.border;

  const handleChange = (t: string) => onChangeText(sanitizeDigits(t));

  const onKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    const k = e.nativeEvent.key;
    if (!/^\d$/.test(k) && k !== 'Backspace') {
      e.preventDefault?.();
    }
  };

  return (
    <View style={style} testID={testID} accessibilityLabel="Phone number input">
      <View style={[styles.container, { borderColor, opacity: disabled ? 0.5 : 1 }]}>
        {/* Fixed flag + dial code */}
        <View style={styles.codeBox} pointerEvents="none">
          <Text style={styles.flag}>{FLAG}</Text>
          <Text weight="semibold" style={styles.code}>
            {DIAL_CODE}
          </Text>
        </View>

        {/* Single-line numeric input (no wrapping) */}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyPress={onKeyPress}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={Platform.OS === 'android' ? 'numeric' : 'number-pad'}
          inputMode="numeric"
          multiline={false} // ← force single line
          maxLength={10}
          returnKeyType="done"
          selectionColor={colors.buttonBackground}
          style={styles.input}
          maxFontSizeMultiplier={1.1} // ← limit huge system scaling
          accessibilityLabel="Enter 10 digit mobile number"
        />
      </View>

      {/* Reserved error slot below (keeps layout stable) */}
      <View style={styles.errorSlot}>
        {showError ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {showError}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

export default PhoneInput;

const HEIGHT = vscale(56);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    borderTopLeftRadius: radii.lg,
    borderBottomLeftRadius: radii.lg,
    minHeight: HEIGHT,
  },
  flag: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  code: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  input: {
    flex: 1,
    minWidth: 0, // ← critical: allow shrinking in a row
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    letterSpacing: LETTER_SPACING, // ← responsive letter-spacing
    color: colors.textPrimary,
    textAlignVertical: 'center', // Android vertical centering
    includeFontPadding: false as any, // reduce extra top/bottom space on Android
  },
  errorSlot: {
    height: vscale(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
});
