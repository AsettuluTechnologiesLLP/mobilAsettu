// src/ui/tokens/shadows.ts
import { Platform } from 'react-native';

export const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  android: { elevation: 2 },
});
