// src/ui/tokens/shadows.ts
import { Platform, ViewStyle } from 'react-native';

const iosShadow = (opacity: number, radius: number, height: number): ViewStyle => ({
  shadowColor: '#000',
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height },
});

const androidElevation = (elevation: number): ViewStyle => ({
  elevation,
});

// Level 1
export const elevation1: ViewStyle = Platform.select<ViewStyle>({
  ios: iosShadow(0.06, 6, 2),
  android: androidElevation(2),
  default: androidElevation(2),
});

// Level 2
export const elevation2: ViewStyle = Platform.select<ViewStyle>({
  ios: iosShadow(0.08, 10, 4),
  android: androidElevation(4),
  default: androidElevation(4),
});

// Level 3
export const elevation3: ViewStyle = Platform.select<ViewStyle>({
  ios: iosShadow(0.12, 16, 8),
  android: androidElevation(6),
  default: androidElevation(6),
});

// Back-compat alias
export const cardShadow = elevation1;
