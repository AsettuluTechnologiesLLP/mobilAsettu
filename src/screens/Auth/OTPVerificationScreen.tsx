import { Logos } from '@assets/image';
import PrimaryButton from '@components/buttons/PrimaryButton';
import OTPInput from '@components/inputs/OTPInput';
import ErrorText from '@components/typography/ErrorText';
import authStyles from '@styles/authStyles';
import { Screen } from '@ui';
import otpStyles from '@ui/primitives/otp';
import logger from '@utils/logger';
import React, { useEffect } from 'react';
import { Image, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';

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

  useEffect(() => {
    logger.debug('OTPVerificationScreen >>>> Mounted');
    return () => logger.debug('OTPVerificationScreen <<<< Unmounted');
  }, []);

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={authStyles.loginScreenContainer}
      >
        <Image
          source={Logos.wordmarkBlack}
          style={[authStyles.authScreenLogo, otpStyles.logo]}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />

        <Text style={otpStyles.message}>
          Enter OTP sent to {countryCode} {phoneNumber}
        </Text>

        <OTPInput ref={otpInputRef} value={otp} onChangeText={setOtp} />

        {/* Fixed-height error slot so nothing shifts */}
        <View style={otpStyles.errorSlot}>
          {error ? (
            <ErrorText message={error} />
          ) : (
            <Text style={otpStyles.errorPlaceholder}>.</Text>
          )}
        </View>

        {/* Fixed-height slot for timer / resend so layout stays stable */}
        <View style={otpStyles.resendSlot}>
          {timer > 0 ? (
            <Text style={otpStyles.timer}>Resend OTP in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
              <Text style={otpStyles.resend}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        <PrimaryButton
          title="Login"
          onPress={handleVerifyOtp}
          loading={loading}
          disabled={!isOtpFilled || loading}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
