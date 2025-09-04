// src/ui/tiles/InfoTile.tsx
import { Text } from '@ui';
import { colors, fontSizes, lineHeights, spacing } from '@ui/tokens';
import React from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import TileMaster, { type TileMasterProps } from '@/ui/primitives/tileMaster'; // or relative path

export type InfoTileProps = {
  title: React.ReactNode | string;
  subtitle?: React.ReactNode | string;
  right?: React.ReactNode;
  chips?: Array<React.ReactNode | string>;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  tileProps?: Partial<TileMasterProps>;
};

export function InfoTile({
  title,
  subtitle,
  right,
  chips,
  onPress,
  style,
  tileProps,
}: InfoTileProps) {
  const header = (
    <View style={styles.headerRow}>
      {typeof title === 'string' ? (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        title
      )}
      {right ? <View style={styles.headerRight}>{right}</View> : null}
    </View>
  );

  const body =
    typeof subtitle === 'string' ? (
      <Text style={styles.subtitle} numberOfLines={1}>
        {subtitle}
      </Text>
    ) : (
      subtitle || null
    );

  const footer =
    chips && chips.length > 0 ? (
      <View style={styles.chipsRow}>
        {chips.map((chip, idx) =>
          typeof chip === 'string' ? (
            <View key={idx} style={chipStyles.wrap}>
              <Text style={chipStyles.txt} numberOfLines={1}>
                {chip}
              </Text>
            </View>
          ) : (
            <View key={idx} style={{ marginRight: spacing.xs, marginBottom: spacing.xs }}>
              {chip}
            </View>
          ),
        )}
      </View>
    ) : null;

  return (
    <TileMaster
      header={header}
      body={body}
      footer={footer}
      onPress={onPress}
      style={style}
      dividerHB
      {...tileProps}
    />
  );
}

const styles = StyleSheet.create({
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
    marginLeft: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
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

const chipStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
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

export default InfoTile;
