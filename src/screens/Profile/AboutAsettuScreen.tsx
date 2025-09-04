import { Screen, Text } from '@ui';
import { colors, fontSizes, lineHeights, spacing } from '@ui/tokens';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function AboutAsettuScreen() {
  return (
    // Native header (from ProfileStack) provides back + title + safe-area
    <Screen safe={false} padded={false}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1 }}>
          {/* Intro */}
          <Text
            color={colors.text}
            style={{ fontSize: fontSizes.md, lineHeight: lineHeights.md, marginBottom: spacing.md }}
          >
            Asettu is your smart companion for managing assets, raising service requests, tracking
            warranties, and connecting with OEMs in one unified app. Built for consumers who want
            convenience, security, and seamless service experiences. Future updates will enable
            product resale, warranty extension purchases, and much more.
          </Text>

          {/* Section heading */}
          <Text
            weight="semibold"
            color={colors.textPrimary}
            style={{ fontSize: fontSizes.md, marginTop: spacing.lg, marginBottom: spacing.xs }}
          >
            Terms & Conditions
          </Text>

          {/* Body */}
          <Text color={colors.text} style={{ fontSize: fontSizes.md, lineHeight: lineHeights.md }}>
            By using Asettu, you agree to our terms of service and privacy policy. We are committed
            to protecting your personal data and providing a secure platform for managing all your
            household or business assets.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
