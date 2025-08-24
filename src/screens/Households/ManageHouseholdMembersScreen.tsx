// src/screens/Households/ManageHouseholdMembersScreen.tsx
import { Button, Screen, Text } from '@ui';
import { colors, fontSizes, lineHeights, spacing } from '@ui/tokens';
import logger from '@utils/logger';
import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';

export default function ManageHouseholdMembersScreen() {
  useEffect(() => {
    logger.debug('ManageHouseholdMembersScreen >>>> Mounted');
    return () => logger.debug('ManageHouseholdMembersScreen <<<< Unmounted');
  }, []);

  return (
    // Native header handles back & top inset
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
            Manage members in your household. (Placeholder content)
          </Text>

          <Button
            title="Add Member"
            onPress={() => {
              /* TODO: navigate to add member */
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
