// src/screens/Home/HomeScreen.tsx
import { Screen, Text } from '@ui';
import { colors, fontSizes, spacing } from '@ui/tokens';
import logger from '@utils/logger';
import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';

export default function HomeScreen() {
  useEffect(() => {
    logger.debug('HomeScreen >>>> Mounted');
    return () => logger.debug('HomeScreen <<<< Unmounted');
  }, []);

  return (
    // ⬇️ padded={false} so Screen doesn’t add spacing.xl
    // ⬇️ edges={['top']} keeps only the status-bar/notch inset
    <Screen padded={false} edges={['top']}>
      <ScrollView
        contentInsetAdjustmentBehavior="never" // don’t add another top inset
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          // no extra top padding; add horizontal/bottom only
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.md,
          flexGrow: 1,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            weight="semibold"
            color={colors.textPrimary}
            style={{ fontSize: fontSizes.xl, marginBottom: spacing.sm }}
          >
            Home
          </Text>

          <Text>A clean placeholder screen. Build your home screen components here later.</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
