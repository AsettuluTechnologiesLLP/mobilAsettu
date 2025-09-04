// src/ui/tokens/colors.ts
export const palette = {
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',

  // Brand
  brandBlack: '#000000',
  primary: '#111827',
  primaryAlt: '#1F2937',
  secondary: '#4B5563',
  secondaryAlt: '#9CA3AF',

  // Action (kept for legacy; not used for primary button anymore)
  blue600: '#2563EB',

  // States
  green600: '#16A34A',
  amber600: '#D97706',
  red600: '#DC2626',

  danger: '#DC2626', // used for error text, toasts, etc.
  badgeBg: '#EEF2FF', // subtle tag/chip background
} as const;

export const colors = {
  // Splash
  splashBackground: palette.brandBlack,
  splashBg: palette.brandBlack,

  // Base
  background: palette.white,
  textPrimary: palette.gray900,
  textSecondary: palette.gray700,
  textMuted: palette.gray500,
  border: palette.gray200,

  // Semantic primaries
  primary: palette.primary,
  primaryAlt: palette.primaryAlt,
  primaryTextOn: palette.white,

  // Surfaces
  surface: palette.white,
  card: palette.white,
  tile: palette.white,

  // States
  error: palette.red600,
  success: palette.green600,

  // Monochrome CTA
  buttonBackground: palette.black, // ← was blue; now black
  buttonTextOn: palette.white, // label color for primary

  // Minimal accent (kept for back-compat; set to black to stay mono)
  accent: palette.black,

  // Convenience alias (kept)
  text: palette.gray900,

  // Focus/selection/ripple (for inputs/buttons; removes blue focus)
  focus: palette.gray900,
  selection: palette.gray900,
  ripple: palette.gray200,

  // --- ADD THESE ALIASES (used by screens) ---
  danger: palette.danger,
  badgeBg: palette.badgeBg,

  // HouseholdTile
  tileBackground: palette.gray50,
} as const;
