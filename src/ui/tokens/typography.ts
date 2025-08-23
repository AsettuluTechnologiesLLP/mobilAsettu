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

export const lineHeights = {
  tight: 1.2,
  normal: 1.35,
  relaxed: 1.5,
} as const;

export const type = {
  title: fontSizes.xl,
  subtitle: fontSizes.lg,
  body: fontSizes.md,
  caption: fontSizes.xs,
} as const;

export type TypeKey = keyof typeof type;
