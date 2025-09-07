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

  // Action (legacy; not used for primary anymore)
  blue600: '#2563EB',

  // States
  green600: '#16A34A',
  amber600: '#D97706',
  red600: '#DC2626',

  // Danger + tags
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  dangerBorder: '#FCA5A5',

  // Badge
  badgeBg: '#EEF2FF',
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
  primaryTextOn: palette.white, // text color when background is primary

  // Surfaces
  surface: palette.white,
  card: palette.white,
  tile: palette.white,

  // States
  error: palette.red600,
  success: palette.green600,
  warning: palette.amber600,

  // Buttons / CTAs
  buttonBackground: palette.black, // main CTA background
  buttonTextOn: palette.white, // CTA text color
  onPrimary: palette.white, // alias for text on primary backgrounds

  // Minimal accent
  accent: palette.black,

  // Text convenience
  text: palette.gray900,
  muted: palette.gray500,

  // Focus/selection/ripple
  focus: palette.gray900,
  selection: palette.gray900,
  ripple: palette.gray200,

  // Danger / destructive actions
  danger: palette.danger,
  dangerBg: palette.dangerBg,
  dangerBorder: palette.dangerBorder,

  // Badges
  badgeBg: palette.badgeBg,
  badgeBgMuted: palette.gray50,
  badgeText: palette.gray700,

  // HouseholdTile
  tileBackground: palette.gray50,

  // Info / banners
  infoBg: '#EEF2FF',
} as const;
