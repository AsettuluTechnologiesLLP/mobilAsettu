// src/styles/globalStyles.ts
import { StyleSheet } from 'react-native';

import { COLORS, SIZES } from './theme';

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: SIZES.paddingLarge,
    paddingHorizontal: SIZES.paddingMedium,
    paddingBottom: SIZES.paddingSmall,
  },
  logo: {
    width: 200,
    height: 60,
    alignSelf: 'center',
    marginBottom: SIZES.marginMedium,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.paddingMedium,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.fontSmall,
    textAlign: 'center',
    marginTop: 0,
    marginBottom: SIZES.marginSmall,
  },
  // OTP Message text style
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  // Timer text style for Resend OTP countdown
  timer: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  // Resend OTP text style
  resendText: {
    textAlign: 'center',
    color: '#4A90E2',
    marginBottom: 15,
    fontWeight: 'bold',
  },
});

export default globalStyles;
