// src/styles/authStyles.ts
import { Dimensions, StyleSheet } from 'react-native';

import { COLORS, SIZES } from './theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Helpful responsive paddings
const VERTICAL_PADDING = Math.max(SIZES.paddingLarge, SCREEN_HEIGHT * 0.08); // ~8% of screen height
const HORIZONTAL_PADDING = SIZES.paddingMedium;

// Responsive logo sizing
const LOGO_MAX_WIDTH = SCREEN_WIDTH * 0.6; // ~60% of screen width
const LOGO_ASPECT_RATIO = 5; // keep your existing aspect ratio

const authStyles = StyleSheet.create({
  // ✅ Container for SplashScreen and Auth Screens (kept as-is, color from theme)
  authScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },

  // ✅ LoginScreen container — fully responsive (no fixed 200px)
  loginScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: VERTICAL_PADDING,
  },

  // ✅ Logo: responsive width, preserves aspect ratio
  authScreenLogo: {
    width: LOGO_MAX_WIDTH,
    height: undefined,
    aspectRatio: LOGO_ASPECT_RATIO,
    alignSelf: 'center',
    marginBottom: SIZES.marginMedium,
  },

  // ✅ Button container with consistent spacing (full width of content area)
  authButtonContainer: {
    width: '80%',
    marginTop: SIZES.marginMedium,
    paddingHorizontal: HORIZONTAL_PADDING,
  },

  // ✅ Reserve space for error message to avoid layout shift
  authErrorContainer: {
    minHeight: SIZES.fontMedium, // small, but responsive
    marginBottom: SIZES.marginSmall,
    justifyContent: 'center',
  },

  // ✅ Error text styling (theme-aware)
  authErrorText: {
    color: COLORS.error,
    fontSize: SIZES.fontSmall,
    textAlign: 'center',
  },
});

export default authStyles;
