// src/styles/theme.ts
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Based on iPhone 14 Pro width
const BASE_WIDTH = 393;

const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;

const STATUS_BAR = {
  light: 'light-content' as const,
  dark: 'dark-content' as const,
  default: 'default' as const,
};

const COLORS = {
  // app brand colors (unchanged)
  primary: '#0191A7',
  secondary: '#77385D',
  background: '#FFF',
  text: '#333',
  error: 'red',
  border: '#ccc',
  buttonText: '#fff',
  iconUnSelected: '#666',
  iconSelected: '#0191A7',

  // splash-specific
  splashBackground: '#000000', // black background for splash
  splashLogoTint: '#FFFFFF', // if you ever switch to a monochrome SVG and want to tint
};

const SIZES = {
  // typography & spacing (unchanged)
  fontSmall: scale(12),
  fontMedium: scale(14),
  fontLarge: scale(18),
  iconSmall: scale(18),
  iconMedium: scale(22),
  iconLarge: scale(26),
  paddingSmall: scale(12),
  paddingMedium: scale(24),
  paddingLarge: scale(32),
  marginSmall: scale(10),
  marginMedium: scale(20),
  buttonHeight: scale(45),
  borderRadius: scale(8),

  // splash-specific sizing (responsive)
  splashLogoWidth: SCREEN_WIDTH * 0.4, // 60% of screen width
  splashLogoHeight: SCREEN_HEIGHT * 0.3, // 50% of screen height
};

export { COLORS, SIZES, STATUS_BAR };
