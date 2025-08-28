// src/screens/Households/components/HouseholdTile.tsx
import { Text } from '@ui';
import { colors, fontSizes, lineHeights, radii, spacing } from '@ui/tokens';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { HouseholdListItem } from '../model/households';

export function HouseholdTile({
  item,
  onPress,
}: {
  item: HouseholdListItem;
  onPress: (id: string) => void;
}) {
  const {
    id,
    name,
    myRole,
    isUserOwner,
    memberCount,
    addressLine,
    city,
    propertyOwnershipStatus,
    occupancyStatus,
    householdType,
  } = item;

  const ownershipLabel = viewerOwnershipLabel(isUserOwner, propertyOwnershipStatus);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(id)}>
      <View style={styles.card}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.headerRight}>
            <RolePill role={myRole} />
            <MemberCluster count={memberCount || 0} />
          </View>
        </View>

        {/* Address */}
        <Text style={styles.address} numberOfLines={1}>
          {compactAddress(addressLine, city)}
        </Text>

        {/* Pins: centered; property label adapted for non-owners */}
        <View style={styles.chipsRow}>
          {ownershipLabel ? <Chip label={`Property: ${ownershipLabel}`} /> : null}
          {occupancyStatus ? <Chip label={occupancyStatus} /> : null}
          {householdType ? <Chip label={householdType} /> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ---------- Subcomponents ---------- */

function RolePill({ role }: { role: string }) {
  return (
    <View style={pillStyles.wrap}>
      <Text style={pillStyles.txt} numberOfLines={1}>
        {role || 'MEMBER'}
      </Text>
    </View>
  );
}

/** Shows up to 3 tiny user bubbles + count. */
function MemberCluster({ count }: { count: number }) {
  const bubbles = Math.max(0, Math.min(3, count));
  return (
    <View style={memberStyles.wrap}>
      <View style={[memberStyles.stack, { zIndex: 3 }]}>
        {bubbles >= 1 ? (
          <View style={[memberStyles.bubble, { backgroundColor: '#EAEFFF' }]}>
            <Text style={memberStyles.bubbleTxt}>👤</Text>
          </View>
        ) : null}
      </View>
      <View style={[memberStyles.stack, { marginLeft: -8, zIndex: 2 }]}>
        {bubbles >= 2 ? (
          <View style={[memberStyles.bubble, { backgroundColor: '#EAEFFF' }]}>
            <Text style={memberStyles.bubbleTxt}>👤</Text>
          </View>
        ) : null}
      </View>
      <View style={[memberStyles.stack, { marginLeft: -8, zIndex: 1 }]}>
        {bubbles >= 3 ? (
          <View style={[memberStyles.bubble, { backgroundColor: '#EAEFFF' }]}>
            <Text style={memberStyles.bubbleTxt}>👤</Text>
          </View>
        ) : null}
      </View>
      <View style={memberStyles.countPill}>
        <Text style={memberStyles.countTxt}>{count}</Text>
      </View>
    </View>
  );
}

/** Unified pill style (like Role, a tad smaller/softer) */
function Chip({ label }: { label: string }) {
  return (
    <View style={chipStyles.wrap}>
      <Text style={chipStyles.txt} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/* ---------- Helpers ---------- */

function compactAddress(line?: string, city?: string) {
  if (!line && !city) return '';
  if (line && city) return `${line}, ${city}`;
  return line || city || '';
}

/**
 * If user is NOT owner and property is "Owned" -> show "Rented".
 * Otherwise show the backend label as-is (Owned / Rented / etc).
 */
function viewerOwnershipLabel(
  isOwner?: boolean | null,
  propertyLabel?: string | null,
): string | null {
  if (!propertyLabel) return null;
  const v = propertyLabel.trim().toLowerCase();
  if (isOwner) return propertyLabel;
  // Non-owner view:
  if (v === 'owned') return 'Rented';
  return propertyLabel; // already 'Rented' or something else from BE
}

/* ---------- Styles ---------- */

const BORDER = colors.border;
// const CARD_BG = '#F5F7FB';

const styles = StyleSheet.create({
  card: {
    padding: spacing.sm, // tighter padding
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
});

const pillStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.badgeBg,
    borderWidth: 1,
    borderColor: BORDER,
    marginRight: spacing.xs,
  },
  txt: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

const memberStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  stack: { width: 20, height: 20 },
  bubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  bubbleTxt: { fontSize: 10, lineHeight: 12 },
  countPill: {
    marginLeft: 4,
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
});

const chipStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: colors.badgeBg,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  txt: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export default HouseholdTile;
