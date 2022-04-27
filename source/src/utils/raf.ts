import { getGlobal } from './getGlobal';

export const raf =
  getGlobal().requestAnimationFrame ||
  ((fn: Function) => {
    return setTimeout(fn, 16);
  });

export const cancelRaf =
  getGlobal().cancelAnimationFrame ||
  ((timeoutId: number) => {
    return clearTimeout(timeoutId);
  });
