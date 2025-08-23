import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { cardShadow } from '../tokens/shadows';
import { spacing } from '../tokens/spacing';
import Icon from './Icon';
import Text from './Text';

type Props = {
  icon: string;
  title: string;
  onPress?: () => void;
  widthPercent?: number; // e.g. 31 for 3-in-a-row
};

export default function Tile({ icon, title, onPress, widthPercent = 31 }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { width: `${widthPercent}%` },
        pressed && { opacity: 0.9 },
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <Icon name={icon} size={22} />
      <Text variant="body" weight="semibold" style={{ marginTop: spacing.xs }}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.tile,
    alignItems: 'flex-start',
    ...cardShadow,
  },
});
