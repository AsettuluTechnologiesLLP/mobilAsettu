// If you have an assets aggregator like in SplashScreen:
import { Logos } from '@assets/image';
import PrimaryButton from '@components/buttons/PrimaryButton';
import PhoneInput from '@components/inputs/PhoneInput';
import authStyles from '@styles/authStyles';
import { Screen } from '@ui';
import { vscale } from '@ui/responsive';
import logger from '@utils/logger';
import React, { useEffect } from 'react';
import { Image, KeyboardAvoidingView, Platform, View } from 'react-native';

import { useLoginLogic } from './hooks/useLoginLogic';

export default function LoginScreen({ navigation }: any) {
  const { phoneNumber, setPhoneNumber, error, isValid, loading, phoneInputRef, onGetOtp } =
    useLoginLogic({ navigation, defaultCountryCode: '+91' });

  useEffect(() => {
    logger.debug('LoginScreen >>>> Mounted');
    return () => logger.debug('LoginScreen <<<< Unmounted');
  }, []);

  return (
    <Screen /* bg defaults to theme.bg */>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={authStyles.loginScreenContainer}
      >
        <Image
          // Switch to aggregator for consistency with Splash
          source={Logos.wordmarkBlack} // e.g., map asettuBlackWordLogo -> Logos.wordmarkWhite
          // If you prefer the direct file: require('@assets/asettuBlackWordLogo.png')
          style={[authStyles.authScreenLogo, { marginBottom: vscale(16) }]}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />

        <PhoneInput
          ref={phoneInputRef}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          error={error}
        />

        <View style={authStyles.authButtonContainer}>
          <PrimaryButton
            title="Get OTP"
            onPress={onGetOtp}
            loading={loading}
            disabled={!isValid || loading}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
