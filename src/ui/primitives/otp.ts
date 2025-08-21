import { COLORS } from '@styles/theme';
import { font, vscale } from '@ui/responsive';
import { OTP_ERROR_SLOT_HEIGHT, OTP_RESEND_SLOT_HEIGHT } from '@ui/tokens/auth';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  logo: {
    marginBottom: vscale(16),
  },
  message: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: font(14),
    marginBottom: vscale(8),
  },
  // Fixed-height error area
  errorSlot: {
    height: OTP_ERROR_SLOT_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    marginTop: vscale(6),
  },
  errorPlaceholder: {
    opacity: 0,
    includeFontPadding: false,
    lineHeight: OTP_ERROR_SLOT_HEIGHT,
    textAlign: 'center',
  },
  // Fixed-height timer/resend area
  resendSlot: {
    height: OTP_RESEND_SLOT_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vscale(8),
  },
  timer: {
    color: COLORS.text,
    opacity: 0.75, // muted look
    fontSize: font(12),
  },
  resend: {
    color: COLORS.primary,
    fontSize: font(13),
    fontWeight: '600',
  },
});
