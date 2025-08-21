import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { theme } from '../tokens/colors';

type Props = {
  name: string;
  size?: number;
  color?: string;
  style?: any;
};

export default function Icon({ name, size = 20, color = theme.text, style }: Props) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}
