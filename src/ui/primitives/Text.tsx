// src/ui/primitives/Text.tsx
import React from 'react';
import { StyleProp, Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

import { colors } from '../tokens/colors';
import { type, weight } from '../tokens/typography';

type Variant = keyof typeof type;

type Props = RNTextProps & {
  variant?: Variant;
  color?: string;
  weight?: keyof typeof weight;
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<TextStyle>;
};

const font = (v: number | string) => (typeof v === 'number' ? v : parseInt(String(v), 10));

export default function Text({
  variant = 'body',
  color = colors.text,
  weight: w = 'regular',
  align,
  style,
  children,
  ...rest
}: Props) {
  return (
    <RNText
      {...rest}
      style={[
        {
          color,
          fontSize: font(type[variant]) as number,
          fontWeight: weight[w],
          ...(align ? { textAlign: align } : null),
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
