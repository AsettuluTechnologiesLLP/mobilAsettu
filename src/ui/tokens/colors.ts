// src/ui/tokens/colors.ts
export const palette = {
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F5F5F5',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  primary: '#111827',
  primaryAlt: '#1F2937',
  accent: '#2563EB',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  brandBlack: '#000000',
};

export const theme = {
  bg: palette.white,
  text: palette.gray900,
  textMuted: palette.gray500,
  border: palette.gray200,
  primary: palette.primary,
  primaryAlt: palette.primaryAlt,
  primaryTextOn: palette.white,
  card: palette.white,
  tile: palette.white,
  error: palette.error,
  success: palette.success,
  accent: palette.accent,
  splashBg: palette.brandBlack,
};

export type Theme = typeof theme;
