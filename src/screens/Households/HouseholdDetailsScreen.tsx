// src/screens/Households/HouseholdDetailsScreen.tsx
import ROUTES from '@navigation/routes';
import type { ProfileStackParamList } from '@navigation/stacks/ProfileStack';
import { type RouteProp, useRoute } from '@react-navigation/native';
import { Button, Screen, Text } from '@ui';
import { colors, fontSizes, lineHeights, radii, spacing } from '@ui/tokens';
import logger from '@utils/logger';
import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import useHouseholdView from './hooks/useHouseholdView';

type RouteT = RouteProp<ProfileStackParamList, typeof ROUTES.MANAGE_HOUSEHOLD_DETAILS>;

export default function HouseholdDetailsScreen() {
  const { params } = useRoute<RouteT>();
  const { householdId, seed } = params;

  const { data, loading, refreshing, error, refresh } = useHouseholdView(householdId);

  // --- Derived display values (fallback to seed while loading) ---
  const displayName = data?.name ?? seed?.name ?? 'Household';
  const roleLabel = data?.my?.role ?? seed?.myRole ?? '';
  const memberCount = data?.counts?.membersActive ?? undefined;

  const addressOneLine = useMemo(() => {
    if (data?.address) {
      const city = data.address.city ? `, ${data.address.city}` : '';
      return `${data.address.line1}${city}`.trim();
    }
    const city = seed?.city ? `, ${seed.city}` : '';
    return `${seed?.address ?? ''}${city}`.trim();
  }, [data?.address, seed?.address, seed?.city]);

  const chips = useMemo(() => {
    const property = data?.statuses?.viewerPropertyOwnership ?? null;
    const occupancy = data?.statuses?.occupancy ?? null;
    const type = data?.statuses?.type ?? null;
    return [property ? `Property: ${property}` : null, occupancy, type].filter(Boolean) as string[];
  }, [data?.statuses]);

  const onLeave = useCallback(() => {
    if (!data?.permissions?.canLeave) return;
    Alert.alert(
      'Leave household?',
      'You will be removed from this household.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            logger.info('household.leave:confirm', { householdId });
            // TODO: wire POST /households/:id/leave then navigate back on success
            Alert.alert('Not implemented', 'Leave household will be wired next.');
          },
        },
      ],
      { cancelable: true },
    );
  }, [data?.permissions?.canLeave, householdId]);

  return (
    <Screen safe padded={false}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={refresh}
            tintColor={colors.textPrimary}
          />
        }
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        bounces={false}
        overScrollMode="never"
      >
        {/* Header */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {displayName}
            </Text>
            {roleLabel ? <RolePill role={roleLabel} /> : null}
          </View>

          {addressOneLine ? (
            <Text style={styles.address} numberOfLines={2}>
              {addressOneLine}
            </Text>
          ) : null}

          {typeof memberCount === 'number' ? (
            <Text style={styles.meta} numberOfLines={1}>
              Members: {memberCount}
            </Text>
          ) : null}
        </View>

        {/* Loading / Error */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        ) : error ? (
          <View style={styles.card}>
            <Text style={styles.error}>{error}</Text>
            <View style={{ marginTop: spacing.sm }}>
              <Button title="Retry" onPress={refresh} />
            </View>
          </View>
        ) : (
          <>
            {/* Status */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.chipsRow}>
                {chips.map((c, idx) => (
                  <Chip key={`${c}-${idx}`} label={c} />
                ))}
              </View>
            </View>

            {/* Members (read-only for now) */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Members</Text>
              <View style={{ marginTop: spacing.xs }}>
                {data?.members?.length ? (
                  data.members.map((m) => (
                    <View key={m.userId} style={styles.memberRow}>
                      <Text style={styles.memberName} numberOfLines={1}>
                        {m.name}
                      </Text>
                      <RolePill role={m.role} />
                    </View>
                  ))
                ) : (
                  <Text style={styles.meta}>No members listed.</Text>
                )}
              </View>
            </View>

            {/* Danger Zone */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                {data?.permissions?.canLeave ? (
                  <Button title="Leave household" onPress={onLeave} />
                ) : null}
                {data?.permissions?.canEdit ? (
                  <Button
                    title="Edit details"
                    onPress={() => {
                      // navigation.navigate(ROUTES.MANAGE_HOUSEHOLD_EDIT, { householdId }) // later
                      Alert.alert('Not implemented', 'Edit details will be wired next.');
                    }}
                  />
                ) : null}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

/* ------- Small pill components (match tile look) ------- */

function RolePill({ role }: { role: string }) {
  return (
    <View style={pillStyles.wrap}>
      <Text style={pillStyles.txt} numberOfLines={1}>
        {role}
      </Text>
    </View>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View style={chipStyles.wrap}>
      <Text style={chipStyles.txt} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/* ----------------- Styles ----------------- */

const BORDER = colors.border;
const CARD_BG = '#F5F7FB';

const styles = StyleSheet.create({
  center: {
    marginTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: colors.error,
    marginTop: spacing.sm,
  },
  card: {
    padding: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  address: {
    marginTop: spacing.xs,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textSecondary,
  },
  meta: {
    marginTop: spacing.xs,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.xs,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  memberName: {
    flex: 1,
    marginRight: spacing.sm,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textPrimary,
  },
});

const pillStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.badgeBg,
    borderWidth: 1,
    borderColor: BORDER,
  },
  txt: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

const chipStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: colors.badgeBg,
  },
  txt: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
