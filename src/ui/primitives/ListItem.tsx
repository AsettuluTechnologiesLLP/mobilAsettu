import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { font } from '../responsive';
import { theme } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { cardShadow } from '../tokens/shadows';
import { spacing } from '../tokens/spacing';
import Icon from './Icon';
import Text from './Text';

type Props = {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightChevron?: boolean;
  onPress?: () => void;
};

export default function ListItem({
  title,
  subtitle,
  leftIcon,
  rightChevron = true,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.left}>
        {leftIcon ? (
          <Icon name={leftIcon} size={20} color={theme.text} style={{ marginRight: spacing.sm }} />
        ) : null}
        <View>
          <Text variant="body" weight="semibold" style={{ fontSize: font(16) }}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" color={theme.textMuted} style={{ marginTop: 2 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {rightChevron ? <Icon name="chevron-forward" size={18} color={theme.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.card,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ececec',
    ...cardShadow,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
});
