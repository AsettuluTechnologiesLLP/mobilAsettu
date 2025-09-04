// src/ui/tokens/radii.ts
export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
  round: 9999,
} as const;
export type RadiusKey = keyof typeof radii;
