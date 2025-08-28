// src/screens/Households/ManageHouseholdsScreen.tsx
import ROUTES from '@navigation/routes';
import type { ProfileStackParamList } from '@navigation/stacks/ProfileStack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Screen, Text } from '@ui';
import { colors, spacing } from '@ui/tokens';
import logger from '@utils/logger';
import React from 'react';
import { ActivityIndicator, Alert, FlatList, View } from 'react-native';

import HouseholdTile from './components/HouseholdTile';
import useHouseholdsViewAll, {
  HouseholdListItem as HookHouseholdListItem,
} from './hooks/useHouseholdsViewAll';
import type { HouseholdListItem as TileItem } from './model/households';

type Nav = NativeStackNavigationProp<ProfileStackParamList, typeof ROUTES.MANAGE_HOUSEHOLDS>;

/** Map the hook's item shape to the tile's model shape */
function toTileItem(h: HookHouseholdListItem): TileItem {
  const role = (h.myRole || '').toUpperCase();

  return {
    id: h.id,
    name: h.name || '',
    ownerDisplayName: h.ownerName || '',
    addressLine: h.address || '',
    city: h.city || '',
    myRole: h.myRole || 'MEMBER',
    isUserOwner: role === 'PRIMARY OWNER' || role === 'OWNER',

    // Optional fields: provide safe fallbacks
    memberCount: (h as any).memberCount ?? 0,
    propertyOwnershipStatus: (h as any).propertyOwnershipStatus ?? null,
    occupancyStatus: (h as any).occupancyStatus ?? null,
    householdType: (h as any).householdType ?? null,
    updatedAt: null,
  };
}

export default function ManageHouseholdsScreen() {
  const navigation = useNavigation<Nav>();
  const { households, loading, error } = useHouseholdsViewAll(); // unchanged

  const goToCreate = () => {
    // navigation.navigate(ROUTES.CREATE_HOUSEHOLD);
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

  const renderItem = ({ item }: { item: HookHouseholdListItem }) => {
    const tileItem = toTileItem(item);

    return (
      <HouseholdTile
        item={tileItem}
        onPress={(id) =>
          onTilePress(id, {
            name: tileItem.name,
            address: tileItem.addressLine,
            city: tileItem.city,
            myRole: tileItem.myRole,
          })
        }
      />
    );
  };

  return (
    // Let native header handle top inset; no default padding
    <Screen safe={false} padded={false}>
      {/* Tiny custom padding so the first card doesn't touch the header */}
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
            <FlatList
              data={households}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              bounces={false}
              alwaysBounceVertical={false}
              overScrollMode="never"
              contentInsetAdjustmentBehavior="never"
              contentContainerStyle={{ paddingBottom: spacing.xl }}
              showsVerticalScrollIndicator={false}
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
