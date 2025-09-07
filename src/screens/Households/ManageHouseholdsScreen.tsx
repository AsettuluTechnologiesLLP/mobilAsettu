// src/screens/Households/ManageHouseholdsScreen.tsx
import ROUTES from '@navigation/routes';
import type { ProfileStackParamList } from '@navigation/stacks/ProfileStack';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Screen, Text } from '@ui';
import { colors, spacing } from '@ui/tokens';
import logger from '@utils/logger';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import HouseholdTilesList from './components/HouseholdTilesList';
import useHouseholdsViewAll from './hooks/useHouseholdsViewAll';

type Nav = NativeStackNavigationProp<ProfileStackParamList, typeof ROUTES.MANAGE_HOUSEHOLDS>;
type Rte = RouteProp<ProfileStackParamList, typeof ROUTES.MANAGE_HOUSEHOLDS>;

const HeaderSyncBar = ({ visible }: { visible: boolean }) =>
  visible ? (
    <View style={styles.syncBar}>
      <Text style={styles.syncText}>Updating…</Text>
    </View>
  ) : null;

export default function ManageHouseholdsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rte>();

  // Hook exposes a silent 'softRefreshing' for iOS flicker-free refreshes
  const { households, loading, error, softRefreshing, refresh } = useHouseholdsViewAll();

  // If we came back from details with { removedId }, hide it immediately
  const removedId = route.params?.removedId;
  const data = removedId ? households.filter((h) => h.id !== removedId) : households;

  // One-shot background refresh after removal, then clear the param
  React.useEffect(() => {
    if (removedId) {
      navigation.setParams({ removedId: undefined } as any);
      refresh().catch(() => {});
    }
  }, [removedId, navigation, refresh]);

  const goToCreate = () => {
    navigation.navigate(ROUTES.ADD_HOUSEHOLD);
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
      <View style={styles.container}>
        <HeaderSyncBar visible={!!data.length && softRefreshing} />

        {loading && data.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator />
            {error ? <Text style={styles.error}>{String(error)}</Text> : null}
          </View>
        ) : data.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>You’re not part of any household yet.</Text>
            <Button title="Create your first household" onPress={goToCreate} />
          </View>
        ) : (
          <>
            <HouseholdTilesList
              data={data}
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

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    flex: 1,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: colors.error, marginTop: spacing.md },
  emptyText: { color: colors.textSecondary, marginBottom: spacing.md, textAlign: 'center' },
  syncBar: {
    paddingVertical: 6,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.badgeBg,
    marginBottom: spacing.xs,
  },
  syncText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
});
