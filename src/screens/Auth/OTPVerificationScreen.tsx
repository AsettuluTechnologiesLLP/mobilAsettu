// src/screens/Auth/OTPVerificationScreen.tsx
import { Logos } from '@assets/image';
import { Button, colors, OTPInput, otpStyles, Screen, spacing, Text, vscale } from '@ui';
import type { OTPInputRef } from '@ui/primitives/OTPInput';
import React from 'react';
import { Image, KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';

import { useOtpLogic } from './hooks/useOtpLogic';

type Props = {
  route: { params: { phoneNumber: string; countryCode: string } };
  navigation: any;
};

export default function OTPVerificationScreen({ route }: Props) {
  const { phoneNumber, countryCode } = route.params;

  const {
    otp,
    setOtp,
    error,
    loading,
    timer,
    isOtpFilled,
    otpInputRef,
    handleResendOtp,
    handleVerifyOtp,
  } = useOtpLogic({ phoneNumber, countryCode });

  return (
    <Screen bg={colors.background} padded>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Logo 20% below the top — same as Login */}
        <View style={{ marginTop: '25%', alignItems: 'center' }}>
          <Image
            source={Logos.wordmarkBlack}
            style={{ height: vscale(48) }}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
            accessibilityLabel="Asettu"
          />
        </View>

        {/* Centered content column at 80% width */}
        <View style={{ width: '80%', alignSelf: 'center' }}>
          {/* Maintain the same gap from logo to OTP boxes as Login: spacing.xl */}
          <View style={{ marginTop: spacing.xl }}>
            {/* Instruction (small gap above OTP boxes) */}
            <Text
              style={{
                textAlign: 'center',
                color: colors.text,
                marginBottom: spacing.sm,
                marginTop: '7%',
              }}
              allowFontScaling
              maxFontSizeMultiplier={1.2}
            >
              Enter OTP sent to {countryCode} {phoneNumber}
            </Text>

            {/* OTP boxes */}
            <OTPInput
              ref={otpInputRef as React.RefObject<OTPInputRef>}
              value={otp}
              onChangeText={setOtp}
            />

            {/* Fixed-height error slot (prevents layout jump) */}
            <View style={[otpStyles.errorSlot, { marginTop: spacing.xs }]}>
              {error ? (
                <Text style={{ color: colors.error, textAlign: 'center' }}>{error}</Text>
              ) : (
                <Text style={otpStyles.errorPlaceholder}>.</Text>
              )}
            </View>

            {/* Fixed-height resend/timer slot (small gap) */}
            <View style={[otpStyles.resendSlot, { marginTop: spacing.sm }]}>
              {timer > 0 ? (
                <Text style={otpStyles.timer}>Resend OTP in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                  <Text style={otpStyles.resend}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Maintain the same gap from field to button as Login: spacing.lg */}
            <View style={{ marginTop: spacing.lg }}>
              <Button
                title="Login"
                onPress={handleVerifyOtp}
                loading={loading}
                disabled={!isOtpFilled || loading}
                style={{ width: '100%' }} // matches OTP width (80% of screen via parent)
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
