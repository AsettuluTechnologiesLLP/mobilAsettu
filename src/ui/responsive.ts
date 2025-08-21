// src/ui/responsive.ts
import { Dimensions, PixelRatio } from 'react-native';

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
