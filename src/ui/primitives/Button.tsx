// src/ui/primitives/Button.tsx
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';

import { colors } from '../tokens/colors';
import { insets } from '../tokens/misc';
import { radii } from '../tokens/radii';
import { elevation1 } from '../tokens/shadows';
import { spacing } from '../tokens/spacing';
import { fontSizes } from '../tokens/typography';
import Text from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
};

const PAD: Record<Size, number> = {
  sm: spacing.xs,
  md: spacing.sm,
  lg: spacing.md,
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  style,
}: ButtonProps) {
  const { bg, txt, borderColor, ripple } = getVariantStyles(variant);
  const isDisabled = disabled || !!loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: !!loading }}
      hitSlop={insets.touch}
      android_ripple={ripple}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
          paddingVertical: PAD[size],
          // Dim when disabled, slight feedback when pressed
          opacity: (isDisabled ? 0.4 : 1) * (pressed ? 0.9 : 1),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={txt} />
      ) : (
        <Text color={txt} weight="medium" style={{ fontSize: fontSizes.md }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

function getVariantStyles(variant: Variant) {
  switch (variant) {
    case 'secondary':
      return {
        bg: colors.card,
        txt: colors.textPrimary,
        borderColor: colors.border,
        ripple: { color: colors.border },
      };
    case 'ghost':
      return {
        bg: 'transparent',
        txt: colors.textPrimary,
        borderColor: 'transparent',
        ripple: undefined, // avoid odd ripples on transparent
      };
    case 'danger':
      return {
        bg: colors.error,
        txt: '#fff',
        borderColor: 'transparent',
        ripple: { color: colors.textMuted },
      };
    case 'primary':
    default:
      return {
        bg: colors.buttonBackground,
        txt: '#fff',
        borderColor: 'transparent',
        ripple: { color: colors.textMuted },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    minHeight: 44, // consistent tap target
    ...elevation1,
  },
});
