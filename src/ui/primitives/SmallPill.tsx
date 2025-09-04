// src/ui/primitives/SmallPill.tsx
import React from 'react';
import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, fontSizes, lineHeights, radii, spacing } from '../tokens';
import Text from './Text';

type Props = {
  /** Text to show (e.g., "3") */
  label?: string | number;
  /** Glyph to show when you want an icon-like button (e.g., "＋", "×", "▼", "▶") */
  icon?: string;
  /** If true, fixed square button (used for icons). If false, auto-width pill (for counts). */
  iconOnly?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
};

const SIZE = 32; // consistent height (and width for icon-only)
const BORDER = 1;

export default function SmallPill({
  label,
  icon,
  iconOnly = false,
  onPress,
  disabled = false,
  selected = false,
  style,
  accessibilityLabel,
  testID,
}: Props) {
  const content =
    iconOnly && icon ? (
      <Text style={styles.iconTxt}>{icon}</Text>
    ) : (
      <Text style={styles.labelTxt} numberOfLines={1}>
        {label != null ? String(label) : ''}
      </Text>
    );

  const baseStyles = [
    styles.base,
    iconOnly ? styles.iconOnly : styles.pill,
    selected ? styles.selected : null,
    disabled ? styles.disabled : null,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        disabled={disabled}
        style={({ pressed }) => [...baseStyles, pressed ? { opacity: 0.7 } : null]}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={baseStyles}>{content}</View>;
}

const styles = StyleSheet.create({
  base: {
    height: SIZE,
    borderRadius: radii.md, // small, consistent corners
    borderWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.badgeBg, // subtle bg that works on light/dark
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  iconOnly: {
    width: SIZE, // square for icon buttons
  },
  pill: {
    paddingHorizontal: spacing.sm, // flexible width for count labels
    minWidth: SIZE,
  },
  selected: {
    borderColor: colors.textPrimary,
  },
  disabled: {
    opacity: 0.5,
  },
  labelTxt: {
    fontSize: fontSizes.sm, // compact but readable
    lineHeight: lineHeights.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  iconTxt: {
    fontSize: 18, // larger glyph for visibility
    lineHeight: 20,
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
