import { Screen, Text } from '@ui';
import { colors, fontSizes, spacing } from '@ui/tokens';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function ServicesScreen() {
  return (
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
            Services
          </Text>

          <Text>A clean placeholder screen. Build your services screen components here later.</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
