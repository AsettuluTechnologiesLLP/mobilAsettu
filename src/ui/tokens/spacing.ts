// src/ui/tokens/spacing.ts
export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 32,
} as const;
export type SpacingKey = keyof typeof spacing;
export const s = (k: SpacingKey) => spacing[k];
