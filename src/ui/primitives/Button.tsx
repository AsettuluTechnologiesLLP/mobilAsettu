import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';

import { font, vscale } from '../responsive';
import { theme } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { spacing } from '../tokens/spacing';
import Text from './Text';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  size?: Size;
  style?: ViewStyle;
};

const PAD = { sm: vscale(8), md: vscale(12), lg: vscale(16) };

export default function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  size = 'md',
  style,
}: Props) {
  const isGhost = variant === 'ghost';

  const bg =
    variant === 'primary'
      ? theme.primary
      : variant === 'secondary'
      ? theme.primaryAlt
      : 'transparent';

  const textColor = isGhost ? theme.primary : theme.primaryTextOn;
  const borderColor = isGhost ? theme.primary : 'transparent';
  const opacity = disabled ? 0.6 : 1;

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={[
        styles.base,
        { backgroundColor: bg, paddingVertical: PAD[size], opacity, borderColor },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text variant="body" weight="semibold" color={textColor} style={{ fontSize: font(16) }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    minHeight: vscale(44),
  },
});
