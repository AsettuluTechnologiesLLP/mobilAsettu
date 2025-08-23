import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { colors } from '../tokens/colors';

type Props = {
  name: string;
  size?: number;
  color?: string;
  style?: any;
};

export default function Icon({ name, size = 20, color = colors.text, style }: Props) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}
