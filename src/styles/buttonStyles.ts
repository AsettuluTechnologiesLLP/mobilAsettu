// src/styles/buttonStyles.ts
import { StyleSheet } from 'react-native';

import { COLORS, SIZES } from './theme';

const buttonStyles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.paddingSmall,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    height: SIZES.buttonHeight,
    maxWidth: 300,
    alignSelf: 'center',
  },
  buttonText: {
    color: COLORS.buttonText,
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
  },
});

export default buttonStyles;
