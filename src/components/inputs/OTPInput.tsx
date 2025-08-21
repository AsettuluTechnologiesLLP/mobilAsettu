import otpInputStyles from '@ui/primitives/otpInput';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { Platform, TextInput, View } from 'react-native';

type OTPInputProps = {
  value: string[]; // e.g. ['', '', '', '']
  onChangeText: (textArray: string[]) => void;
  length?: number; // default 4
};

export type OTPInputRef = {
  focus: () => void;
  reset: () => void;
};

const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(
  ({ value, onChangeText, length = 4 }, ref) => {
    const inputRefs = useRef<Array<TextInput | null>>([]);

    const focusAt = useCallback((idx: number) => {
      inputRefs.current[idx]?.focus();
    }, []);

    const focusFirstBox = useCallback(() => focusAt(0), [focusAt]);

    const resetOtp = useCallback(() => {
      onChangeText(new Array(length).fill(''));
      focusFirstBox();
    }, [onChangeText, length, focusFirstBox]);

    useImperativeHandle(ref, () => ({ focus: focusFirstBox, reset: resetOtp }), [
      focusFirstBox,
      resetOtp,
    ]);

    useEffect(() => {
      if (value.length !== length) onChangeText(new Array(length).fill(''));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [length]);

    const handleChangeText = useCallback(
      (raw: string, index: number) => {
        // Keep only 0–9, support multi-character paste
        const digits = raw.replace(/\D+/g, '');
        const next = [...value];

        if (digits.length === 0) {
          next[index] = '';
          onChangeText(next);
          return;
        }

        for (let i = 0; i < digits.length && index + i < value.length; i++) {
          next[index + i] = digits[i];
        }
        onChangeText(next);

        const nextIndex = index + digits.length;
        if (nextIndex < value.length) {
          inputRefs.current[nextIndex]?.focus?.();
        }
      },
      [value, onChangeText],
    );

    const handleKeyPress = useCallback(
      (e: any, index: number) => {
        if (e?.nativeEvent?.key !== 'Backspace') return;

        if (index === 0 && value[0] === '') {
          resetOtp();
          return;
        }

        if (value[index] === '') {
          if (index > 0) {
            const next = [...value];
            next[index - 1] = '';
            onChangeText(next);
            focusAt(index - 1);
          }
        } else {
          const next = [...value];
          next[index] = '';
          onChangeText(next);
        }
      },
      [value, onChangeText, resetOtp, focusAt],
    );

    return (
      <View style={otpInputStyles.otpContainer}>
        {Array.from({ length }).map((_, index) => (
          <TextInput
            key={index}
            ref={(el: TextInput | null) => {
              inputRefs.current[index] = el;
            }}
            style={otpInputStyles.otpBox}
            value={value[index] ?? ''}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType={Platform.select({ ios: 'number-pad', android: 'number-pad' })}
            inputMode="numeric"
            maxLength={1}
            blurOnSubmit={false}
            autoFocus={index === 0}
            autoCapitalize="none"
            autoCorrect={false}
            allowFontScaling
            maxFontSizeMultiplier={1.2}
          />
        ))}
      </View>
    );
  },
);

export default OTPInput;
