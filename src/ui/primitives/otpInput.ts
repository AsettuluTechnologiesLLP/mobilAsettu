import { COLORS, SIZES } from '@styles/theme';
import { font, vscale } from '@ui/responsive';
import { StyleSheet } from 'react-native';

const BOX = Math.round(SIZES.buttonHeight * 1.0);

export default StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: vscale(12),
  },
  otpBox: {
    width: BOX,
    height: BOX,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    marginHorizontal: Math.max(SIZES.marginSmall - 2, 4),
    backgroundColor: COLORS.background,
    color: COLORS.text,
    fontSize: font(18),
    textAlign: 'center',
  },
});
