import ErrorText from '@components/typography/ErrorText';
import { COLORS, SIZES } from '@styles/theme';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

type PhoneInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
  codeTextStyle?: TextStyle;
  inputStyle?: TextStyle;
};

export type PhoneInputRef = {
  focus: () => void;
  blur: () => void;
  clear: () => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Roomy on small phones; avoid runway-wide on large screens
// Slightly wider on Android so the placeholder never truncates
const MAX_CONTAINER_WIDTH = Math.min(SCREEN_WIDTH * 0.9, Platform.OS === 'android' ? 380 : 280);

// Small, consistent bump to all text in this control
const FONT_SCALE = 1.12;
// Fixed height reserved for error (prevents layout jump)
const ERROR_SLOT_HEIGHT = 20;

const PhoneInput = forwardRef<PhoneInputRef, PhoneInputProps>(
  ({ value, onChangeText, error, containerStyle, codeTextStyle }, ref) => {
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => inputRef.current?.clear(),
    }));

    // Keep only digits in the input
    const handleChange = (t: string) => {
      const digits = t.replace(/\D+/g, '');
      onChangeText(digits);
    };

    return (
      <>
        <View style={[styles.inputContainer, containerStyle]}>
          <View style={styles.countryCode}>
            <Text style={styles.flag} accessibilityLabel="India flag">
              🇮🇳
            </Text>
            <Text style={[styles.code, codeTextStyle]}>+91</Text>
          </View>

          <TextInput
            ref={inputRef}
            style={[styles.input, { flex: 1, minWidth: 0 }]}
            placeholder="Enter phone number"
            placeholderTextColor={COLORS.iconUnSelected}
            keyboardType={Platform.select({ ios: 'phone-pad', android: 'phone-pad' })}
            inputMode="numeric"
            textContentType="telephoneNumber"
            autoComplete="tel"
            maxLength={10} // India local number length
            value={value}
            onChangeText={handleChange}
            editable
            autoFocus={Platform.OS === 'ios'}
            allowFontScaling
            // Keep Android at 1.0 to avoid truncation, iOS a bit more generous
            maxFontSizeMultiplier={Platform.OS === 'android' ? 1 : 1.2}
          />
        </View>

        {/* Fixed-height error slot so layout never shifts */}
        <View style={styles.errorSlot}>
          {error ? <ErrorText message={error} /> : <Text style={styles.errorPlaceholder}>.</Text>}
        </View>
      </>
    );
  },
);

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: Math.round(SIZES.paddingSmall * 1.1),
    backgroundColor: COLORS.background,
    maxWidth: MAX_CONTAINER_WIDTH,
    alignSelf: 'center',
    height: Math.round(SIZES.buttonHeight * 1.06),
    marginVertical: SIZES.marginSmall,
    width: '100%', // important for Android placeholder & flexing
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Math.max(SIZES.marginSmall - 4, 4),
  },
  flag: {
    fontSize: Math.round(SIZES.iconLarge * FONT_SCALE),
    marginRight: SIZES.paddingSmall / 2,
    marginLeft: SIZES.paddingSmall / 2,
  },
  code: {
    fontSize: Math.round(SIZES.fontLarge * FONT_SCALE),
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  input: {
    height: '100%',
    fontSize: Math.round(SIZES.fontLarge * FONT_SCALE),
    color: COLORS.text,
    letterSpacing: 0,
    paddingHorizontal: SIZES.paddingSmall,
  },
  errorSlot: {
    height: ERROR_SLOT_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'center',
    alignSelf: 'center',
    maxWidth: MAX_CONTAINER_WIDTH,
    width: '100%',
    marginTop: SIZES.marginSmall,
  },
  errorPlaceholder: {
    opacity: 0, // reserves space without showing text
    includeFontPadding: false,
    lineHeight: ERROR_SLOT_HEIGHT,
  },
});

export default PhoneInput;
