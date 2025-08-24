// src/screens/Households/ManageHouseholdsScreen.tsx
import { Button, Screen, Text } from '@ui';
import { colors, fontSizes, lineHeights, spacing } from '@ui/tokens';
import logger from '@utils/logger';
import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';

export default function ManageHouseholdsScreen() {
  useEffect(() => {
    logger.debug('ManageHouseholdsScreen >>>> Mounted');
    return () => logger.debug('ManageHouseholdsScreen <<<< Unmounted');
  }, []);

  return (
    // Header is shown by the stack, so:
    // - safe={false}: let the native header handle the inset
    // - padded={false}: avoid default Screen padding
    <Screen safe={false} padded={false}>
      <ScrollView
        contentInsetAdjustmentBehavior="never" // no extra top inset
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.md, flexGrow: 1 }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: fontSizes.md,
              lineHeight: lineHeights.md,
              marginBottom: spacing.lg,
            }}
          >
            Manage your households here. (Placeholder content)
          </Text>

          <Button
            title="Add Household"
            onPress={() => {
              /* TODO: navigate to create */
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
