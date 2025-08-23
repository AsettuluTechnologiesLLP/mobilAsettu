// src/ui/responsive.ts
import { Dimensions, PixelRatio } from 'react-native';

import { splashLogo } from './tokens/misc';

const { width, height } = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scale = (size: number) => (width / guidelineBaseWidth) * size;
export const vscale = (size: number) => (height / guidelineBaseHeight) * size;
export const mscale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export const font = (size: number) => Math.round(PixelRatio.roundToNearestPixel(mscale(size)));

export const byShortestSide = (fraction: number, opts?: { min?: number; max?: number }) => {
  const s = Math.min(width, height) * fraction;
  const min = opts?.min ?? 0;
  const max = opts?.max ?? Number.POSITIVE_INFINITY;
  return Math.round(Math.max(min, Math.min(max, s)));
};

/**
 * Compute Splash logo size using design tokens.
 * You can override any of { scale, min, max } per screen if needed:
 *   splashLogoSize({ scale: 0.5 })
 */
export function splashLogoSize(overrides?: Partial<{ scale: number; min: number; max: number }>) {
  const cfg = { ...splashLogo, ...overrides };
  return byShortestSide(cfg.scale, { min: cfg.min, max: cfg.max });
}
