import { useFocusEffect } from '@react-navigation/native';
import React, { PropsWithChildren, useCallback } from 'react';
import { Platform, StatusBar, View } from 'react-native';

import { theme } from '../tokens/colors';

function isDark(bg: string) {
  const hex = bg.replace('#', '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex.padEnd(6, 'f');
  const r = parseInt(full.slice(0, 2), 16),
    g = parseInt(full.slice(2, 4), 16),
    b = parseInt(full.slice(4, 6), 16);
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L < 0.6;
}

type Props = PropsWithChildren<{
  bg?: string;
  barStyle?: 'light-content' | 'dark-content';
  androidTranslucent?: boolean;
}>;

export default function Screen({
  bg = theme.bg,
  barStyle,
  androidTranslucent = false,
  children,
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

  return <View style={{ flex: 1, backgroundColor: bg }}>{children}</View>;
}
