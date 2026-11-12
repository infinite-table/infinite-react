/**
 * Infinite Table vs MUI X Data Grid, AG Grid and TanStack Table -
 * performance comparison, for each dataset size (300k and 1M rows - see
 * BENCH_SIZES in data.ts).
 *
 * Run with `npm run benchmark` (see README.md next to this file for the
 * methodology, options and how to read the report).
 *
 * Every scenario runs WARMUP + RUNS times per grid, changing the order of
 * the grids from one run to the next, each run in a fresh browser context
 * (fresh renderer process, cold JIT, empty heap). Results go to
 * benchmark-results/<run id>/.
 */
import {
  test,
  expect,
  Browser,
  CDPSession,
  Page,
  TestInfo,
} from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  BenchEnvironment,
  FRAME_TRACE_CATEGORIES,
  GRID_LABELS,
  GRID_NAMES,
  GridName,
  LATENCY_TRACE_CATEGORIES,
  MetricDef,
  ScenarioResult,
  SizeResults,
  SizeScrollInfo,
  Trace,
  analyzeBlankFramesInBrowser,
  buildReport,
  collectGarbage,
  getFrameStats,
  getMetrics,
  getSettledLatency,
  getVisibleLatency,
  median,
  metricsDelta,
  parseTrace,
  percentile,
  scenarioTable,
} from './benchUtils';
import { BENCH_ROW_HEIGHT, BENCH_SIZES, BenchSize } from './data';
import type { Bench } from './harness';

declare global {
  interface Window {
    __bench?: Bench;
  }
}

// ---------------------------------------------------------------------------
// options (env vars)
// ---------------------------------------------------------------------------

const RUNS = Number(process.env.BENCH_RUNS || 7);
const WARMUP = Number(process.env.BENCH_WARMUP ?? 1);
const CPU_THROTTLE = Number(process.env.BENCH_CPU_THROTTLE || 1);
const ONLY = process.env.BENCH_SCENARIOS
  ? process.env.BENCH_SCENARIOS.split(',').map((s) => s.trim())
  : null;
const SAVE_TRACES = process.env.BENCH_SAVE_TRACES === '1';
const ALLOW_DEV = process.env.BENCH_ALLOW_DEV === '1';
// px/s - roughly a strong flick on a trackpad
const SCROLL_SPEED = Number(process.env.BENCH_SCROLL_SPEED || 8000);
const SCROLL_DISTANCE = Number(process.env.BENCH_SCROLL_DISTANCE || 24000);
// very fast "fling", to provoke blank areas
const FAST_SCROLL_SPEED = Number(process.env.BENCH_FAST_SCROLL_SPEED || 20000);

const SIZES = (process.env.BENCH_SIZES || Object.keys(BENCH_SIZES).join(','))
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean) as BenchSize[];
for (const size of SIZES) {
  if (!(size in BENCH_SIZES)) {
    throw new Error(
      `Unknown size "${size}" in BENCH_SIZES - use ${Object.keys(
        BENCH_SIZES,
      ).join(', ')}`,
    );
  }
}

const RUN_ID = process.env.BENCH_RUN_ID || 'local';
// not in test-results/ - every regular Playwright run empties that folder
const RESULTS_ROOT = path.resolve(__dirname, '../../benchmark-results');
const RESULTS_DIR = path.join(RESULTS_ROOT, RUN_ID);

// BENCH_GRIDS=ag-grid,infinite measures only some of the grids
const GRIDS: GridName[] = process.env.BENCH_GRIDS
  ? GRID_NAMES.filter((grid) =>
      process.env
        .BENCH_GRIDS!.split(',')
        .map((s) => s.trim().toLowerCase())
        .includes(grid),
    )
  : GRID_NAMES;
if (GRIDS.length < 2) {
  throw new Error(
    `BENCH_GRIDS needs at least two of ${GRID_NAMES.join(', ')} - got "${
      process.env.BENCH_GRIDS
    }"`,
  );
}
const VIEWPORT = { width: 1400, height: 1000 };

// ---------------------------------------------------------------------------
// per-run browser context
// ---------------------------------------------------------------------------

type RunContext = {
  grid: GridName;
  page: Page;
  cdp: CDPSession;
  browser: Browser;
  /** id of this run, for trace file names */
  runName: string;
};

let environment: BenchEnvironment | null = null;

/**
 * px added to the box of each grid (`?extraHeight=`), so all have a body of
 * the same height and render the same number of rows - worked out in the
 * setup test. The grids differ by a few px of borders, and by more when one
 * shows something the others don't: MUI's pagination footer, or the footer
 * Infinite Table renders when it has no license key.
 */
let boxExtraHeight: Partial<Record<GridName, number>> | null = null;

/**
 * How each grid maps its scrollbar onto the rows, per size - measured in
 * the setup test (see calibrateScroll in harness.ts) and given to every page
 * that is opened after it.
 */
const scrollInfo: Partial<
  Record<BenchSize, Partial<Record<GridName, SizeScrollInfo>>>
> = {};

async function openGrid(
  browser: Browser,
  baseURL: string,
  grid: GridName,
  size: BenchSize,
  runName: string,
) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    baseURL,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable', { timeDomain: 'timeTicks' });

  const extraHeight = boxExtraHeight?.[grid] ?? 0;
  await page.goto(
    `benchmark/${grid}-${size}?autoMount=0` +
      (extraHeight ? `&extraHeight=${extraHeight}` : ''),
    { waitUntil: 'load' },
  );
  await page.waitForFunction(() => !!window.__bench, null, {
    timeout: 30_000,
  });

  const info = await page.evaluate(() => {
    const b = window.__bench!;
    return {
      grid: b.grid,
      env: b.env,
      dev: b.dev,
      version: b.version,
      rowCount: b.rowCount,
    };
  });
  expect(info.grid).toBe(grid);
  const ratio = scrollInfo[size]?.[grid]?.ratio;
  if (ratio != null) {
    await page.evaluate(
      (ratio) => window.__bench!.setScrollRatio(ratio),
      ratio,
    );
  }
  if (!ALLOW_DEV && (info.env !== 'production' || info.dev !== false)) {
    throw new Error(
      `The ${grid} page is a ${info.env} build with __DEV__=${info.dev}. ` +
        `Numbers would be meaningless - run "npm run benchmark" (which builds ` +
        `the production benchmark app) or set BENCH_ALLOW_DEV=1 to try the ` +
        `spec against "next dev".`,
    );
  }

  const ctx: RunContext = { grid, page, cdp, browser, runName };
  return {
    ctx,
    info,
    errors,
    close: () => context.close(),
  };
}

/**
 * two bodies show the same rows: at most a pixel apart, and with the same
 * number of rows in view
 */
function sameBodyHeight(a: number, b: number) {
  return (
    Math.abs(a - b) <= 1 &&
    Math.ceil(a / BENCH_ROW_HEIGHT) === Math.ceil(b / BENCH_ROW_HEIGHT)
  );
}

async function setThrottle(ctx: RunContext, on: boolean) {
  if (CPU_THROTTLE > 1) {
    await ctx.cdp.send('Emulation.setCPUThrottlingRate', {
      rate: on ? CPU_THROTTLE : 1,
    });
  }
}

async function mountAndSettle(ctx: RunContext) {
  await ctx.page.evaluate(() => window.__bench!.mount());
  await settle(ctx.page, 600);
}

async function settle(page: Page, ms = 300) {
  await page.waitForTimeout(ms);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

let traceCounter = 0;

async function traced<T>(
  ctx: RunContext,
  categories: string[],
  fn: () => Promise<T>,
): Promise<{ result: T; trace: Trace }> {
  await ctx.browser.startTracing(ctx.page, { categories });
  let result: T;
  let buffer: Buffer;
  try {
    result = await fn();
  } finally {
    buffer = await ctx.browser.stopTracing();
  }
  if (SAVE_TRACES) {
    const dir = path.join(RESULTS_DIR, 'traces');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, `${ctx.runName}-${++traceCounter}.json`),
      buffer,
    );
  }
  return { result, trace: parseTrace(buffer) };
}

const VERBOSE = process.env.BENCH_VERBOSE === '1';

async function getSettled(ctx: RunContext, trace: Trace, label: string) {
  const info = await ctx.page.evaluate(
    (label) => window.__bench!.getSettleInfo(label),
    label,
  );
  if (!info) {
    throw new Error(`No settle info for ${label}`);
  }
  if (VERBOSE) {
    console.log(
      `   ${ctx.grid} ${label}: ${
        info.mutations
      } mutations after ready, last: ${info.recent.join(' ')}`,
    );
  }
  return getSettledLatency(trace, label, info.lastMutationAt);
}

async function getBodyCenter(page: Page) {
  const body = await page.evaluate(() => window.__bench!.getBodyRect());
  return {
    body,
    x: Math.round(body.left + body.width / 2),
    y: Math.round(body.top + body.height / 2),
  };
}

/**
 * Real input through Chrome's input pipeline (wheel events, threaded
 * scrolling), at a constant speed - the same gesture for every grid.
 * vertical: one gesture down; horizontal: back-and-forth sweeps
 */
async function scrollGesture(
  ctx: RunContext,
  axis: 'vertical' | 'horizontal',
  speed: number,
) {
  const { x, y } = await getBodyCenter(ctx.page);
  await ctx.page.mouse.move(x, y);
  if (axis === 'vertical') {
    await ctx.cdp.send('Input.synthesizeScrollGesture', {
      x,
      y,
      yDistance: -SCROLL_DISTANCE,
      speed,
      gestureSourceType: 'mouse',
      preventFling: true,
    });
    return;
  }
  const { scrollLeftMax } = await ctx.page.evaluate(() =>
    window.__bench!.getScrollMax(),
  );
  for (let i = 0; i < 4; i++) {
    await ctx.cdp.send('Input.synthesizeScrollGesture', {
      x,
      y,
      // negative = scroll right
      xDistance: (i % 2 === 0 ? -1 : 1) * scrollLeftMax,
      speed: Math.min(speed, 4000),
      gestureSourceType: 'mouse',
      preventFling: true,
    });
  }
}

// ---------------------------------------------------------------------------
// scenarios
// ---------------------------------------------------------------------------

type Scenario = {
  id: string;
  description: string;
  metrics: MetricDef[];
  run(ctx: RunContext): Promise<Record<string, number>>;
};

const ms = (key: string, label: string): MetricDef => ({
  key,
  label,
  unit: 'ms',
  better: 'lower',
});

const cpuMetrics: MetricDef[] = [
  ms('scriptMs', 'Main thread: scripting'),
  ms('layoutMs', 'Main thread: layout'),
  ms('styleMs', 'Main thread: style recalc'),
  ms('taskMs', 'Main thread: all tasks'),
];

const mountScenario: Scenario = {
  id: 'mount',
  description:
    'Mount the grid with all the rows (data already in memory). ' +
    '"Visible" = from setState to the end of the first frame committed with the whole viewport (first/last visible row and column) showing the right content. ' +
    '"Settled" = until the first frame committed after the grid\'s last DOM mutation. ' +
    'Memory is the JS heap retained by the grid after GC (heap after mount - heap before mount).',
  metrics: [
    ms('visibleMs', 'Time to first rows painted'),
    ms('settledMs', 'Time until settled'),
    ...cpuMetrics,
    {
      key: 'heapMB',
      label: 'JS heap retained by grid',
      unit: 'MB',
      better: 'lower',
    },
    {
      key: 'gridElements',
      label: 'DOM elements in grid',
      unit: '',
      better: 'lower',
    },
  ],
  async run(ctx) {
    const { page, cdp } = ctx;
    await collectGarbage(cdp);
    const heapBefore = (await getMetrics(cdp)).JSHeapUsedSize;

    await setThrottle(ctx, true);
    const m0 = await getMetrics(cdp);
    const { trace } = await traced(ctx, LATENCY_TRACE_CATEGORIES, async () => {
      await page.evaluate(() => window.__bench!.mount());
      await page.waitForTimeout(1000);
      await page.evaluate(() => window.__bench!.markIdle());
    });
    const m1 = await getMetrics(cdp);
    await setThrottle(ctx, false);

    const { visible } = getVisibleLatency(trace, 'mount');
    const settled = await getSettled(ctx, trace, 'mount');

    await collectGarbage(cdp);
    const heapAfter = (await getMetrics(cdp)).JSHeapUsedSize;
    const gridElements = await page.evaluate(() =>
      window.__bench!.getGridElementCount(),
    );

    return {
      visibleMs: visible,
      settledMs: settled,
      ...metricsDelta(m0, m1),
      heapMB: (heapAfter - heapBefore) / 1024 / 1024,
      gridElements,
    };
  },
};

function sortScenario(field: 'code' | 'salary', kind: string): Scenario {
  return {
    id: `sort-${kind}`,
    description:
      `Click the "${field}" column header (${kind} column, unique-ish values) - first click sorts ascending (cold), second click descending. ` +
      'Measured from pointerdown to the end of the first frame committed with all visible rows sorted (and each row consistent: its cells belong to the same data row).',
    metrics: [
      ms('ascVisibleMs', 'Ascending: click to sorted rows painted'),
      ms('ascSettledMs', 'Ascending: click to settled'),
      ms('descVisibleMs', 'Descending: click to sorted rows painted'),
      ms('descSettledMs', 'Descending: click to settled'),
      ms('ascScriptMs', 'Ascending: main thread scripting'),
      ms('descScriptMs', 'Descending: main thread scripting'),
    ],
    async run(ctx) {
      const { page, cdp } = ctx;
      await mountAndSettle(ctx);
      const res: Record<string, number> = {};

      for (const dir of [1, -1] as const) {
        const name = dir === 1 ? 'asc' : 'desc';
        const label = `sort-${name}`;
        const expected = await page.evaluate(
          ([field, dir]) =>
            window.__bench!.getExpectedFirstValue(field as any, dir),
          [field, dir] as const,
        );
        const { x, y } = await page.evaluate(
          (field) => window.__bench!.getHeaderCellCenter(field),
          field,
        );
        await page.mouse.move(x, y);
        await page.evaluate(
          ([label, field, dir, expected]) =>
            window.__bench!.armInteraction(label, field as any, dir, expected),
          [label, field, dir, expected] as const,
        );
        await collectGarbage(cdp);
        await settle(page, 200);

        await setThrottle(ctx, true);
        const m0 = await getMetrics(cdp);
        const { trace } = await traced(
          ctx,
          LATENCY_TRACE_CATEGORIES,
          async () => {
            await page.mouse.down();
            await page.mouse.up();
            await page.evaluate(() => window.__bench!.awaitInteraction());
            await page.waitForTimeout(500);
            await page.evaluate(() => window.__bench!.markIdle());
          },
        );
        const m1 = await getMetrics(cdp);
        await setThrottle(ctx, false);

        res[`${name}VisibleMs`] = getVisibleLatency(trace, label).visible;
        res[`${name}SettledMs`] = await getSettled(ctx, trace, label);
        res[`${name}ScriptMs`] = metricsDelta(m0, m1).scriptMs;
        await settle(page, 300);
      }
      return res;
    },
  };
}

// spread across the whole scroll range, in a fixed (shuffled) order
const JUMP_TARGETS = [
  0.52, 0.07, 0.91, 0.33, 0.68, 0.18, 0.84, 0.45, 0.26, 0.97,
];

const jumpScenario: Scenario = {
  id: 'scroll-jump',
  description:
    `Programmatic jumps to ${JUMP_TARGETS.length} far-away scroll positions (like dragging the scrollbar thumb). ` +
    'Measured from setting scrollTop to the end of the first frame committed with the first and last visible rows showing the right content, at the right position.',
  metrics: [
    ms('visibleMs', 'Jump to rows painted (median of jumps)'),
    ms('visibleMaxMs', 'Jump to rows painted (worst jump)'),
    ms('settledMs', 'Jump to settled (median of jumps)'),
    ms('scriptMs', 'Main thread scripting (all jumps)'),
  ],
  async run(ctx) {
    const { page, cdp } = ctx;
    await mountAndSettle(ctx);
    const { scrollTopMax } = await page.evaluate(() =>
      window.__bench!.getScrollMax(),
    );
    // keep a couple of rows of room at the bottom
    const targets = JUMP_TARGETS.map((f) =>
      Math.round(f * (scrollTopMax - 5 * BENCH_ROW_HEIGHT)),
    );
    await collectGarbage(cdp);
    await setThrottle(ctx, true);
    const m0 = await getMetrics(cdp);
    const { trace } = await traced(ctx, LATENCY_TRACE_CATEGORIES, async () => {
      for (let i = 0; i < targets.length; i++) {
        await page.evaluate(
          ([label, top]) => window.__bench!.jumpTo(label, top),
          [`jump-${i}`, targets[i]] as const,
        );
        await page.waitForTimeout(250);
      }
      await page.evaluate(() => window.__bench!.markIdle());
    });
    const m1 = await getMetrics(cdp);
    await setThrottle(ctx, false);

    const visible = targets.map(
      (_, i) => getVisibleLatency(trace, `jump-${i}`).visible,
    );
    const settled: number[] = [];
    for (let i = 0; i < targets.length; i++) {
      settled.push(await getSettled(ctx, trace, `jump-${i}`));
    }
    return {
      visibleMs: median(visible),
      visibleMaxMs: Math.max(...visible),
      settledMs: median(settled),
      scriptMs: metricsDelta(m0, m1).scriptMs,
    };
  },
};

function smoothnessScenario(axis: 'vertical' | 'horizontal'): Scenario {
  return {
    id: `scroll-${axis}`,
    description:
      (axis === 'vertical'
        ? `Wheel-scroll down ${SCROLL_DISTANCE}px at ${SCROLL_SPEED}px/s`
        : `Wheel-scroll right/left over all columns, 4 sweeps at ${Math.min(
            SCROLL_SPEED,
            4000,
          )}px/s`) +
      ' (Input.synthesizeScrollGesture - real input pipeline, same gesture for every grid). ' +
      'Frame outcomes come from Chrome\'s compositor (PipelineReporter): "partial" = frame shown without the main thread\'s update, "dropped" = no new frame. ' +
      'rAF frame intervals and Long Animation Frames come from the page.',
    metrics: [
      {
        key: 'presentedAllPct',
        label: 'Frames fully presented',
        unit: '%',
        better: 'higher',
      },
      {
        key: 'partialPct',
        label: 'Frames presented without main-thread update',
        unit: '%',
        better: 'lower',
      },
      {
        key: 'droppedPct',
        label: 'Frames dropped',
        unit: '%',
        better: 'lower',
      },
      {
        key: 'rafFps',
        label: 'Main thread frame rate (rAF)',
        unit: 'fps',
        better: 'higher',
      },
      ms('p95FrameMs', 'p95 rAF frame interval'),
      ms('maxFrameMs', 'Worst rAF frame interval'),
      {
        key: 'longFramesPct',
        label: 'rAF intervals > 25ms',
        unit: '%',
        better: 'lower',
      },
      ms('loafBlockingMs', 'Long animation frames: total blocking'),
      ...cpuMetrics,
    ],
    async run(ctx) {
      const { page, cdp } = ctx;
      await mountAndSettle(ctx);
      const { x, y } = await getBodyCenter(page);
      await page.mouse.move(x, y);
      await collectGarbage(cdp);
      await settle(page, 200);

      await setThrottle(ctx, true);
      const m0 = await getMetrics(cdp);
      const { trace, result: record } = await traced(
        ctx,
        FRAME_TRACE_CATEGORIES,
        async () => {
          await page.evaluate(() => {
            performance.mark('bench:start:scroll');
            window.__bench!.startFrameRecorder();
          });
          await scrollGesture(ctx, axis, SCROLL_SPEED);
          return page.evaluate(() => {
            const res = window.__bench!.stopFrameRecorder();
            performance.mark('bench:end:scroll');
            return res;
          });
        },
      );
      const m1 = await getMetrics(cdp);
      await setThrottle(ctx, false);

      const intervals: number[] = [];
      for (let i = 1; i < record.frames.length; i++) {
        intervals.push(record.frames[i] - record.frames[i - 1]);
      }
      const duration =
        record.frames[record.frames.length - 1] - record.frames[0];
      const frameStats = getFrameStats(
        trace,
        'bench:start:scroll',
        'bench:end:scroll',
      );
      const scroll = await page.evaluate(() =>
        window.__bench!.getScrollPosition(),
      );
      if (axis === 'vertical') {
        // every grid must have received (and applied) the same scroll
        expect(scroll.scrollTop).toBeGreaterThan(SCROLL_DISTANCE * 0.9);
      }

      return {
        presentedAllPct: frameStats.presentedAllPct,
        partialPct: frameStats.partialPct,
        droppedPct: frameStats.droppedPct,
        rafFps: ((record.frames.length - 1) / duration) * 1000,
        p95FrameMs: percentile(intervals, 95),
        maxFrameMs: Math.max(...intervals),
        longFramesPct:
          (intervals.filter((i) => i > 25).length / intervals.length) * 100,
        loafBlockingMs: record.loaf.reduce(
          (sum, l) => sum + l.blockingDuration,
          0,
        ),
        ...metricsDelta(m0, m1),
      };
    },
  };
}

function probeScenario(axis: 'vertical' | 'horizontal'): Scenario {
  const speed = axis === 'vertical' ? FAST_SCROLL_SPEED : SCROLL_SPEED;
  return {
    id: `correctness-${axis}`,
    description:
      `Same kind of ${axis} wheel gesture` +
      (axis === 'vertical' ? `, faster (${speed}px/s)` : '') +
      '. After every painted frame, samples points across the body and checks the cell there is the one that should be there for the current scroll position: ' +
      '"blank" = no cell, "wrong" = a cell for another row/column (stale content, or position lagging behind the scroll). ' +
      "This is the main thread's view of the frame; it reads layout, so it is never combined with the timing passes.",
    metrics: [
      { key: 'blankPct', label: 'Blank samples', unit: '%', better: 'lower' },
      {
        key: 'wrongPct',
        label: 'Wrong/stale samples',
        unit: '%',
        better: 'lower',
      },
      {
        key: 'badFramesPct',
        label: 'Frames with any blank/wrong sample',
        unit: '%',
        better: 'lower',
      },
      {
        key: 'worstFrameOkPct',
        label: 'Worst frame: correct samples',
        unit: '%',
        better: 'higher',
      },
    ],
    async run(ctx) {
      const { page, cdp } = ctx;
      await mountAndSettle(ctx);
      const { x, y } = await getBodyCenter(page);
      await page.mouse.move(x, y);
      await collectGarbage(cdp);
      await settle(page, 200);

      await setThrottle(ctx, true);
      await page.evaluate((axis) => window.__bench!.startProbe(axis), axis);
      await scrollGesture(ctx, axis, speed);
      const frames = await page.evaluate(() => window.__bench!.stopProbe());
      await setThrottle(ctx, false);

      if (VERBOSE) {
        const badFrames = frames.filter((f) => f.ok < f.samples);
        console.log(
          `   ${ctx.grid} ${axis}: ${badFrames.length}/${frames.length} frames with blank/wrong samples`,
        );
        for (const f of badFrames.slice(0, 8)) {
          console.log(
            `     blank=${f.blank} wrong=${f.wrong}/${f.samples} ${f.firstWrong}`,
          );
        }
      }

      let samples = 0;
      let blank = 0;
      let wrong = 0;
      let bad = 0;
      let worst = 1;
      for (const f of frames) {
        samples += f.samples;
        blank += f.blank;
        wrong += f.wrong;
        if (f.ok < f.samples) {
          bad++;
        }
        worst = Math.min(worst, f.samples ? f.ok / f.samples : 1);
      }
      return {
        blankPct: (blank / samples) * 100,
        wrongPct: (wrong / samples) * 100,
        badFramesPct: (bad / frames.length) * 100,
        worstFrameOkPct: worst * 100,
        frames: frames.length,
      };
    },
  };
}

const visualScenario: Scenario = {
  id: 'visual-blank-vertical',
  description:
    `Fast vertical wheel gesture (${FAST_SCROLL_SPEED}px/s) while recording what the compositor actually displays (CDP screencast). ` +
    'Each frame is checked for blank areas: vertical runs of the body with no text where rows should be. ' +
    'Unlike the correctness probe, this also catches the compositor scrolling ahead of the main thread. ' +
    'Screencast capture skips frames under load and adds overhead - compare the grids, not absolute numbers.',
  metrics: [
    {
      key: 'blankFramesPct',
      label: 'Captured frames with blank rows',
      unit: '%',
      better: 'lower',
    },
    {
      key: 'blankAreaPct',
      label: 'Blank body area (avg over frames)',
      unit: '%',
      better: 'lower',
    },
    {
      key: 'maxBlankRows',
      label: 'Worst frame: blank rows',
      unit: 'rows',
      better: 'lower',
    },
    {
      key: 'capturedFrames',
      label: 'Captured frames',
      unit: '',
      better: 'higher',
    },
  ],
  async run(ctx) {
    const { page, cdp } = ctx;
    await mountAndSettle(ctx);
    const { body, x, y } = await getBodyCenter(page);
    await page.mouse.move(x, y);
    await collectGarbage(cdp);
    await settle(page, 200);

    const frames: string[] = [];
    let recording = false;
    const onFrame = (event: any) => {
      if (recording) {
        frames.push(event.data);
      }
      cdp
        .send('Page.screencastFrameAck', { sessionId: event.sessionId })
        .catch(() => {});
    };
    cdp.on('Page.screencastFrame', onFrame);
    await cdp.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 90,
      everyNthFrame: 1,
    });
    await page.waitForTimeout(300);

    await setThrottle(ctx, true);
    recording = true;
    await scrollGesture(ctx, 'vertical', FAST_SCROLL_SPEED);
    recording = false;
    await setThrottle(ctx, false);
    await cdp.send('Page.stopScreencast');
    cdp.off('Page.screencastFrame', onFrame);

    // analyze in a separate page - decoding happens in the browser
    const analyzer = await page.context().newPage();
    const inset = 16; // stay clear of scrollbars and cell padding at edges
    const region = {
      left: Math.round(body.left + inset),
      top: Math.round(body.top),
      width: Math.round(body.width - 2 * inset),
      height: Math.round(body.height - inset),
    };
    const results: { blankRows: number; blankPx: number }[] = [];
    for (let i = 0; i < frames.length; i += 20) {
      results.push(
        ...(await analyzer.evaluate(analyzeBlankFramesInBrowser, {
          frames: frames.slice(i, i + 20),
          region,
          rowHeight: BENCH_ROW_HEIGHT,
        })),
      );
    }
    await analyzer.close();

    const blankFrames = results.filter((r) => r.blankRows > 0).length;
    return {
      blankFramesPct: results.length
        ? (blankFrames / results.length) * 100
        : NaN,
      blankAreaPct: results.length
        ? (results.reduce((s, r) => s + r.blankPx, 0) /
            (results.length * region.height)) *
          100
        : NaN,
      maxBlankRows: Math.max(0, ...results.map((r) => r.blankRows)),
      capturedFrames: results.length,
    };
  },
};

const SCENARIOS: Scenario[] = [
  mountScenario,
  sortScenario('code', 'string'),
  sortScenario('salary', 'number'),
  jumpScenario,
  smoothnessScenario('vertical'),
  smoothnessScenario('horizontal'),
  probeScenario('vertical'),
  probeScenario('horizontal'),
  visualScenario,
];

// ---------------------------------------------------------------------------
// results
// ---------------------------------------------------------------------------

type StoredResults = {
  environment: BenchEnvironment | null;
  sizes: Partial<Record<BenchSize, SizeResults>>;
};

function resultsFile() {
  return path.join(RESULTS_DIR, 'results.json');
}

function readResults(): StoredResults {
  try {
    const stored = JSON.parse(fs.readFileSync(resultsFile(), 'utf8'));
    return {
      environment: stored.environment ?? null,
      sizes: stored.sizes ?? {},
    };
  } catch {
    return { environment: null, sizes: {} };
  }
}

function getSizeResults(stored: StoredResults, size: BenchSize) {
  // the setup test fills in the checksum & scroll info - when it's skipped
  // (e.g. --grep for one scenario), the results are still kept
  return (stored.sizes[size] ??= {
    size,
    rowCount: BENCH_SIZES[size],
    checksum: null,
    scroll: null,
    results: {},
  });
}

function saveResults(
  testInfo: TestInfo,
  update: (stored: StoredResults) => void,
) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const stored = readResults();
  stored.environment = environment ?? stored.environment;
  update(stored);
  fs.writeFileSync(resultsFile(), JSON.stringify(stored, null, 2));

  if (!stored.environment) {
    return;
  }
  const sizes = (Object.keys(BENCH_SIZES) as BenchSize[])
    .map((size) => stored.sizes[size])
    .filter((s): s is SizeResults => !!s);
  const report = buildReport(
    stored.environment,
    sizes,
    SCENARIOS.map((s) => s.id),
  );
  fs.writeFileSync(path.join(RESULTS_DIR, 'report.md'), report);
  fs.writeFileSync(path.join(RESULTS_ROOT, 'latest.md'), report);
  testInfo.attachments.push({
    name: 'report.md',
    contentType: 'text/markdown',
    path: path.join(RESULTS_DIR, 'report.md'),
  });
}

function formatSample(sample: Record<string, number>) {
  return Object.entries(sample)
    .map(([k, v]) => `${k}=${Number.isFinite(v) ? Math.round(v * 10) / 10 : v}`)
    .join(' ');
}

// ---------------------------------------------------------------------------
// tests - one group per dataset size, run one after the other
// ---------------------------------------------------------------------------

for (const size of SIZES) {
  const rowCountLabel = BENCH_SIZES[size].toLocaleString('en-US');

  test.describe(`Grid comparison - ${rowCountLabel} rows`, () => {
    test(`setup ${size}: all grids get identical data and a production build`, async ({
      browser,
      baseURL,
    }, testInfo) => {
      const checksums: Partial<Record<GridName, string>> = {};
      const rowTexts: Partial<Record<GridName, (string | null)[][]>> = {};
      const versions: Partial<Record<GridName, string>> = {};
      const scroll: Partial<Record<GridName, SizeScrollInfo>> = {};
      const bodyHeights: Partial<Record<GridName, number>> = {};
      let rowCount = 0;

      // first, give every grid a body of the same height: measure, make the
      // boxes of the shorter ones taller, measure again. More than one pass,
      // because a grid may not turn every extra pixel of its box into a
      // pixel of body (AG Grid's body grows in steps of 1 or 2).
      //
      // "The same" is to within a pixel, with the same number of rows in
      // view: with 1M rows the body of AG Grid only takes odd heights and
      // the one of MUI X only even ones, so they can't be made equal.
      const extra: Partial<Record<GridName, number>> = {};
      const measured: Partial<Record<GridName, number>> = {};
      for (const grid of GRIDS) {
        extra[grid] = 0;
      }
      boxExtraHeight = extra;
      for (let pass = 0; pass < 10; pass++) {
        for (const grid of GRIDS) {
          const { ctx, close } = await openGrid(
            browser,
            baseURL!,
            grid,
            size,
            `setup-${size}-${grid}-body`,
          );
          try {
            await ctx.page.evaluate(() => window.__bench!.mount());
            await settle(ctx.page, 300);
            measured[grid] = await ctx.page.evaluate(
              () => window.__bench!.getBodyRect().height,
            );
          } finally {
            await close();
          }
        }
        const tallest = Math.max(...GRIDS.map((grid) => measured[grid]!));
        const tooShort = GRIDS.filter(
          (grid) => !sameBodyHeight(measured[grid]!, tallest),
        );
        if (!tooShort.length) {
          break;
        }
        for (const grid of tooShort) {
          extra[grid]! += tallest - measured[grid]!;
        }
      }
      console.log(
        `[setup ${size}] body height ${GRIDS.map(
          (grid) =>
            `${GRID_LABELS[grid]} ${measured[grid]}px` +
            (extra[grid] ? ` (box +${extra[grid]}px)` : ''),
        ).join(', ')}`,
      );

      for (const grid of GRIDS) {
        const { ctx, info, close } = await openGrid(
          browser,
          baseURL!,
          grid,
          size,
          `setup-${size}-${grid}`,
        );
        try {
          checksums[grid] = await ctx.page.evaluate(() =>
            window.__bench!.getChecksum(),
          );
          versions[grid] = info.version;
          rowCount = info.rowCount;
          // sanity check the adapter: mount, then read what's rendered
          await ctx.page.evaluate(() => window.__bench!.mount());
          await settle(ctx.page, 300);
          rowTexts[grid] = await ctx.page.evaluate(() =>
            window.__bench!.getVisibleTexts(18),
          );
          bodyHeights[grid] = await ctx.page.evaluate(
            () => window.__bench!.getBodyRect().height,
          );
          // how the scrollbar maps onto the rows, and whether the last row
          // can be reached at all - browsers cap element heights, and
          // 1M rows x 40px is more than that
          scroll[grid] = await ctx.page.evaluate(() =>
            window.__bench!.calibrateScroll(),
          );
          console.log(
            `[setup ${size}] ${GRID_LABELS[grid].padEnd(8)} ${formatSample({
              ...scroll[grid]!,
            })}`,
          );
        } finally {
          await close();
        }
      }

      const reference = GRIDS[0];
      for (const grid of GRIDS) {
        expect(checksums[grid], `data checksum of ${grid}`).toBe(
          checksums[reference],
        );
        // and all render the exact same text in the visible cells
        expect(rowTexts[grid], `visible texts of ${grid}`).toEqual(
          rowTexts[reference],
        );
      }
      const tallestBody = Math.max(...GRIDS.map((g) => bodyHeights[g]!));
      for (const grid of GRIDS) {
        expect(
          sameBodyHeight(bodyHeights[grid]!, tallestBody),
          `the grid bodies differ in height: ${GRIDS.map(
            (g) => `${GRID_LABELS[g]} ${bodyHeights[g]}px`,
          ).join(', ')}`,
        ).toBe(true);
      }
      expect(rowTexts[reference]![17][0]).toBe('18');
      expect(rowCount).toBe(BENCH_SIZES[size]);

      // from here on every page gets its grid's own scrollbar-to-rows
      // mapping - also when one of the checks below fails
      scrollInfo[size] = scroll;

      // the grids that show every row must map the scrollbar onto the rows
      // the same way, otherwise the same wheel gesture scrolls a different
      // number of rows in each (the browser's element size limit depends on
      // the display's scale factor - see --force-device-scale-factor in the
      // config). A grid that can't reach its last row doesn't map the
      // scrollbar at all: it is measured, and the report says where it stops.
      const complete = GRIDS.filter(
        (grid) => scroll[grid] && scroll[grid]!.lastVisibleRow >= rowCount,
      );
      for (const grid of complete) {
        expect(
          Math.abs(scroll[grid]!.ratio - scroll[complete[0]]!.ratio),
          `scroll ratio differs: ${complete
            .map((g) => `${GRID_LABELS[g]} ${scroll[g]!.ratio}`)
            .join(', ')}`,
        ).toBeLessThan(0.01);
      }

      environment = {
        runId: RUN_ID,
        date: new Date().toISOString(),
        chrome: browser.version(),
        headless: !!testInfo.project.use.headless,
        cpuThrottle: CPU_THROTTLE,
        runs: RUNS,
        warmup: WARMUP,
        os: `${os.type()} ${os.release()} ${os.arch()}`,
        cpu: `${os.cpus()[0]?.model ?? 'unknown'} × ${os.cpus().length}`,
        viewport: `${VIEWPORT.width}×${VIEWPORT.height}`,
        versions,
        baseURL: baseURL!,
        bodyHeight: Math.min(...GRIDS.map((g) => bodyHeights[g]!)),
        bodyHeightMax: tallestBody,
        boxExtraHeight,
      };
      saveResults(testInfo, (stored) => {
        const sizeResults = getSizeResults(stored, size);
        sizeResults.rowCount = rowCount;
        sizeResults.checksum = checksums[reference]!;
        sizeResults.scroll = scroll;
      });
    });

    for (const scenario of SCENARIOS) {
      test(`${scenario.id} (${size})`, async ({
        browser,
        baseURL,
      }, testInfo) => {
        test.skip(
          !!ONLY && !ONLY.includes(scenario.id),
          'not in BENCH_SCENARIOS',
        );
        const grids = GRIDS;
        test.setTimeout((WARMUP + RUNS) * grids.length * 120_000);
        if (!environment || !scrollInfo[size]) {
          // the setup test did not run in this process (e.g. --grep)
          const stored = readResults();
          environment = environment ?? stored.environment;
          scrollInfo[size] =
            scrollInfo[size] ?? stored.sizes[size]?.scroll ?? {};
        }
        boxExtraHeight = boxExtraHeight ?? environment?.boxExtraHeight ?? null;

        const samples: ScenarioResult['samples'] = {};
        for (const grid of grids) {
          samples[grid] = [];
        }

        for (let i = 0; i < WARMUP + RUNS; i++) {
          // a different grid goes first in every run, and the order is
          // reversed every other run, so drift (thermal, background load)
          // affects all of them equally
          const start = Math.floor(i / 2) % grids.length;
          const rotated = [...grids.slice(start), ...grids.slice(0, start)];
          const order = i % 2 === 0 ? rotated : rotated.reverse();
          for (const grid of order) {
            const runName = `${size}-${scenario.id}-${grid}-${i}`;
            const { ctx, errors, close } = await openGrid(
              browser,
              baseURL!,
              grid,
              size,
              runName,
            );
            try {
              const sample = await scenario.run(ctx);
              expect(errors, `page errors in ${runName}`).toEqual([]);
              const warmup = i < WARMUP;
              if (!warmup) {
                samples[grid]!.push(sample);
              }
              console.log(
                `[${size} ${scenario.id}] ${
                  warmup ? 'warmup' : `run ${i - WARMUP + 1}/${RUNS}`
                } ${GRID_LABELS[grid].padEnd(8)} ${formatSample(sample)}`,
              );
            } finally {
              await close();
            }
          }
        }

        const result: ScenarioResult = {
          scenario: scenario.id,
          description: scenario.description,
          metrics: scenario.metrics,
          samples,
        };
        saveResults(testInfo, (stored) => {
          getSizeResults(stored, size).results[scenario.id] = result;
        });
        console.log(
          `\n## ${scenario.id} - ${rowCountLabel} rows\n\n${scenarioTable(
            result,
          )}\n`,
        );
      });
    }
  });
}
