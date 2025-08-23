// src/screens/Auth/LoginScreen.tsx
import { Logos } from '@assets/image';
import PhoneInput from '@components/inputs/PhoneInput';
import { Button, Screen, vscale } from '@ui';
import logger from '@utils/logger';
import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, View } from 'react-native';

import { useLoginLogic } from './hooks/useLoginLogic';

export default function LoginScreen({ navigation }: any) {
  const { phoneNumber, setPhoneNumber, error, loading, onGetOtp, phoneInputRef } = useLoginLogic({
    navigation,
    defaultCountryCode: '+91',
  });

  const [isPhoneValid, setIsPhoneValid] = useState(false); // driven by PhoneInput

  useEffect(() => {
    logger.debug('LoginScreen >>>> Mounted');
    return () => logger.debug('LoginScreen <<<< Unmounted');
  }, []);

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ marginTop: '25%', alignItems: 'center' }}>
          <Image
            source={Logos.wordmarkBlack}
            resizeMode="contain"
            style={{ height: vscale(48) }}
            accessibilityIgnoresInvertColors
            accessibilityLabel="Asettu"
          />
        </View>

        {/* Phone input at 80% width, centered */}
        <View style={{ marginTop: '20%', width: '80%', alignSelf: 'center' }}>
          <PhoneInput
            ref={phoneInputRef}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Phone Number"
            error={error}
            onValidityChange={setIsPhoneValid} // ← drives button state
          />
        </View>

        {/* CTA matches input width, centered, disabled until valid */}
        <View style={{ marginTop: '5%', width: '80%', alignSelf: 'center' }}>
          <Button
            title="Get OTP"
            onPress={onGetOtp}
            loading={loading}
            disabled={!isPhoneValid || loading}
            style={{ width: '100%' }}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
