// src/ui/tokens/misc.ts
export const opacities = {
  disabled: 0.5,
  muted: 0.7,
} as const;

export const zIndex = {
  base: 0,
  header: 10,
  modal: 100,
  toast: 1000,
} as const;

export const durations = {
  fast: 120,
  normal: 200,
  slow: 320,
} as const;

export const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const;

export const insets = {
  touch: { top: 8, left: 8, bottom: 8, right: 8 } as const, // hitSlop
} as const;

export const contentWidth = {
  narrow: 560,
  max: 720,
} as const;

export const splashLogo = {
  scale: 0.6, // fraction of shortest side
  min: 140,
  max: 320,
} as const;
