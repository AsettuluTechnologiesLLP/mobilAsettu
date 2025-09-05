// src/screens/Households/HouseholdDetailsScreen.tsx
import ROUTES from '@navigation/routes';
import type { ProfileStackParamList } from '@navigation/stacks/ProfileStack';
import { type RouteProp, useRoute } from '@react-navigation/native';
import { addHouseholdMember, mapRoleNameToId } from '@services/api';
import { Screen, Text } from '@ui';
import { colors, spacing } from '@ui/tokens';
import React, { useCallback } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, View } from 'react-native';

import MembersTile, { type Member } from './components/MembersTile';
import useHouseholdView from './hooks/useHouseholdView';

type RouteT = RouteProp<ProfileStackParamList, typeof ROUTES.MANAGE_HOUSEHOLD_DETAILS>;

export default function HouseholdDetailsScreen() {
  const { params } = useRoute<RouteT>();
  const { householdId } = params;

  const { data, loading, refreshing, error, refresh } = useHouseholdView(householdId);

  const members: Member[] = (data?.members ?? []).map((m: any) => ({
    id: m.id ?? m.memberId ?? String(m.phone ?? Math.random()),
    name: m.name ?? m.displayName ?? m.phone ?? 'Member',
    phone: m.phone ?? null,
    role: (m.roleName ?? m.role ?? 'MEMBER') as string,
    isYou: !!(m.isYou || m.isSelf || m.self),
  }));

  const canInvite = !!data?.permissions?.canInvite;

  const handleAddFromTile = useCallback(
    async ({ phone, role }: { phone: string; role: string }) => {
      try {
        const digits = String(phone).replace(/\D/g, ''); // quick sanitize
        if (!digits) {
          Alert.alert('Invalid phone', 'Please enter a valid phone number.');
          return;
        }
        const roleId = mapRoleNameToId(role);
        const resp = await addHouseholdMember(householdId, {
          phone: digits,
          countryCode: '+91', // keep your existing default
          roleId,
        });
        if (!resp?.success) throw new Error(resp?.message || 'Failed to add member');
        await refresh();
      } catch (err: any) {
        Alert.alert('Add member failed', err?.message || 'Something went wrong.');
      }
    },
    [householdId, refresh],
  );

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
        {loading ? (
          <View style={{ paddingTop: spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator />
            {error ? (
              <Text style={{ color: colors.error, marginTop: spacing.md }}>{error}</Text>
            ) : null}
          </View>
        ) : error ? (
          <View style={{ padding: spacing.md }}>
            <Text style={{ color: colors.error }}>{error}</Text>
          </View>
        ) : (
          <>
            <MembersTile
              title="Members"
              members={members}
              canEdit={canInvite}
              onAdd={handleAddFromTile}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
