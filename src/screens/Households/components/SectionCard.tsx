// src/screens/Households/components/SectionCard.tsx
import { Text } from '@ui';
import { colors, fontSizes, lineHeights, radii, spacing } from '@ui/tokens';
import React, { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type Props = {
  title: string;
  children?: ReactNode;
  /** Open by default (owners) or closed (if you choose later). Defaults to true. */
  startExpanded?: boolean;
  /** Optional right-side element in the header (e.g., small info/count). */
  right?: ReactNode;
  /** Optional style overrides for the card wrapper. */
  style?: any;
};

export default function SectionCard({
  title,
  children,
  startExpanded = true,
  right,
  style,
}: Props) {
  const [open, setOpen] = useState<boolean>(!!startExpanded);

  return (
    <View style={[styles.card, style]}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.header}>
        <Text style={styles.sectionTitle} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.headerRight}>
          {right}
          {/* Simple, dependency-free chevron */}
          <Text style={styles.chev}>{open ? '⌄' : '›'}</Text>
        </View>
      </Pressable>

      {open ? <View style={{ marginTop: spacing.xs }}>{children}</View> : null}
    </View>
  );
}

const BORDER = colors.border;
const CARD_BG = '#F5F7FB';

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  chev: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    color: colors.textSecondary,
  },
});
