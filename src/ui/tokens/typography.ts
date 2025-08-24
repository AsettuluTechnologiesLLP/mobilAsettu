// src/ui/tokens/typography.ts
export const weight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 26,
} as const;

// global paragraph ratio (can tune later)
const LH = 1.4;
const px = (size: number, ratio = LH) => Math.round(size * ratio);

export const lineHeights = {
  xs: px(fontSizes.xs),
  sm: px(fontSizes.sm),
  md: px(fontSizes.md),
  lg: px(fontSizes.lg),
  xl: px(fontSizes.xl),
  // '2xl': px(fontSizes['2xl']),
} as const;

export const type = {
  title: fontSizes.xl,
  subtitle: fontSizes.lg,
  body: fontSizes.md,
  caption: fontSizes.xs,
} as const;

export type TypeKey = keyof typeof type;
