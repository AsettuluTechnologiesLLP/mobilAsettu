// src/ui/primitives/OTPInput.tsx
import { font, vscale } from '@ui/responsive';
import { colors, OTP_ERROR_SLOT_HEIGHT, OTP_RESEND_SLOT_HEIGHT, radii, spacing } from '@ui/tokens';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

export type OTPInputRef = { focus: () => void; reset: () => void };

type OTPInputProps = {
  value: string[]; // ['', '', '', '']
  onChangeText: (next: string[]) => void;
  length?: number; // default 4
  testID?: string;
  showCaret?: boolean; // default false
  fontFamily?: string; // optional
};

const BOX = Math.round(vscale(44));
const FONT = Math.min(Math.round(BOX * 0.58), font(20));
const INNER_H = Math.round(FONT * 1.25);
const sanitize = (s: string) => s.replace(/\D+/g, '');

const findNextEmpty = (from: number, arr: string[]) => {
  for (let i = from; i < arr.length; i++) if (!arr[i]) return i;
  return -1;
};

const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(
  (
    { value, onChangeText, length = 4, testID = 'otp-input', showCaret = false, fontFamily },
    ref,
  ) => {
    const inputRefs = useRef<Array<TextInput | null>>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    // Which index should show a "select all" selection (0..1) on focus
    const [selectAllIndex, setSelectAllIndex] = useState<number | null>(null);

    const focusAt = useCallback((i: number) => inputRefs.current[i]?.focus(), []);
    const focusFirst = useCallback(() => focusAt(0), [focusAt]);

    const reset = useCallback(() => {
      onChangeText(new Array(length).fill(''));
      setSelectAllIndex(null);
      focusFirst();
    }, [length, onChangeText, focusFirst]);

    useImperativeHandle(ref, () => ({ focus: focusFirst, reset }), [focusFirst, reset]);

    useEffect(() => {
      if (value.length !== length) onChangeText(new Array(length).fill(''));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [length]);

    const handleChangeText = useCallback(
      (raw: string, index: number) => {
        const digits = sanitize(raw);
        const next = [...value];

        if (digits.length === 0) {
          next[index] = '';
          onChangeText(next);
          // keep selection for quick retype
          setSelectAllIndex(index);
          return;
        }

        if (digits.length > 1) {
          // Paste handling
          if (!value[index]) {
            for (let i = 0; i < digits.length && index + i < next.length; i++) {
              next[index + i] = digits[i];
            }
            onChangeText(next);
            const lastIdx = Math.min(index + digits.length - 1, next.length - 1);
            const n = findNextEmpty(lastIdx + 1, next);
            (n !== -1 ? inputRefs.current[n] : inputRefs.current[lastIdx])?.focus?.();
          } else {
            // Box had a digit → replace current with the last typed char
            next[index] = digits[digits.length - 1];
            onChangeText(next);
            const n = findNextEmpty(index + 1, next);
            if (n !== -1) inputRefs.current[n]?.focus?.();
          }
          setSelectAllIndex(null);
          return;
        }

        // Single char: replace current, move to next empty
        next[index] = digits;
        onChangeText(next);
        setSelectAllIndex(null);
        const n = findNextEmpty(index + 1, next);
        if (n !== -1) inputRefs.current[n]?.focus?.();
      },
      [value, onChangeText],
    );

    const handleKeyPress = useCallback(
      (e: any, index: number) => {
        if (e?.nativeEvent?.key !== 'Backspace') return;

        if (index === 0 && value[0] === '') {
          reset();
          return;
        }

        if (value[index] === '') {
          if (index > 0) {
            const next = [...value];
            next[index - 1] = '';
            onChangeText(next);
            setSelectAllIndex(index - 1);
            focusAt(index - 1);
          }
        } else {
          const next = [...value];
          next[index] = '';
          onChangeText(next);
          setSelectAllIndex(index); // ready to replace
        }
      },
      [value, onChangeText, reset, focusAt],
    );

    const onFocusBox = (index: number) => {
      setFocusedIndex(index);
      // If the box already has a digit, select it so the next key replaces it
      if (value[index]) setSelectAllIndex(index);
      else setSelectAllIndex(null);
    };

    const selectionFor = (index: number) =>
      selectAllIndex === index ? { start: 0, end: 1 } : undefined;

    const boxStyleFor = (index: number) => {
      const isFocused = focusedIndex === index;
      const isFilled = !!value[index];
      if (isFocused) return { borderColor: colors.focus, borderWidth: 2 };
      if (isFilled) return { borderColor: colors.textSecondary, borderWidth: 1 };
      return { borderColor: colors.border, borderWidth: 1 };
    };

    const resolvedFontFamily =
      fontFamily ?? Platform.select({ ios: 'Menlo', android: 'monospace', default: undefined });

    return (
      <View style={styles.otpContainer} testID={testID} accessibilityLabel="OTP input">
        {Array.from({ length }).map((_, index) => (
          <View key={index} style={[styles.boxBase, boxStyleFor(index)]}>
            <TextInput
              ref={(el: TextInput | null) => {
                inputRefs.current[index] = el;
              }}
              style={[styles.innerInput, { fontFamily: resolvedFontFamily }]}
              value={value[index] ?? ''}
              onChangeText={(t) => handleChangeText(t, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => onFocusBox(index)}
              onBlur={() => {
                setFocusedIndex((prev) => (prev === index ? null : prev));
                if (selectAllIndex === index) setSelectAllIndex(null);
              }}
              selection={selectionFor(index)} // ← select-all when focused & filled
              keyboardType={Platform.select({ ios: 'number-pad', android: 'number-pad' })}
              inputMode="numeric"
              maxLength={1}
              blurOnSubmit={false}
              autoFocus={index === 0}
              autoCapitalize="none"
              autoCorrect={false}
              allowFontScaling
              maxFontSizeMultiplier={1.05}
              selectionColor={colors.selection}
              cursorColor={colors.selection as any}
              underlineColorAndroid="transparent"
              caretHidden={!showCaret}
              textAlign="center"
              textAlignVertical="center"
              textContentType="oneTimeCode"
              importantForAutofill="yes"
              testID={`${testID}-box-${index}`}
            />
          </View>
        ))}
      </View>
    );
  },
);

export default OTPInput;

/** Helper styles for the OTP screen (logo/message/error/resend). */
export const otpStyles = StyleSheet.create({
  logo: { marginBottom: vscale(16) },
  message: {
    textAlign: 'center',
    color: colors.text,
    fontSize: font(14),
    marginTop: vscale(8),
    marginBottom: vscale(8),
  },
  errorSlot: {
    height: OTP_ERROR_SLOT_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    marginTop: vscale(6),
  },
  errorPlaceholder: {
    opacity: 0,
    includeFontPadding: false as unknown as boolean,
    lineHeight: OTP_ERROR_SLOT_HEIGHT,
    textAlign: 'center' as const,
  },
  resendSlot: {
    height: OTP_RESEND_SLOT_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  timer: { color: colors.textSecondary, fontSize: font(14) },
  resend: { color: colors.buttonBackground, fontWeight: '600', fontSize: font(14) },
});

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: vscale(12),
  },
  boxBase: {
    width: BOX,
    height: BOX,
    borderRadius: radii.md,
    marginHorizontal: Math.max(spacing.sm - 2, 4),
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerInput: {
    width: '100%',
    height: INNER_H,
    lineHeight: INNER_H,
    fontSize: FONT,
    color: colors.text,
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
});
