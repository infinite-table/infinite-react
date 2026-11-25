/**
 * Types and constants shared by the React hero, the Vue one
 * (content/home/vue-hero) and the Angular one (content/home/angular-hero): no
 * framework imports here.
 */
export type HeroView = 'flat' | 'grouped' | 'pivot';
export type HeroDataMode = 'client' | 'server';

export const ROW_COUNTS = [1_000, 10_000, 100_000, 1_000_000] as const;
export const TICK_RATES = [
  10, 50, 100, 250, 500, 1_000, 2_500, 5_000, 10_000, 25_000,
] as const;

export const DEFAULT_ROW_COUNT = 10_000;
export const DEFAULT_TICK_RATE = 2_500;
export const REDUCED_MOTION_TICK_CAP = 40;
/** Above this many rows, building them shows a progress message. */
export const BUILD_MESSAGE_THRESHOLD = 20_000;

/** A million rows only where there is room for them. */
export function canHandleMillionRows() {
  if (typeof window === 'undefined') return false;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  return (
    !window.matchMedia('(pointer: coarse)').matches &&
    (memory === undefined || memory >= 4)
  );
}
