// src/screens/Households/ManageHouseholdsScreen.tsx
import ROUTES from '@navigation/routes';
import type { ProfileStackParamList } from '@navigation/stacks/ProfileStack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Screen, Text } from '@ui';
import { colors, spacing } from '@ui/tokens';
import logger from '@utils/logger';
import React from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import HouseholdTilesList from './components/HouseholdTilesList';
import useHouseholdsViewAll from './hooks/useHouseholdsViewAll';

type Nav = NativeStackNavigationProp<ProfileStackParamList, typeof ROUTES.MANAGE_HOUSEHOLDS>;

export default function ManageHouseholdsScreen() {
  const navigation = useNavigation<Nav>();
  const { households, loading, error } = useHouseholdsViewAll();

  const goToCreate = () => {
    Alert.alert('Coming soon', 'Create Household screen is not wired yet.');
  };

  const onTilePress = (
    id: string,
    seed: { name: string; address: string; city: string; myRole: string },
  ) => {
    logger.info('household.row.press', { id });
    navigation.navigate(ROUTES.MANAGE_HOUSEHOLD_DETAILS, {
      householdId: id,
      seed,
      mode: (seed.myRole || '').toUpperCase() === 'PRIMARY OWNER' ? 'edit' : 'view',
    });
  };

  return (
    <Screen safe={false} padded={false}>
      <View
        style={{
          paddingTop: spacing.sm,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.md,
          flex: 1,
        }}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator />
            {error ? (
              <Text style={{ color: colors.error, marginTop: spacing.md }}>{String(error)}</Text>
            ) : null}
          </View>
        ) : households.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text
              style={{ color: colors.textSecondary, marginBottom: spacing.md, textAlign: 'center' }}
            >
              You’re not part of any household yet.
            </Text>
            <Button title="Create your first household" onPress={goToCreate} />
          </View>
        ) : (
          <>
            {/* ✅ New list renders all tiles */}
            <HouseholdTilesList
              data={households}
              onPress={(id, seed) => onTilePress(id, seed)}
              contentBottomPadding={spacing.xl}
            />

            <View style={{ marginTop: spacing.md }}>
              <Button title="Add Household" onPress={goToCreate} />
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}
