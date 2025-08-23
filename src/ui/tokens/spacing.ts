// src/ui/tokens/spacing.ts
export const spacing = {
  xxs: 2,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
} as const;

export type SpacingKey = keyof typeof spacing;
export const s = (k: SpacingKey) => spacing[k];
