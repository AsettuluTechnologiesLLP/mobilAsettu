// src/screens/Assets/ManageAssetsScreen.tsx
import { Button, Screen, Text } from '@ui';
import { colors, fontSizes, lineHeights, spacing } from '@ui/tokens';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function ManageAssetsScreen() {
  return (
    // Native header (from ProfileStack) provides back + title + safe-area
    <Screen safe={false} padded={false}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.md, flexGrow: 1 }}
      >
        <View style={{ flex: 1 }}>
          <Text
            color={colors.textSecondary}
            style={{
              fontSize: fontSizes.md,
              lineHeight: lineHeights.md,
              marginBottom: spacing.lg,
            }}
          >
            Manage your assets here. (Placeholder content)
          </Text>

          <Button
            title="Add Asset"
            onPress={() => {
              /* TODO: navigate to asset create */
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
