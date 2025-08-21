// src/screens/SplashScreen.tsx
import { Logos } from '@assets/image';
import { byShortestSide, Screen, theme } from '@ui';
import React from 'react';
import { Image, View } from 'react-native';

const ICON_SIZE = byShortestSide(0.6, { min: 140, max: 320 });

export default function SplashScreen() {
  return (
    <Screen bg={theme.splashBg}>
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
