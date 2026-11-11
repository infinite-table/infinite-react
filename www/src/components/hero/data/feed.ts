/**
 * Main-thread side of the ticking feed.
 *
 * - receives tick batches from the worker, mirrors the live values in typed
 *   arrays and coalesces them per row;
 * - flushes once per animation frame into `dataSourceApi.updateDataArray`,
 *   backing off automatically when commits get expensive (large row counts,
 *   sorting + grouping), so the page keeps its frame rate;
 * - measures ticks/s, row updates/s, commits/s, commit cost and FPS;
 * - keeps sparkline + selected-row price history and sector P&L for the
 *   charts;
 * - tells the worker which rows are on screen, so a share of the ticks goes to
 *   them — the way real trading UIs subscribe to visible symbols.
 */
import type { DataSourceApi } from '@infinite-table/infinite-react';

import {
  SECTORS,
  avgCostOf,
  hashGauss,
  initialPriceOf,
  initialVolumeOf,
  makeInstrument,
  marketCapOf,
  openPriceOf,
  positionOf,
  sectorIndexOf,
  sigmaOf,
  symbolOf,
  type Instrument,
  type InstrumentUpdate,
} from './instruments';
import { TICK_STRIDE } from './sim';
import type { WorkerInMessage, WorkerOutMessage } from './protocol';

export const SPARK_LENGTH = 40;
export const SERIES_LENGTH = 300;
export const SERIES_INTERVAL_MS = 200;

export type FeedStats = {
  ticksPerSecond: number;
  updatesPerSecond: number;
  commitsPerSecond: number;
  /** Smoothed main-thread cost of one commit (DataSource + grid render). */
  commitMs: number;
  fps: number;
  /** Current minimum time between commits chosen by the back-off. */
  flushIntervalMs: number;
  /** Commits are deferred while a big grid is being scrolled. */
  scrollHeld: boolean;
  /**
   * A single commit got too expensive to keep doing (it would freeze the
   * page): grid updates stop for this row count; ticks still feed the charts.
   */
  gridPaused: boolean;
  running: boolean;
};

type Ring = { values: Float32Array; head: number };

export type HeatTile = {
  id: number;
  symbol: string;
  sector: number;
  cap: number;
};

const EMPTY_STATS: FeedStats = {
  ticksPerSecond: 0,
  updatesPerSecond: 0,
  commitsPerSecond: 0,
  commitMs: 0,
  fps: 0,
  flushIntervalMs: 0,
  scrollHeld: false,
  gridPaused: false,
  running: false,
};

export class HeroFeed {
  rowCount = 0;

  // ---- live mirror (index = instrument id) ----
  price = new Float64Array(0);
  volume = new Float64Array(0);
  high = new Float64Array(0);
  low = new Float64Array(0);
  open = new Float64Array(0);
  position = new Float64Array(0);
  avgCost = new Float64Array(0);
  sector = new Uint8Array(0);
  private capacity = 0;

  /** Day P&L per sector over the current rows (index = SECTORS index). */
  sectorDayPnl = new Float64Array(SECTORS.length);
  totalDayPnl = 0;

  private worker: Worker | null = null;
  private api: DataSourceApi<Instrument> | null = null;
  private pending = new Map<number, InstrumentUpdate>();
  private tickSeq = 1;
  private holdFlushes = 0;
  private running = false;
  private ticksPerSecond = 1000;

  // ---- frame + commit timing ----
  private raf = 0;
  private lastFrameAt = 0;
  private baseFrame = 16.7;
  private flushedAt = 0;
  private framesSinceFlush = -1;
  private costEma = 0;
  private flushInterval = 0;
  private lastFlushAt = 0;

  // ---- stats ----
  private statsWindowStart = 0;
  private frames = 0;
  private ticks = 0;
  private updates = 0;
  private commits = 0;
  stats: FeedStats = EMPTY_STATS;
  private statsListeners = new Set<(stats: FeedStats) => void>();
  private flushListeners = new Set<() => void>();

  // ---- history ----
  private sparks = new Map<number, Ring>();
  selectedId = 0;
  private series: Ring = { values: new Float32Array(SERIES_LENGTH), head: 0 };
  seriesSampledAt = 0;
  private selectedListeners = new Set<(id: number) => void>();

  /** Above this cost per commit, grid updates pause instead of freezing the page. */
  static MAX_COMMIT_MS = 250;
  private gridPaused = false;

  // ---- scrolling ----
  private lastScrollAt = 0;
  /** At or above this many rows, commits wait while the grid is scrolled. */
  static SCROLL_HOLD_ROWS = 100_000;

  // ---- focus (visible rows) ----
  private focusProvider: (() => number[]) | null = null;
  private focusTimer = 0;

  start() {
    if (this.worker) return;
    try {
      this.worker = new Worker(new URL('./tick.worker.ts', import.meta.url), {
        type: 'module',
        name: 'hero-ticks',
      });
    } catch (error) {
      console.warn('[hero] could not start the tick worker', error);
      return;
    }
    this.worker.onmessage = (event: MessageEvent<WorkerOutMessage>) =>
      this.onTicks(event.data);
    this.post({ type: 'rate', ticksPerSecond: this.ticksPerSecond });
    if (this.rowCount) this.post({ type: 'rows', rowCount: this.rowCount });
    this.focusTimer = window.setInterval(() => this.sendFocus(), 250);
  }

  /** Stop the worker and timers. `start()` may be called again (StrictMode). */
  dispose() {
    this.setRunning(false);
    this.worker?.terminate();
    this.worker = null;
    window.clearInterval(this.focusTimer);
  }

  private post(message: WorkerInMessage) {
    this.worker?.postMessage(message);
  }

  // -------------------------------------------------------------------------
  // rows
  // -------------------------------------------------------------------------

  private ensureCapacity(n: number) {
    if (n <= this.capacity) return;
    const grow = <A extends Float64Array | Uint8Array>(
      arr: A,
      Ctor: new (n: number) => A,
    ) => {
      const next = new Ctor(n);
      next.set(arr);
      return next;
    };
    const from = this.capacity;
    this.price = grow(this.price, Float64Array);
    this.volume = grow(this.volume, Float64Array);
    this.high = grow(this.high, Float64Array);
    this.low = grow(this.low, Float64Array);
    this.open = grow(this.open, Float64Array);
    this.position = grow(this.position, Float64Array);
    this.avgCost = grow(this.avgCost, Float64Array);
    this.sector = grow(this.sector, Uint8Array);
    for (let i = from; i < n; i++) {
      const open = openPriceOf(i);
      const price = initialPriceOf(i);
      this.open[i] = open;
      this.price[i] = price;
      this.volume[i] = initialVolumeOf(i);
      const swing = sigmaOf(i) * 6;
      this.high[i] = Math.max(open, price) * (1 + swing);
      this.low[i] = Math.min(open, price) * (1 - swing);
      this.position[i] = positionOf(i);
      this.avgCost[i] = avgCostOf(i);
      this.sector[i] = sectorIndexOf(i);
    }
    this.capacity = n;
  }

  /**
   * Build `n` grid rows from the current live values. Large counts are built
   * in chunks so the page stays responsive; `onProgress` gets 0..1.
   */
  async buildRows(
    n: number,
    {
      onProgress,
      signal,
    }: { onProgress?: (p: number) => void; signal?: AbortSignal } = {},
  ): Promise<Instrument[] | null> {
    this.ensureCapacity(n);
    const rows: Instrument[] = new Array(n);
    const CHUNK = 60_000;
    const live = { price: 0, volume: 0 };
    for (let start = 0; start < n; start += CHUNK) {
      const end = Math.min(n, start + CHUNK);
      for (let i = start; i < end; i++) {
        live.price = this.price[i];
        live.volume = this.volume[i];
        rows[i] = makeInstrument(i, live, this.tickSeq);
      }
      if (end < n) {
        onProgress?.(end / n);
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (signal?.aborted) return null;
      }
    }
    onProgress?.(1);
    return rows;
  }

  /** Switch the live universe to the first `n` instruments. */
  setRowCount(n: number) {
    this.ensureCapacity(n);
    this.rowCount = n;
    this.pending.clear();
    // a new regime: forget the commit cost measured for the old row count
    this.costEma = 0;
    this.flushInterval = 0;
    this.framesSinceFlush = -1;
    this.gridPaused = false;
    this.sectorDayPnl.fill(0);
    let total = 0;
    for (let i = 0; i < n; i++) {
      const pnl = this.position[i] * (this.price[i] - this.open[i]);
      this.sectorDayPnl[this.sector[i]] += pnl;
      total += pnl;
    }
    this.totalDayPnl = total;
    this.sparks.clear();
    this.post({ type: 'rows', rowCount: n });
    this.heatTiles = null;
  }

  // -------------------------------------------------------------------------
  // grid wiring
  // -------------------------------------------------------------------------

  attach(api: DataSourceApi<Instrument> | null) {
    this.api = api;
  }

  /** While held (e.g. new rows are being loaded) ticks are kept, not committed. */
  hold(held: boolean) {
    this.holdFlushes = Math.max(0, this.holdFlushes + (held ? 1 : -1));
  }

  setFocusProvider(provider: (() => number[]) | null) {
    this.focusProvider = provider;
  }

  private sendFocus() {
    if (!this.running || !this.focusProvider) return;
    let ids: number[];
    try {
      ids = this.focusProvider();
    } catch {
      return;
    }
    // the heatmap's instruments are on screen too, and the selected one (the
    // price chart) always ticks briskly
    const heat = this.heatTiles ?? [];
    const focus = new Int32Array(ids.length + heat.length + 4);
    focus.set(ids);
    heat.forEach((tile, k) => (focus[ids.length + k] = tile.id));
    focus.fill(this.selectedId, ids.length + heat.length);
    this.post({ type: 'focus', ids: focus });
  }

  /** The grid scrolled: big row counts keep the scroll smooth by deferring commits. */
  noteScroll() {
    this.lastScrollAt = performance.now();
  }

  /** True while commits are deferred for scrolling. */
  get scrollHeld() {
    return (
      this.rowCount >= HeroFeed.SCROLL_HOLD_ROWS &&
      performance.now() - this.lastScrollAt < 450
    );
  }

  setTicksPerSecond(rate: number) {
    this.ticksPerSecond = rate;
    this.post({ type: 'rate', ticksPerSecond: rate });
  }

  setRunning(running: boolean) {
    if (running === this.running) return;
    this.running = running;
    this.post({ type: running ? 'resume' : 'pause' });
    if (running) {
      this.lastFrameAt = 0;
      // a pause is not a commit: drop any half-finished cost measurement
      this.framesSinceFlush = -1;
      this.statsWindowStart = performance.now();
      this.frames = this.ticks = this.updates = this.commits = 0;
      this.raf = requestAnimationFrame(this.frame);
    } else {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.emitStats({
        ...this.stats,
        running: false,
        fps: 0,
        ticksPerSecond: 0,
        updatesPerSecond: 0,
        commitsPerSecond: 0,
      });
    }
  }

  // -------------------------------------------------------------------------
  // ticks in
  // -------------------------------------------------------------------------

  private onTicks(message: WorkerOutMessage) {
    if (message.type !== 'ticks') return;
    const { buffer, count } = message;
    const n = this.rowCount;
    for (let t = 0; t < count; t++) {
      const o = t * TICK_STRIDE;
      const id = buffer[o];
      if (id >= n) continue;
      const price = buffer[o + 1];
      const volume = buffer[o + 2];
      const previous = this.price[id];
      this.price[id] = price;
      this.volume[id] = volume;
      if (price > this.high[id]) this.high[id] = price;
      if (price < this.low[id]) this.low[id] = price;

      const position = this.position[id];
      const open = this.open[id];
      const delta = position * (price - previous);
      this.sectorDayPnl[this.sector[id]] += delta;
      this.totalDayPnl += delta;

      this.pending.set(id, {
        id,
        price,
        volume,
        changePct: ((price - open) / open) * 100,
        pnl: position * (price - this.avgCost[id]),
        dayPnl: position * (price - open),
        tick: this.tickSeq++,
      });

      const spark = this.sparks.get(id);
      if (spark) {
        spark.values[spark.head] = price;
        spark.head = (spark.head + 1) % SPARK_LENGTH;
      }
    }
    this.ticks += count;
  }

  // -------------------------------------------------------------------------
  // per-frame flush with adaptive back-off
  // -------------------------------------------------------------------------

  private frame = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);

    if (this.lastFrameAt) {
      const delta = now - this.lastFrameAt;
      if (this.framesSinceFlush < 0) {
        // an idle frame: track the display's natural frame time
        this.baseFrame = this.baseFrame * 0.9 + Math.min(delta, 40) * 0.1;
      }
    }
    this.lastFrameAt = now;
    this.frames++;

    // the commit (DataSource recompute + React render) lands within the next
    // two frames — measure how much longer than two natural frames they took
    if (this.framesSinceFlush >= 0 && ++this.framesSinceFlush === 2) {
      const elapsed = now - this.flushedAt;
      this.framesSinceFlush = -1;
      // with small grids, > 2s means the page was throttled, not a slow commit
      if (elapsed < 2000 || this.rowCount >= HeroFeed.SCROLL_HOLD_ROWS) {
        const cost = Math.max(0, elapsed - 2 * this.baseFrame);
        this.costEma = this.costEma ? this.costEma * 0.7 + cost * 0.3 : cost;
        // keep commits to roughly a third of the main thread at most — and
        // much less once a single commit is long enough to be felt (1M rows)
        this.flushInterval =
          this.costEma < 5
            ? 0
            : Math.min(5000, this.costEma * (this.costEma > 80 ? 6 : 2.5));
        if (
          this.costEma > HeroFeed.MAX_COMMIT_MS &&
          this.rowCount >= HeroFeed.SCROLL_HOLD_ROWS
        ) {
          this.gridPaused = true;
        }
      }
    }

    if (
      this.api &&
      !this.holdFlushes &&
      !this.gridPaused &&
      !this.scrollHeld &&
      this.pending.size &&
      this.framesSinceFlush < 0 &&
      now - this.lastFlushAt >= this.flushInterval
    ) {
      const batch = Array.from(this.pending.values());
      this.pending.clear();
      try {
        this.api.updateDataArray(batch);
      } catch (error) {
        console.warn('[hero] update failed', error);
      }
      this.lastFlushAt = now;
      this.flushedAt = now;
      this.framesSinceFlush = 0;
      this.updates += batch.length;
      this.commits++;
      this.flushListeners.forEach((listener) => listener());
    }

    if (now - this.seriesSampledAt >= SERIES_INTERVAL_MS) {
      this.sampleSeries(now);
    }

    const windowMs = now - this.statsWindowStart;
    if (windowMs >= 500) {
      const perSecond = (value: number) =>
        Math.round((value * 1000) / windowMs);
      this.emitStats({
        ticksPerSecond: perSecond(this.ticks),
        updatesPerSecond: perSecond(this.updates),
        commitsPerSecond: perSecond(this.commits),
        commitMs: this.costEma,
        fps: Math.min(240, perSecond(this.frames)),
        flushIntervalMs: this.flushInterval,
        scrollHeld: this.scrollHeld,
        gridPaused: this.gridPaused,
        running: true,
      });
      this.statsWindowStart = now;
      this.frames = this.ticks = this.updates = this.commits = 0;
    }
  };

  private emitStats(stats: FeedStats) {
    this.stats = stats;
    this.statsListeners.forEach((listener) => listener(stats));
  }

  onStats(listener: (stats: FeedStats) => void) {
    this.statsListeners.add(listener);
    return () => {
      this.statsListeners.delete(listener);
    };
  }

  /** Called after every commit to the grid (charts redraw from the mirror). */
  onFlush(listener: () => void) {
    this.flushListeners.add(listener);
    return () => {
      this.flushListeners.delete(listener);
    };
  }

  // -------------------------------------------------------------------------
  // sparklines
  // -------------------------------------------------------------------------

  /**
   * Last SPARK_LENGTH prices of a row, oldest first. Created lazily the first
   * time a row renders, seeded with a short synthetic walk ending at the
   * current price, then extended by real ticks.
   */
  sparkline(id: number, out: Float32Array = new Float32Array(SPARK_LENGTH)) {
    let ring = this.sparks.get(id);
    if (!ring) {
      if (this.sparks.size > 40_000) this.sparks.clear();
      const values = new Float32Array(SPARK_LENGTH);
      let v = id < this.capacity ? this.price[id] : initialPriceOf(id);
      const sigma = sigmaOf(id) * 2.2;
      for (let k = SPARK_LENGTH - 1; k >= 0; k--) {
        values[k] = v;
        v /= Math.exp(hashGauss(id, 500 + k) * sigma);
      }
      ring = { values, head: 0 };
      this.sparks.set(id, ring);
    }
    const { values, head } = ring;
    for (let k = 0; k < SPARK_LENGTH; k++)
      out[k] = values[(head + k) % SPARK_LENGTH];
    return out;
  }

  // -------------------------------------------------------------------------
  // selected instrument (price chart)
  // -------------------------------------------------------------------------

  select(id: number) {
    if (id === this.selectedId && this.seriesSampledAt) return;
    this.selectedId = id;
    this.ensureCapacity(id + 1);
    // seed a minute of plausible history ending at the current price
    const values = this.series.values;
    let v = this.price[id];
    const sigma = sigmaOf(id) * 1.4;
    for (let k = SERIES_LENGTH - 1; k >= 0; k--) {
      values[k] = v;
      v /= Math.exp(hashGauss(id, 2000 + k) * sigma);
    }
    this.series.head = 0;
    this.seriesSampledAt = performance.now();
    this.selectedListeners.forEach((listener) => listener(id));
  }

  onSelect(listener: (id: number) => void) {
    this.selectedListeners.add(listener);
    return () => {
      this.selectedListeners.delete(listener);
    };
  }

  private sampleSeries(now: number) {
    const id = this.selectedId;
    if (id >= this.capacity) return;
    this.series.values[this.series.head] = this.price[id];
    this.series.head = (this.series.head + 1) % SERIES_LENGTH;
    this.seriesSampledAt = now;
  }

  /** Selected-row price samples, oldest first. */
  selectedSeries(out: Float32Array) {
    const { values, head } = this.series;
    for (let k = 0; k < SERIES_LENGTH; k++)
      out[k] = values[(head + k) % SERIES_LENGTH];
    return out;
  }

  // -------------------------------------------------------------------------
  // heatmap
  // -------------------------------------------------------------------------

  private heatTiles: HeatTile[] | null = null;

  /** The biggest instruments (by market cap) among the current rows. */
  topInstruments(count = 80): HeatTile[] {
    if (
      this.heatTiles &&
      this.heatTiles.length === Math.min(count, this.rowCount)
    ) {
      return this.heatTiles;
    }
    const n = this.rowCount;
    const ids: number[] = [];
    const caps: number[] = [];
    let floor = -1;
    for (let i = 0; i < n; i++) {
      const cap = marketCapOf(i);
      if (ids.length >= count && cap <= floor) continue;
      ids.push(i);
      caps.push(cap);
      if (ids.length > count * 2) {
        const order = ids
          .map((_, k) => k)
          .sort((a, b) => caps[b] - caps[a])
          .slice(0, count);
        const nextIds = order.map((k) => ids[k]);
        const nextCaps = order.map((k) => caps[k]);
        ids.length = caps.length = 0;
        ids.push(...nextIds);
        caps.push(...nextCaps);
        floor = caps[caps.length - 1];
      }
    }
    const order = ids
      .map((_, k) => k)
      .sort((a, b) => caps[b] - caps[a])
      .slice(0, count);
    this.heatTiles = order.map((k) => ({
      id: ids[k],
      symbol: symbolOf(ids[k]),
      sector: sectorIndexOf(ids[k]),
      cap: caps[k],
    }));
    return this.heatTiles;
  }

  changePctOf(id: number) {
    return ((this.price[id] - this.open[id]) / this.open[id]) * 100;
  }
}
