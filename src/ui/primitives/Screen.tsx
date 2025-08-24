// src/ui/primitives/Screen.tsx
import { useFocusEffect } from '@react-navigation/native';
import React, { PropsWithChildren, useCallback } from 'react';
import { Platform, StatusBar, StyleSheet, View, ViewProps } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';

function isDark(bg: string) {
  const hex = bg.replace('#', '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex.padEnd(6, 'f');
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L < 0.6;
}

type Props = PropsWithChildren<
  ViewProps & {
    /** Background color (defaults to theme background) */
    bg?: string;
    /** Explicit status bar style; otherwise derived from bg */
    barStyle?: 'light-content' | 'dark-content';
    /** Android translucent status bar toggle */
    androidTranslucent?: boolean;
    /** Use SafeAreaView (defaults true) */
    safe?: boolean;
    /** Which edges to apply safe area to */
    edges?: Edge[];
    /** Center children (align + justify center) */
    center?: boolean;
    /** Apply default page padding from tokens (defaults true) */
    padded?: boolean;
  }
>;

export default function Screen({
  bg = colors.background,
  barStyle,
  androidTranslucent = false,
  safe = true,
  edges = ['top', 'bottom'],
  center = false,
  padded = true,
  style,
  children,
  ...rest
}: Props) {
  const computed = barStyle ?? (isDark(bg) ? 'light-content' : 'dark-content');

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(computed);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(bg);
        StatusBar.setTranslucent(androidTranslucent);
      }
    }, [computed, bg, androidTranslucent]),
  );

  const baseStyles = [
    styles.base,
    { backgroundColor: bg },
    padded && styles.padded,
    center && styles.center,
    style,
  ];

  if (safe) {
    return (
      <SafeAreaView edges={edges} style={baseStyles} {...rest}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View style={baseStyles} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: colors.background,
  },
  padded: {
    padding: spacing.lg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
