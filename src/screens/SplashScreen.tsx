// src/screens/SplashScreen.tsx
import { Logos } from '@assets/image';
import { colors, Screen, splashLogoSize } from '@ui';
import React from 'react';
import { Image, View } from 'react-native';

const ICON_SIZE = splashLogoSize();

export default function SplashScreen() {
  return (
    <Screen bg={colors.splashBackground}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={Logos.iconWhite}
          resizeMode="contain"
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
        />
      </View>
    </Screen>
  );
}
