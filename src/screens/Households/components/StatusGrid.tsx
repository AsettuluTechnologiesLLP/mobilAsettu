// src/screens/Households/components/StatusGrid.tsx
import { Text } from '@ui';
import { colors, fontSizes, lineHeights, spacing } from '@ui/tokens';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  /** Already viewer-safe, e.g. "Owned" | "Rented" (we'll prefix with "Property:") */
  property?: string | null;
  occupancy?: string | null;
  type?: string | null;
  /** Center align the row; default true */
  center?: boolean;
};

export default function StatusGrid({ property, occupancy, type, center = true }: Props) {
  const items: string[] = [];
  if (property) items.push(`Property: ${property}`);
  if (occupancy) items.push(occupancy);
  if (type) items.push(type);

  if (items.length === 0) return null;

  return (
    <View
      style={[styles.row, center ? { justifyContent: 'center' } : { justifyContent: 'flex-start' }]}
    >
      {items.map((label, idx) => (
        <Chip key={`${label}-${idx}`} label={label} />
      ))}
    </View>
  );
}

/** Subtle, small chip — visually consistent with role pill but with less emphasis */
function Chip({ label }: { label: string }) {
  return (
    <View style={chip.wrap}>
      <Text style={chip.txt} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const BORDER = colors.border;
const BG = colors.badgeBg; // subtle background you already use for role badge

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
});

const chip = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: BG,
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
