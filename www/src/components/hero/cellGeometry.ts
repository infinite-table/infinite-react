/*
 * The numbers behind the custom cells: no framework imports, so the React
 * cells (cells.tsx), the Vue ones (content/home/vue-hero) and the Angular ones
 * (content/home/angular-hero) share them.
 */
import { SPARK_LENGTH, type HeroFeed } from './data/feed';
import { avgVolumeOf } from './data/instruments';

// one scratch buffer: sparklines render synchronously, one at a time
const sparkScratch = new Float32Array(SPARK_LENGTH);

export const SPARK_WIDTH = 100;
export const SPARK_HEIGHT = 24;

/** The SVG paths of a row's sparkline (its last ticks), in a 100×24 viewBox. */
export function sparkGeometry(feed: HeroFeed, id: number) {
  const values = feed.sparkline(id, sparkScratch);
  let min = Infinity;
  let max = -Infinity;
  for (let k = 0; k < SPARK_LENGTH; k++) {
    if (values[k] < min) min = values[k];
    if (values[k] > max) max = values[k];
  }
  const range = max - min || 1;
  const W = SPARK_WIDTH;
  const H = SPARK_HEIGHT;
  const pad = 2;
  let line = '';
  for (let k = 0; k < SPARK_LENGTH; k++) {
    const x = (k / (SPARK_LENGTH - 1)) * W;
    const y = pad + (1 - (values[k] - min) / range) * (H - pad * 2);
    line += `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return {
    line,
    area: `${line}L${W} ${H}L0 ${H}Z`,
    up: values[SPARK_LENGTH - 1] >= values[0],
    lastY: pad + (1 - (values[SPARK_LENGTH - 1] - min) / range) * (H - pad * 2),
  };
}

/** Traded volume vs a typical day, 0..1. */
export function volumeRatio(id: number, volume: number) {
  return Math.min(1, volume / (avgVolumeOf(id) * 1.1));
}

/** Day low → high, with where the open and the current price sit (in %). */
export function dayRangeGeometry(feed: HeroFeed, id: number, price: number) {
  const low = feed.low[id] ?? price;
  const high = feed.high[id] ?? price;
  const open = feed.open[id] ?? price;
  const span = high - low || 1;
  return {
    low,
    high,
    at: ((price - low) / span) * 100,
    openAt: ((open - low) / span) * 100,
    up: price >= open,
  };
}
