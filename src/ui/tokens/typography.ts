// src/ui/tokens/typography.ts
export const weight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
export const type = {
  title: 22,
  subtitle: 18,
  body: 16,
  caption: 12,
} as const;
export type TypeKey = keyof typeof type;
