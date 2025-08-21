import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

import { font } from '../responsive';
import { theme } from '../tokens/colors';
import { type, weight } from '../tokens/typography';

type Variant = 'title' | 'subtitle' | 'body' | 'caption';

type Props = RNTextProps & {
  variant?: Variant;
  color?: string;
  weight?: keyof typeof weight;
};

export default function Text({
  variant = 'body',
  color = theme.text,
  weight: w = 'regular',
  style,
  children,
  ...rest
}: Props) {
  return (
    <RNText
      {...rest}
      style={[{ color, fontSize: font(type[variant]) as number, fontWeight: weight[w] }, style]}
    >
      {children}
    </RNText>
  );
}
