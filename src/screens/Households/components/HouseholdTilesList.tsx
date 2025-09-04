// src/screens/Households/components/HouseholdTilesList.tsx
import { Text } from '@ui';
import { colors, fontSizes, lineHeights, radii, spacing } from '@ui/tokens';
import React, { memo } from 'react';
import { FlatList, type ListRenderItem, StyleSheet, TouchableOpacity, View } from 'react-native';

/** Shape from useHouseholdsViewAll */
export type HHItem = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  myRole?: string | null;
  isUserOwner?: boolean | null;
  memberCount?: number | null;
  propertyOwnershipStatus?: string | null; // 'Owned' / 'Rented' / etc.
  occupancyStatus?: string | null; // 'Vacant' / 'Occupied' / 'Self Occupied'
  householdType?: string | null; // 'Home' / 'Individual' / 'Flat' / 'Plot' / 'Apartment'
};

export default function HouseholdTilesList({
  data,
  onPress,
  contentBottomPadding = spacing.xl,
}: {
  data: HHItem[];
  onPress: (
    id: string,
    seed: { name: string; address: string; city: string; myRole: string },
  ) => void;
  contentBottomPadding?: number;
}) {
  const renderItem: ListRenderItem<HHItem> = ({ item }) => (
    <TileRow item={item} onPress={onPress} />
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(it) => it.id}
      renderItem={renderItem}
      bounces={false}
      alwaysBounceVertical={false}
      overScrollMode="never"
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingBottom: contentBottomPadding }}
      showsVerticalScrollIndicator={false}
    />
  );
}

/* -------------------------------- Row -------------------------------- */

const TileRow = memo(function TileRow({
  item,
  onPress,
}: {
  item: HHItem;
  onPress: (
    id: string,
    seed: { name: string; address: string; city: string; myRole: string },
  ) => void;
}) {
  const role = (item.myRole || 'MEMBER').toUpperCase();
  const isOwner = role === 'PRIMARY OWNER' || role === 'OWNER';
  const title = item.name || '';
  const subtitle = compactAddress(item.address, item.city);

  // Property label transformed for non-owners (Owned → Rented), but no "Property:" prefix
  const property = ownershipLabelForViewer(isOwner, item.propertyOwnershipStatus);

  // Member count: number only
  const count = Math.max(0, toInt(item.memberCount) ?? 0);

  // Chips: property, occupancy, type (non-empty only)
  const chips = [property, item.occupancyStatus, item.householdType].filter(Boolean) as string[];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        onPress(item.id, {
          name: title,
          address: item.address || '',
          city: item.city || '',
          myRole: item.myRole || '',
        })
      }
    >
      <View style={S.card}>
        {/* Header */}
        <View style={S.headerRow}>
          <Text numberOfLines={1} style={S.title}>
            {title}
          </Text>
          <View style={S.headerRight}>
            <Pill label={role} />
            <CountPill value={count} style={{ marginLeft: spacing.xs }} />
          </View>
        </View>

        {/* Address (one line) */}
        {!!subtitle && (
          <Text numberOfLines={1} style={S.address}>
            {subtitle}
          </Text>
        )}

        {/* Chips row */}
        {chips.length > 0 && (
          <View style={S.chipsRow}>
            {chips.map((c, i) => (
              <View key={`${c}-${i}`} style={S.chip}>
                <Text style={S.chipTxt} numberOfLines={1}>
                  {c}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

/* -------------------------------- Pills ------------------------------ */

function Pill({ label, style }: { label: string; style?: any }) {
  return (
    <View style={[S.pill, style]}>
      <Text style={S.pillTxt} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function CountPill({ value, style }: { value: number; style?: any }) {
  // Compact numeric badge (no "Members" suffix)
  return (
    <View style={[S.countPill, style]}>
      <Text style={S.countTxt} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/* ------------------------------ Helpers ------------------------------ */

function compactAddress(line?: string | null, city?: string | null) {
  const a = (line || '').trim();
  const c = (city || '').trim();
  if (!a && !c) return '';
  if (a && c) return `${a}, ${c}`;
  return a || c;
}

/**
 * If user is NOT owner and property is "Owned" -> show "Rented".
 * Otherwise show the backend label as-is (Owned / Rented / etc).
 */
function ownershipLabelForViewer(isOwner: boolean, propertyLabel?: string | null): string | null {
  if (!propertyLabel) return null;
  const v = propertyLabel.trim().toLowerCase();
  if (isOwner) return propertyLabel;
  if (v === 'owned') return 'Rented';
  return propertyLabel;
}

function toInt(v: any): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = parseInt(String(v), 10);
  return Number.isNaN(n) ? null : n;
}

/* -------------------------------- Styles ----------------------------- */

const BORDER = colors.border;

const S = StyleSheet.create({
  card: {
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.tileBackground,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.badgeBg,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillTxt: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  countPill: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    backgroundColor: colors.badgeBg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countTxt: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  address: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    color: colors.textSecondary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: colors.badgeBg,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipTxt: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
