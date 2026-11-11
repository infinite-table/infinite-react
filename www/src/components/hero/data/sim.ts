/**
 * Market simulation used inside the Web Worker. Prices follow a geometric
 * random walk driven by three shocks — a market factor, a sector factor and
 * idiosyncratic noise — so sectors move together (and the heatmap / sector
 * chart look like a real market rather than static noise).
 */
import {
  SECTORS,
  avgVolumeOf,
  betaOf,
  initialPriceOf,
  initialVolumeOf,
  openPriceOf,
  sectorIndexOf,
  sigmaOf,
} from './instruments';

/** Values per tick in the transferred Float64Array: id, price, volume. */
export const TICK_STRIDE = 3;

const SECTOR_COUNT = SECTORS.length;

function gauss() {
  let u = 0;
  while (u === 0) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

export class TickSimulator {
  size = 0;
  private price = new Float64Array(0);
  private open = new Float64Array(0);
  private volume = new Float64Array(0);
  private sigma = new Float32Array(0);
  private beta = new Float32Array(0);
  private lot = new Float32Array(0);
  private sector = new Uint8Array(0);

  private market = 0;
  private sectorShock = new Float64Array(SECTOR_COUNT);
  /** Slow per-sector drift so some sectors trend up and others down. */
  private sectorTrend = new Float64Array(SECTOR_COUNT);

  private focus: Int32Array = new Int32Array(0);

  /** Grow (never shrink) the simulated universe to `n` instruments. */
  ensure(n: number) {
    if (n <= this.size) return;
    const grow = <A extends Float64Array | Float32Array | Uint8Array>(
      arr: A,
      Ctor: new (n: number) => A,
    ) => {
      const next = new Ctor(n);
      next.set(arr);
      return next;
    };
    this.price = grow(this.price, Float64Array);
    this.open = grow(this.open, Float64Array);
    this.volume = grow(this.volume, Float64Array);
    this.sigma = grow(this.sigma, Float32Array);
    this.beta = grow(this.beta, Float32Array);
    this.lot = grow(this.lot, Float32Array);
    this.sector = grow(this.sector, Uint8Array);
    for (let i = this.size; i < n; i++) {
      this.price[i] = initialPriceOf(i);
      this.open[i] = openPriceOf(i);
      this.volume[i] = initialVolumeOf(i);
      this.sigma[i] = sigmaOf(i);
      this.beta[i] = betaOf(i);
      this.lot[i] = avgVolumeOf(i) / 4000;
      this.sector[i] = sectorIndexOf(i);
    }
    this.size = n;
  }

  /** Ids of on-screen rows: a share of ticks is routed to them. */
  setFocus(ids: Int32Array) {
    this.focus = ids;
  }

  /** Advance the factor model by one batch (called every ~16ms). */
  stepFactors() {
    this.market = this.market * 0.97 + gauss() * 0.16;
    for (let k = 0; k < SECTOR_COUNT; k++) {
      this.sectorShock[k] = this.sectorShock[k] * 0.98 + gauss() * 0.2;
      // Ornstein–Uhlenbeck drift: wanders, but is pulled back to zero
      this.sectorTrend[k] += -0.004 * this.sectorTrend[k] + gauss() * 0.02;
    }
  }

  /**
   * Generate `count` ticks over `rowCount` rows into `out` (TICK_STRIDE
   * values each). `visibleShare` is the probability a tick goes to a focused
   * (on-screen) row instead of a uniformly random one.
   */
  generate(
    count: number,
    rowCount: number,
    visibleShare: number,
    out: Float64Array,
  ) {
    const n = Math.min(rowCount, this.size);
    if (!n) return 0;
    const focus = this.focus;
    const useFocus = focus.length > 0 && visibleShare > 0;
    for (let t = 0; t < count; t++) {
      let id: number;
      if (useFocus && Math.random() < visibleShare) {
        id = focus[(Math.random() * focus.length) | 0];
        if (id >= n) id = (Math.random() * n) | 0;
      } else {
        id = (Math.random() * n) | 0;
      }
      const k = this.sector[id];
      const sigma = this.sigma[id];
      const p = this.price[id];
      const open = this.open[id];
      let r =
        sigma *
        (0.6 * gauss() +
          0.35 * this.sectorShock[k] +
          0.3 * this.beta[id] * this.market +
          0.25 * this.sectorTrend[k]);
      // gentle pull back toward the open so a long-running page stays sane
      r -= 0.0015 * Math.log(p / open);
      const price = Math.max(0.05, p * Math.exp(r));
      this.price[id] = price;
      const traded =
        Math.max(1, Math.round(Math.pow(Math.random(), 3) * this.lot[id])) *
        100;
      this.volume[id] += traded;
      const o = t * TICK_STRIDE;
      out[o] = id;
      out[o + 1] = price;
      out[o + 2] = this.volume[id];
    }
    return count;
  }
}
