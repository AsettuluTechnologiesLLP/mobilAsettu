// src/screens/Households/components/HouseholdTile.tsx
import { Text } from '@ui';
import { colors, fontSizes, lineHeights, radii, spacing } from '@ui/tokens';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import InfoTile from '@/ui/primitives/InfoTile'; // or relative: '../../../ui/tiles/InfoTile'

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
  const chips = [
    ownershipLabel ? `Property: ${ownershipLabel}` : null,
    occupancyStatus || null,
    householdType || null,
  ].filter(Boolean) as string[];

  return (
    <InfoTile
      title={name}
      subtitle={compactAddress(addressLine, city)}
      right={
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <RolePill role={myRole} />
          <MemberCluster count={memberCount || 0} />
        </View>
      }
      chips={chips}
      onPress={() => onPress(id)}
      // Optional: tweak TileMaster defaults per screen
      tileProps={
        {
          // headerBg, bodyBg, footerBg, dividerHB, dividerBF, fullBleed, sectionPadding…
        }
      }
      style={styles.cardOverride}
    />
  );
}

/* ---------- Reuse your subcomponents ---------- */

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
  if (v === 'owned') return 'Rented';
  return propertyLabel;
}

/* ---------- Optional per-screen overrides ---------- */

const styles = StyleSheet.create({
  cardOverride: {
    // If you want to keep the old look:
    backgroundColor: colors.tileBackground,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
});

const BORDER = colors.border;

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

export default HouseholdTile;
