/**
 * Two production builds of Infinite Table, compared in the same run - see
 * README.md next to this file.
 *
 * The builds are served by two servers (two checkouts, each with its own
 * `npm run benchmark:build`), given as
 *
 *   BENCH_BUILDS=<baseline id>=<url>,<candidate id>=<url>
 *
 * Every scenario runs WARMUP + RUNS times per build, alternating which build
 * goes first, each run in a fresh browser context. The pages and the
 * in-page harness are the ones of the grid comparison (src/benchmark).
 */
import { test, expect, Browser, CDPSession, Page } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  FRAME_TRACE_CATEGORIES,
  MetricDef,
  Trace,
  TraceEvent,
  bootstrapDiffCI,
  bootstrapRatioCI,
  collectGarbage,
  getFrameStats,
  getMark,
  getMetrics,
  median,
  metricsDelta,
  parseTrace,
  percentile,
  stddev,
} from '../benchmark/benchUtils';
import { BENCH_SIZES, BenchSize } from '../benchmark/data';
import type { Bench } from '../benchmark/harness';

declare global {
  interface Window {
    __bench?: Bench;
  }
}

// ---------------------------------------------------------------------------
// options (env vars)
// ---------------------------------------------------------------------------

type Build = { id: string; url: string };

function parseBuilds(value: string | undefined): Build[] {
  const builds = (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const index = entry.indexOf('=');
      const id = entry.slice(0, index).trim();
      let url = entry.slice(index + 1).trim();
      if (index < 1 || !url) {
        throw new Error(`BENCH_BUILDS: "${entry}" is not <id>=<url>`);
      }
      url = url.endsWith('/') ? url : `${url}/`;
      return { id, url };
    });
  if (builds.length !== 2 || builds[0].id === builds[1].id) {
    throw new Error(
      'BENCH_BUILDS needs two builds with different ids: ' +
        '<baseline id>=<url>,<candidate id>=<url> - got ' +
        JSON.stringify(value),
    );
  }
  return builds;
}

const BUILDS = parseBuilds(process.env.BENCH_BUILDS);
const [BASELINE, CANDIDATE] = BUILDS;

const RUNS = Number(process.env.BENCH_RUNS || 15);
const WARMUP = Number(process.env.BENCH_WARMUP ?? 1);
const CPU_THROTTLE = Number(process.env.BENCH_CPU_THROTTLE || 1);
const SIZE = (process.env.BENCH_SIZE || '300k') as BenchSize;
if (!(SIZE in BENCH_SIZES)) {
  throw new Error(`Unknown BENCH_SIZE "${SIZE}"`);
}
const ONLY = process.env.BENCH_SCENARIOS
  ? process.env.BENCH_SCENARIOS.split(',').map((s) => s.trim())
  : null;
const SCROLL_SPEED = Number(process.env.BENCH_SCROLL_SPEED || 8000);
const SCROLL_DISTANCE = Number(process.env.BENCH_SCROLL_DISTANCE || 24000);
const [VIEWPORT_WIDTH, VIEWPORT_HEIGHT] = (
  process.env.BENCH_VIEWPORT || '1400x1000'
)
  .split('x')
  .map(Number);
const VIEWPORT = { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT };
const SAVE_TRACES = process.env.BENCH_SAVE_TRACES === '1';
const ALLOW_DEV = process.env.BENCH_ALLOW_DEV === '1';
// a computed style the two builds must differ in, e.g.
// `.InfiniteVirtualScrollContainer:position` - checked in the setup, and
// shown in the report, so a wrong build is caught before any timing
const EXPECT_DIFFERENT_STYLE = process.env.BENCH_EXPECT_DIFFERENT_STYLE;
// timing runs on a busy machine are noise: the 1-minute load average must be
// at most this when the run starts (0 = don't check)
const MAX_LOAD = Number(
  process.env.BENCH_MAX_LOAD ?? Math.max(2, os.cpus().length * 0.3),
);

const RUN_ID =
  process.env.BENCH_RUN_ID || new Date().toISOString().replace(/[:.]/g, '-');
const RESULTS_DIR = path.resolve(
  __dirname,
  '../../benchmark-results',
  `builds-${BASELINE.id}-vs-${CANDIDATE.id}-${RUN_ID}`,
);

// ---------------------------------------------------------------------------
// per-run browser context
// ---------------------------------------------------------------------------

type RunContext = {
  build: Build;
  page: Page;
  cdp: CDPSession;
  browser: Browser;
  runName: string;
};

async function openBuild(browser: Browser, build: Build, runName: string) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    baseURL: build.url,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable', { timeDomain: 'timeTicks' });

  await page.goto(`benchmark/infinite-${SIZE}?autoMount=0`, {
    waitUntil: 'load',
  });
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
  expect(info.grid, `the page of ${build.id}`).toBe('infinite');
  if (!ALLOW_DEV && (info.env !== 'production' || info.dev !== false)) {
    throw new Error(
      `${build.id} (${build.url}) is a ${info.env} build with __DEV__=${info.dev} - ` +
        `serve a production build (npm run benchmark:build, then benchmark:serve) ` +
        `or set BENCH_ALLOW_DEV=1 to try the spec anyway.`,
    );
  }
  const ctx: RunContext = { build, page, cdp, browser, runName };
  return { ctx, info, errors, close: () => context.close() };
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

async function mountAndSettle(ctx: RunContext) {
  await ctx.page.evaluate(() => window.__bench!.mount());
  await settle(ctx.page, 600);
}

async function setThrottle(ctx: RunContext, on: boolean) {
  if (CPU_THROTTLE > 1) {
    await ctx.cdp.send('Emulation.setCPUThrottlingRate', {
      rate: on ? CPU_THROTTLE : 1,
    });
  }
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

async function getBodyCenter(page: Page) {
  const body = await page.evaluate(() => window.__bench!.getBodyRect());
  return {
    x: Math.round(body.left + body.width / 2),
    y: Math.round(body.top + body.height / 2),
  };
}

/** the gestures of the grid comparison: real input, same for both builds */
async function scrollGesture(ctx: RunContext, axis: 'vertical' | 'horizontal') {
  const { x, y } = await getBodyCenter(ctx.page);
  await ctx.page.mouse.move(x, y);
  if (axis === 'vertical') {
    await ctx.cdp.send('Input.synthesizeScrollGesture', {
      x,
      y,
      yDistance: -SCROLL_DISTANCE,
      speed: SCROLL_SPEED,
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
      speed: Math.min(SCROLL_SPEED, 4000),
      gestureSourceType: 'mouse',
      preventFling: true,
    });
  }
}

/** what the gesture must have done - the same for both builds */
async function expectScrolled(
  ctx: RunContext,
  axis: 'vertical' | 'horizontal',
) {
  const scroll = await ctx.page.evaluate(() =>
    window.__bench!.getScrollPosition(),
  );
  if (axis === 'vertical') {
    expect(scroll.scrollTop).toBeGreaterThan(SCROLL_DISTANCE * 0.9);
  }
}

// ---------------------------------------------------------------------------
// where the time goes, from a trace: every thread of the frame pipeline
// ---------------------------------------------------------------------------

/**
 * Heavier than the frame pass on purpose: top-level tasks of every thread,
 * plus the paint/raster events. Used in its own pass (the "-cost"
 * scenarios), so its overhead never distorts the frame outcomes.
 */
const COST_TRACE_CATEGORIES = [
  'toplevel',
  'devtools.timeline',
  'disabled-by-default-devtools.timeline',
  'cc',
  'gpu',
  'viz',
  'blink.user_timing',
];

type ThreadGroup = 'main' | 'compositor' | 'workers' | 'gpu' | 'viz';

function getThreadGroups(trace: Trace) {
  const processNames = new Map<number, string>();
  const threadNames = new Map<string, string>();
  for (const e of trace.events) {
    if (e.ph !== 'M') {
      continue;
    }
    if (e.name === 'process_name') {
      processNames.set(e.pid, String(e.args?.name ?? ''));
    } else if (e.name === 'thread_name') {
      threadNames.set(`${e.pid}:${e.tid}`, String(e.args?.name ?? ''));
    }
  }
  const groupOf = (e: TraceEvent): ThreadGroup | null => {
    const thread = threadNames.get(`${e.pid}:${e.tid}`) ?? '';
    if (e.pid === trace.pid) {
      if (e.tid === trace.tid) {
        return 'main';
      }
      if (thread === 'Compositor') {
        return 'compositor';
      }
      // with out-of-process raster (the default), the renderer's part of
      // raster runs on the thread pool, the raster itself in the GPU process
      if (
        thread.startsWith('CompositorTileWorker') ||
        thread.startsWith('ThreadPoolForegroundWorker')
      ) {
        return 'workers';
      }
      return null;
    }
    const process = processNames.get(e.pid) ?? '';
    if (/gpu/i.test(process)) {
      if (thread === 'CrGpuMain') {
        return 'gpu';
      }
      if (thread === 'VizCompositorThread') {
        return 'viz';
      }
    }
    return null;
  };
  return groupOf;
}

/** total time covered by the intervals (overlaps - nested tasks - once) */
function unionDuration(intervals: [number, number][]) {
  intervals.sort((a, b) => a[0] - b[0]);
  let total = 0;
  let end = -Infinity;
  for (const [s, e] of intervals) {
    if (e <= end) {
      continue;
    }
    total += e - Math.max(s, end);
    end = e;
  }
  return total;
}

function getCostStats(trace: Trace, fromMark: string, toMark: string) {
  const from = getMark(trace, fromMark);
  const to = getMark(trace, toMark);
  const groupOf = getThreadGroups(trace);

  const busy: Record<ThreadGroup, [number, number][]> = {
    main: [],
    compositor: [],
    workers: [],
    gpu: [],
    viz: [],
  };
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};
  const MAIN_EVENTS = new Set(['Paint', 'PrePaint', 'Layerize', 'Commit']);

  for (const e of trace.events) {
    if (e.ph !== 'X' || e.dur == null) {
      continue;
    }
    const start = Math.max(e.ts, from);
    const end = Math.min(e.ts + e.dur, to);
    if (end <= start) {
      continue;
    }
    const group = groupOf(e);
    if (!group) {
      continue;
    }
    if (e.cat.split(',').includes('toplevel')) {
      busy[group].push([start, end]);
    }
    if (group === 'main' && MAIN_EVENTS.has(e.name)) {
      sums[e.name] = (sums[e.name] ?? 0) + (end - start);
      counts[e.name] = (counts[e.name] ?? 0) + 1;
    }
    const raster =
      group === 'workers' &&
      (e.name === 'RasterizerTaskImpl::RunOnWorkerThread' ||
        e.name === 'RasterTask')
        ? 'rendererRaster'
        : group === 'gpu' && e.name === 'RasterDecoderImpl::DoEndRasterCHROMIUM'
          ? 'gpuRaster'
          : null;
    if (raster) {
      sums[raster] = (sums[raster] ?? 0) + (end - start);
      counts[raster] = (counts[raster] ?? 0) + 1;
    }
  }
  const ms = (us: number) => us / 1000;
  const busyMs = Object.fromEntries(
    Object.entries(busy).map(([group, intervals]) => [
      group,
      ms(unionDuration(intervals)),
    ]),
  ) as Record<ThreadGroup, number>;

  return {
    mainBusyMs: busyMs.main,
    compositorBusyMs: busyMs.compositor,
    workersBusyMs: busyMs.workers,
    gpuBusyMs: busyMs.gpu,
    vizBusyMs: busyMs.viz,
    allBusyMs:
      busyMs.main +
      busyMs.compositor +
      busyMs.workers +
      busyMs.gpu +
      busyMs.viz,
    paintMs: ms((sums.Paint ?? 0) + (sums.PrePaint ?? 0)),
    paintCount: counts.Paint ?? 0,
    layerizeCommitMs: ms((sums.Layerize ?? 0) + (sums.Commit ?? 0)),
    rendererRasterMs: ms(sums.rendererRaster ?? 0),
    rendererRasterCount: counts.rendererRaster ?? 0,
    gpuRasterMs: ms(sums.gpuRaster ?? 0),
  };
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
const count = (key: string, label: string): MetricDef => ({
  key,
  label,
  unit: '',
  better: 'lower',
});

const gestureLabel = (axis: 'vertical' | 'horizontal') =>
  axis === 'vertical'
    ? `wheel-scroll down ${SCROLL_DISTANCE}px at ${SCROLL_SPEED}px/s`
    : `wheel-scroll right/left over all columns, 4 sweeps at ${Math.min(
        SCROLL_SPEED,
        4000,
      )}px/s`;

async function prepare(ctx: RunContext) {
  await mountAndSettle(ctx);
  const { x, y } = await getBodyCenter(ctx.page);
  await ctx.page.mouse.move(x, y);
  await collectGarbage(ctx.cdp);
  await settle(ctx.page, 200);
}

function framesScenario(axis: 'vertical' | 'horizontal'): Scenario {
  return {
    id: `scroll-${axis}`,
    description:
      `The ${gestureLabel(axis)} (Input.synthesizeScrollGesture), with light tracing: ` +
      'frame outcomes from the compositor (PipelineReporter), rAF intervals and Long Animation Frames from the page, main-thread time from CDP.',
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
      ms('p95FrameMs', 'p95 rAF frame interval'),
      ms('maxFrameMs', 'Worst rAF frame interval'),
      {
        key: 'longFramesPct',
        label: 'rAF intervals > 25ms',
        unit: '%',
        better: 'lower',
      },
      ms('loafBlockingMs', 'Long animation frames: total blocking'),
      ms('scriptMs', 'Main thread: scripting'),
      ms('layoutMs', 'Main thread: layout'),
      ms('styleMs', 'Main thread: style recalc'),
      ms('taskMs', 'Main thread: all tasks'),
    ],
    async run(ctx) {
      const { page, cdp } = ctx;
      await prepare(ctx);

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
          await scrollGesture(ctx, axis);
          return page.evaluate(() => {
            const res = window.__bench!.stopFrameRecorder();
            performance.mark('bench:end:scroll');
            return res;
          });
        },
      );
      const m1 = await getMetrics(cdp);
      await setThrottle(ctx, false);
      await expectScrolled(ctx, axis);

      const intervals: number[] = [];
      for (let i = 1; i < record.frames.length; i++) {
        intervals.push(record.frames[i] - record.frames[i - 1]);
      }
      const frameStats = getFrameStats(
        trace,
        'bench:start:scroll',
        'bench:end:scroll',
      );
      const { taskMs, scriptMs, layoutMs, styleMs } = metricsDelta(m0, m1);
      return {
        presentedAllPct: frameStats.presentedAllPct,
        partialPct: frameStats.partialPct,
        droppedPct: frameStats.droppedPct,
        p95FrameMs: percentile(intervals, 95),
        maxFrameMs: Math.max(...intervals),
        longFramesPct:
          (intervals.filter((i) => i > 25).length / intervals.length) * 100,
        loafBlockingMs: record.loaf.reduce(
          (sum, l) => sum + l.blockingDuration,
          0,
        ),
        scriptMs,
        layoutMs,
        styleMs,
        taskMs,
      };
    },
  };
}

function costScenario(axis: 'vertical' | 'horizontal'): Scenario {
  return {
    id: `scroll-${axis}-cost`,
    description:
      `The same ${gestureLabel(axis)}, traced in detail (its own pass - the tracing overhead is the same for both builds, but it is kept out of the frame outcomes): ` +
      'busy time of every thread of the frame pipeline (top-level tasks, overlaps counted once) - renderer main, compositor, renderer workers, GPU main, viz - and the paint / raster work in it. With out-of-process raster (the default) the raster itself runs on the GPU process main thread.',
    metrics: [
      ms('allBusyMs', 'All pipeline threads: busy'),
      ms('mainBusyMs', 'Renderer main thread: busy'),
      ms('compositorBusyMs', 'Renderer compositor thread: busy'),
      ms('workersBusyMs', 'Renderer worker threads: busy (raster, GC, ...)'),
      ms('gpuBusyMs', 'GPU process main thread: busy'),
      ms('vizBusyMs', 'Viz compositor thread: busy'),
      ms('paintMs', 'Main thread: Paint + PrePaint'),
      count('paintCount', 'Main thread: Paint events'),
      ms('layerizeCommitMs', 'Main thread: Layerize + Commit'),
      ms('rendererRasterMs', 'Renderer raster tasks'),
      count('rendererRasterCount', 'Renderer raster tasks: count'),
      ms('gpuRasterMs', 'GPU process: raster (DoEndRasterCHROMIUM)'),
    ],
    async run(ctx) {
      const { page } = ctx;
      await prepare(ctx);

      await setThrottle(ctx, true);
      const { trace } = await traced(ctx, COST_TRACE_CATEGORIES, async () => {
        await page.evaluate(() => performance.mark('bench:start:scroll'));
        await scrollGesture(ctx, axis);
        // let the last frame of the gesture through the pipeline
        await settle(page, 50);
        await page.evaluate(() => performance.mark('bench:end:scroll'));
      });
      await setThrottle(ctx, false);
      await expectScrolled(ctx, axis);

      return getCostStats(trace, 'bench:start:scroll', 'bench:end:scroll');
    },
  };
}

const SCENARIOS: Scenario[] = [
  framesScenario('vertical'),
  costScenario('vertical'),
  framesScenario('horizontal'),
  costScenario('horizontal'),
];

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------

type Samples = Record<string, Record<string, number>[]>;

function fmt(value: number, unit: string) {
  if (!Number.isFinite(value)) {
    return '-';
  }
  const digits = Math.abs(value) >= 100 || unit === '' ? 0 : 1;
  return `${value.toFixed(digits)}${unit && unit !== '' ? ` ${unit}` : ''}`;
}

/**
 * candidate vs baseline, for one metric: the ratio of medians and its 95%
 * bootstrap interval - or, when the baseline median is 0 (0% dropped
 * frames...), the difference of medians and its interval
 */
function compareMetric(metric: MetricDef, samples: Samples) {
  const a = samples[BASELINE.id].map((s) => s[metric.key]);
  const b = samples[CANDIDATE.id].map((s) => s[metric.key]);
  const ma = median(a.filter(Number.isFinite));
  const mb = median(b.filter(Number.isFinite));
  const useRatio = ma !== 0 && Number.isFinite(ma);
  const [lo, hi] = useRatio ? bootstrapRatioCI(a, b) : bootstrapDiffCI(a, b);
  const neutral = useRatio ? 1 : 0;
  const significant = lo > neutral || hi < neutral;
  const candidateHigher = lo > neutral;
  const candidateBetter =
    significant && (metric.better === 'lower') !== candidateHigher;
  return {
    a,
    b,
    ma,
    mb,
    change: useRatio
      ? `×${(mb / ma).toFixed(2)} [${lo.toFixed(2)}, ${hi.toFixed(2)}]`
      : `${fmt(mb - ma, metric.unit)} [${fmt(lo, metric.unit)}, ${fmt(
          hi,
          metric.unit,
        )}]`,
    verdict: !significant
      ? 'no significant difference'
      : candidateBetter
        ? `**${CANDIDATE.id} better**`
        : `**${BASELINE.id} better**`,
  };
}

function scenarioTable(scenario: Scenario, samples: Samples) {
  const lines = [
    `| metric | ${BASELINE.id} (baseline) | ${CANDIDATE.id} | ${CANDIDATE.id} vs ${BASELINE.id} (95% CI) | |`,
    '|---|---:|---:|---:|---|',
  ];
  for (const metric of scenario.metrics) {
    const c = compareMetric(metric, samples);
    lines.push(
      `| ${metric.label} | ${fmt(c.ma, metric.unit)} ± ${fmt(
        stddev(c.a),
        metric.unit,
      )} | ${fmt(c.mb, metric.unit)} ± ${fmt(stddev(c.b), metric.unit)} | ${
        c.change
      } | ${c.verdict} |`,
    );
  }
  return lines.join('\n');
}

type Stored = {
  environment?: Record<string, unknown>;
  setup?: Record<string, unknown>;
  results: Record<string, { description: string; samples: Samples }>;
};

function readStored(): Stored {
  const file = path.join(RESULTS_DIR, 'results.json');
  return fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf8'))
    : { results: {} };
}

function writeStored(update: (stored: Stored) => void) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const stored = readStored();
  update(stored);
  fs.writeFileSync(
    path.join(RESULTS_DIR, 'results.json'),
    JSON.stringify(stored, null, 2),
  );

  const report = [
    `# ${CANDIDATE.id} vs ${BASELINE.id} (baseline)`,
    '',
    '```json',
    JSON.stringify({ ...stored.environment, ...stored.setup }, null, 2),
    '```',
    '',
    `Medians ± standard deviation of ${RUNS} runs per build (after ${WARMUP} warmup), ` +
      'alternating which build goes first. "×" is the ratio of the medians, ' +
      `${CANDIDATE.id} / ${BASELINE.id}, with its 95% bootstrap interval; when the ` +
      'baseline median is 0 the difference of medians is shown instead. A build is ' +
      'named better only when the interval excludes no change.',
  ];
  for (const scenario of SCENARIOS) {
    const result = stored.results[scenario.id];
    if (!result) {
      continue;
    }
    report.push(
      '',
      `## ${scenario.id}`,
      '',
      result.description,
      '',
      scenarioTable(scenario, result.samples),
    );
  }
  fs.writeFileSync(path.join(RESULTS_DIR, 'report.md'), report.join('\n'));
}

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------

test.describe.configure({ mode: 'serial' });

test.describe(`${CANDIDATE.id} vs ${BASELINE.id} (${SIZE} rows)`, () => {
  test('setup: both builds are production builds of the same pages, rendering the same', async ({
    browser,
  }) => {
    const load = os.loadavg()[0];
    if (MAX_LOAD > 0 && load > MAX_LOAD) {
      throw new Error(
        `The 1-minute load average is ${load.toFixed(1)} (BENCH_MAX_LOAD ${MAX_LOAD}): ` +
          'timings would be noise. Wait for a quiet machine, or raise BENCH_MAX_LOAD.',
      );
    }

    const setup: Record<string, any> = {};
    for (const build of BUILDS) {
      const { ctx, info, errors, close } = await openBuild(
        browser,
        build,
        `setup-${build.id}`,
      );
      try {
        await mountAndSettle(ctx);
        const [selector, property] = (EXPECT_DIFFERENT_STYLE || ':').split(
          /:(?=[^:]*$)/,
        );
        setup[build.id] = {
          url: build.url,
          version: info.version,
          rowCount: info.rowCount,
          checksum: await ctx.page.evaluate(() =>
            window.__bench!.getChecksum(),
          ),
          texts: await ctx.page.evaluate(() =>
            window.__bench!.getVisibleTexts(18),
          ),
          bodyHeight: (
            await ctx.page.evaluate(() => window.__bench!.getBodyRect())
          ).height,
          style: EXPECT_DIFFERENT_STYLE
            ? await ctx.page.evaluate(
                ([selector, property]) => {
                  const el = document.querySelector(selector);
                  return el
                    ? getComputedStyle(el).getPropertyValue(property)
                    : null;
                },
                [selector, property],
              )
            : undefined,
        };
        expect(errors, `page errors in ${build.id}`).toEqual([]);
      } finally {
        await close();
      }
    }

    const [a, b] = BUILDS.map((build) => setup[build.id]);
    expect(b.checksum, 'data checksum').toBe(a.checksum);
    expect(b.rowCount).toBe(a.rowCount);
    expect(b.texts, 'visible texts').toEqual(a.texts);
    expect(b.bodyHeight, 'body height').toBe(a.bodyHeight);
    if (EXPECT_DIFFERENT_STYLE) {
      expect(
        a.style,
        `${EXPECT_DIFFERENT_STYLE} of ${BASELINE.id}`,
      ).toBeTruthy();
      expect(
        b.style,
        `${EXPECT_DIFFERENT_STYLE}: the builds should differ in it`,
      ).not.toBe(a.style);
    }

    writeStored((stored) => {
      stored.environment = {
        runId: RUN_ID,
        date: new Date().toISOString(),
        chrome: browser.version(),
        headless: !!test.info().project.use.headless,
        os: `${os.type()} ${os.release()} ${os.arch()}`,
        cpu: `${os.cpus()[0]?.model ?? 'unknown'} × ${os.cpus().length}`,
        loadAverageAtStart: Number(load.toFixed(2)),
        viewport: `${VIEWPORT.width}×${VIEWPORT.height}`,
        size: SIZE,
        cpuThrottle: CPU_THROTTLE,
        runs: RUNS,
        warmup: WARMUP,
      };
      stored.setup = Object.fromEntries(
        BUILDS.map((build) => [
          build.id,
          {
            url: setup[build.id].url,
            version: setup[build.id].version,
            ...(EXPECT_DIFFERENT_STYLE
              ? { [EXPECT_DIFFERENT_STYLE]: setup[build.id].style }
              : {}),
          },
        ]),
      );
    });
  });

  for (const scenario of SCENARIOS) {
    test(scenario.id, async ({ browser }) => {
      test.skip(
        !!ONLY && !ONLY.includes(scenario.id),
        'not in BENCH_SCENARIOS',
      );
      test.setTimeout((WARMUP + RUNS) * BUILDS.length * 120_000);

      const samples: Samples = { [BASELINE.id]: [], [CANDIDATE.id]: [] };
      for (let i = 0; i < WARMUP + RUNS; i++) {
        // the order is swapped every run, so drift affects both builds
        const order = i % 2 === 0 ? BUILDS : [...BUILDS].reverse();
        for (const build of order) {
          const runName = `${scenario.id}-${build.id}-${i}`;
          const { ctx, errors, close } = await openBuild(
            browser,
            build,
            runName,
          );
          try {
            const sample = await scenario.run(ctx);
            expect(errors, `page errors in ${runName}`).toEqual([]);
            const warmup = i < WARMUP;
            if (!warmup) {
              samples[build.id].push({
                ...sample,
                loadAverage: os.loadavg()[0],
              });
            }
            console.log(
              `[${scenario.id}] ${
                warmup ? 'warmup' : `run ${i - WARMUP + 1}/${RUNS}`
              } ${build.id.padEnd(10)} ${Object.entries(sample)
                .map(([k, v]) => `${k}=${Math.round(v * 10) / 10}`)
                .join(' ')}`,
            );
          } finally {
            await close();
          }
        }
      }

      writeStored((stored) => {
        stored.results[scenario.id] = {
          description: scenario.description,
          samples,
        };
      });
      console.log(
        `\n## ${scenario.id}\n\n${scenarioTable(scenario, samples)}\n`,
      );
    });
  }
});
