/**
 * Node-side helpers for grid-comparison.bench.ts: Chrome trace parsing,
 * CDP metrics, statistics and the report.
 */
import type { CDPSession } from '@playwright/test';

// ---------------------------------------------------------------------------
// Chrome trace
// ---------------------------------------------------------------------------

export type TraceEvent = {
  name: string;
  cat: string;
  ph: string;
  ts: number; // microseconds
  dur?: number;
  pid: number;
  tid: number;
  id?: string;
  id2?: { local?: string; global?: string };
  args?: any;
};

export type Trace = {
  events: TraceEvent[];
  pid: number;
  tid: number;
  /** marks by name - user timing marks (performance.mark) on the page */
  marks: Map<string, TraceEvent>;
};

/** main-thread trace categories - used for latency measurements */
export const LATENCY_TRACE_CATEGORIES = [
  'devtools.timeline',
  'disabled-by-default-devtools.timeline',
  'disabled-by-default-devtools.timeline.frame',
  'blink.user_timing',
  'v8.execute',
];

/**
 * frame-pipeline categories only - kept light on purpose, used while
 * scrolling, where tracing overhead would distort what is measured
 */
export const FRAME_TRACE_CATEGORIES = [
  'disabled-by-default-devtools.timeline.frame',
  'blink.user_timing',
];

export function parseTrace(buffer: Buffer): Trace {
  const json = JSON.parse(buffer.toString('utf8'));
  const events: TraceEvent[] = Array.isArray(json)
    ? json
    : json.traceEvents ?? [];

  // the page's renderer main thread is where our marks are
  const marks = new Map<string, TraceEvent>();
  let pid = -1;
  let tid = -1;
  for (const e of events) {
    if (
      e.cat?.includes('blink.user_timing') &&
      typeof e.name === 'string' &&
      e.name.startsWith('bench:')
    ) {
      // performance.mark() shows up as an instant event
      if (e.ph === 'R' || e.ph === 'I' || e.ph === 'i' || e.ph === 'n') {
        if (!marks.has(e.name)) {
          marks.set(e.name, e);
        }
        pid = e.pid;
        tid = e.tid;
      }
    }
  }
  if (pid === -1) {
    throw new Error('No bench:* user timing marks found in the trace');
  }

  events.sort((a, b) => a.ts - b.ts);
  return { events, pid, tid, marks };
}

export function getMark(trace: Trace, name: string): number {
  const mark = trace.marks.get(name);
  if (!mark) {
    throw new Error(
      `Mark "${name}" not found in trace. Found: ${Array.from(
        trace.marks.keys(),
      ).join(', ')}`,
    );
  }
  return mark.ts;
}

function mainThreadCompleteEvents(trace: Trace, names: Set<string>) {
  // Commit/Layout/FunctionCall etc are complete ('X') events
  return trace.events.filter(
    (e) =>
      e.pid === trace.pid &&
      e.tid === trace.tid &&
      e.ph === 'X' &&
      names.has(e.name),
  );
}

const COMMIT = new Set(['Commit']);

/** trace timestamp (µs) of a performance.now() value (ms) of the same page */
function toTraceTs(trace: Trace, perfNow: number) {
  // every mark carries both clocks
  const mark = trace.marks.values().next().value as TraceEvent;
  const markPerfNow = mark.args?.data?.startTime;
  if (typeof markPerfNow !== 'number') {
    throw new Error('Trace marks have no args.data.startTime');
  }
  return mark.ts + (perfNow - markPerfNow) * 1000;
}

function firstCommitEndAfter(trace: Trace, ts: number) {
  const commit = mainThreadCompleteEvents(trace, COMMIT).find(
    (e) => e.ts >= ts,
  );
  return commit ? commit.ts + (commit.dur ?? 0) : null;
}

/**
 * Latency from the start mark to the end of the first frame committed after
 * the DOM showed the expected content - i.e. when the user can see it.
 */
export function getVisibleLatency(trace: Trace, label: string) {
  const start = getMark(trace, `bench:start:${label}`);
  const domReady = getMark(trace, `bench:dom-ready:${label}`);
  const end = firstCommitEndAfter(trace, domReady);
  if (end == null) {
    throw new Error(`No Commit after bench:dom-ready:${label}`);
  }
  return {
    visible: (end - start) / 1000,
    domReady: (domReady - start) / 1000,
  };
}

/**
 * Latency from the start mark to the end of the first frame committed after
 * the grid's last DOM mutation (recorded in the page, see harness.ts
 * getSettleInfo) - catches grids that keep rendering after the first correct
 * frame (remaining rows/columns, async passes).
 *
 * Why not js-framework-benchmark's rule (commit after the last
 * rAF/timer/layout/function call)? Grids schedule sub-millisecond debounce
 * timers (e.g. 500ms) that do no visible work, and that rule counts them.
 */
export function getSettledLatency(
  trace: Trace,
  label: string,
  lastMutationAt: number,
) {
  const start = getMark(trace, `bench:start:${label}`);
  const domReady = getMark(trace, `bench:dom-ready:${label}`);
  const ts = Math.max(domReady, toTraceTs(trace, lastMutationAt));
  const end = firstCommitEndAfter(trace, ts);
  if (end == null) {
    throw new Error(`No Commit after the last mutation of ${label}`);
  }
  return (end - start) / 1000;
}

/**
 * Compositor frame outcomes, from `PipelineReporter` trace events of the
 * page's renderer, in the [fromMark, toMark] window.
 *   presented-all: frame shown, with the main thread's update
 *   partial: frame shown without the main thread's update (the compositor
 *            scrolled what it had - stale/blank areas can show)
 *   dropped: no frame at all for that vsync
 */
export function getFrameStats(trace: Trace, fromMark: string, toMark: string) {
  const from = getMark(trace, fromMark);
  const to = getMark(trace, toMark);
  const seen = new Set<string>();
  let all = 0;
  let partial = 0;
  let dropped = 0;
  let missingContent = 0;
  for (const e of trace.events) {
    if (
      e.name !== 'PipelineReporter' ||
      e.pid !== trace.pid ||
      (e.ph !== 'b' && e.ph !== 'X') ||
      e.ts < from ||
      e.ts > to
    ) {
      continue;
    }
    const report = e.args?.chrome_frame_reporter;
    if (!report) {
      continue;
    }
    const key = `${e.id ?? e.id2?.local ?? ''}:${e.ts}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    const state = String(report.state ?? '');
    if (state.includes('DROPPED')) {
      dropped++;
    } else if (state.includes('PARTIAL')) {
      partial++;
    } else if (state.includes('PRESENTED')) {
      all++;
    }
    if (report.has_missing_content) {
      missingContent++;
    }
  }
  const total = all + partial + dropped;
  return {
    frames: total,
    presentedAllPct: total ? (all / total) * 100 : NaN,
    partialPct: total ? (partial / total) * 100 : NaN,
    droppedPct: total ? (dropped / total) * 100 : NaN,
    missingContentFrames: missingContent,
  };
}

// ---------------------------------------------------------------------------
// CDP
// ---------------------------------------------------------------------------

export type CdpMetrics = Record<string, number>;

export async function getMetrics(cdp: CDPSession): Promise<CdpMetrics> {
  const { metrics } = await cdp.send('Performance.getMetrics');
  const res: CdpMetrics = {};
  for (const m of metrics) {
    res[m.name] = m.value;
  }
  return res;
}

/** main-thread time spent between two Performance.getMetrics snapshots, in ms */
export function metricsDelta(before: CdpMetrics, after: CdpMetrics) {
  const d = (name: string) => ((after[name] ?? 0) - (before[name] ?? 0)) * 1000;
  return {
    taskMs: d('TaskDuration'),
    scriptMs: d('ScriptDuration'),
    layoutMs: d('LayoutDuration'),
    styleMs: d('RecalcStyleDuration'),
    layoutCount: (after.LayoutCount ?? 0) - (before.LayoutCount ?? 0),
  };
}

export async function collectGarbage(cdp: CDPSession) {
  await cdp.send('HeapProfiler.collectGarbage');
  await cdp.send('HeapProfiler.collectGarbage');
}

// ---------------------------------------------------------------------------
// statistics
// ---------------------------------------------------------------------------

export function median(values: number[]) {
  return percentile(values, 50);
}

export function percentile(values: number[], p: number) {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) {
    return NaN;
  }
  const idx = ((v.length - 1) * p) / 100;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return v[lo] + (v[hi] - v[lo]) * (idx - lo);
}

export function mean(values: number[]) {
  const v = values.filter((x) => Number.isFinite(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
}

export function stddev(values: number[]) {
  const v = values.filter((x) => Number.isFinite(x));
  if (v.length < 2) {
    return NaN;
  }
  const m = mean(v);
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1));
}

/**
 * 95% bootstrap confidence interval of median(b) / median(a)
 * (seeded, so the report is reproducible for the same samples)
 */
export function bootstrapRatioCI(a: number[], b: number[], iterations = 2000) {
  const A = a.filter(Number.isFinite);
  const B = b.filter(Number.isFinite);
  if (A.length < 2 || B.length < 2) {
    return [NaN, NaN] as const;
  }
  let seed = 1234567;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const resample = (v: number[]) =>
    v.map(() => v[Math.floor(random() * v.length)]);
  const ratios: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const ma = median(resample(A));
    const mb = median(resample(B));
    if (ma !== 0) {
      ratios.push(mb / ma);
    }
  }
  return [percentile(ratios, 2.5), percentile(ratios, 97.5)] as const;
}

/**
 * 95% bootstrap confidence interval of median(b) - median(a) - for metrics
 * where a ratio means nothing (a median of 0, e.g. 0% blank samples)
 */
export function bootstrapDiffCI(a: number[], b: number[], iterations = 2000) {
  const A = a.filter(Number.isFinite);
  const B = b.filter(Number.isFinite);
  if (A.length < 2 || B.length < 2) {
    return [NaN, NaN] as const;
  }
  let seed = 7654321;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const resample = (v: number[]) =>
    v.map(() => v[Math.floor(random() * v.length)]);
  const diffs: number[] = [];
  for (let i = 0; i < iterations; i++) {
    diffs.push(median(resample(B)) - median(resample(A)));
  }
  return [percentile(diffs, 2.5), percentile(diffs, 97.5)] as const;
}

// ---------------------------------------------------------------------------
// results & report
// ---------------------------------------------------------------------------

export type GridName = 'mui' | 'ag-grid' | 'tanstack' | 'infinite';
/** every grid other than Infinite Table - what Infinite is compared against */
export type OtherGridName = Exclude<GridName, 'infinite'>;

/** the order the grids are listed in, everywhere */
export const GRID_NAMES: GridName[] = [
  'mui',
  'ag-grid',
  'tanstack',
  'infinite',
];
export const OTHER_GRID_NAMES = GRID_NAMES.filter(
  (grid): grid is OtherGridName => grid !== 'infinite',
);

/** short names, for table headers and logs */
export const GRID_LABELS: Record<GridName, string> = {
  mui: 'MUI X',
  'ag-grid': 'AG Grid',
  tanstack: 'TanStack',
  infinite: 'Infinite',
};
export const GRID_FULL_NAMES: Record<GridName, string> = {
  mui: 'MUI X Data Grid',
  'ag-grid': 'AG Grid',
  tanstack: 'TanStack Table',
  infinite: 'Infinite Table',
};

export type MetricDef = {
  key: string;
  label: string;
  unit: string;
  better: 'lower' | 'higher';
};

export type ScenarioResult = {
  scenario: string;
  description: string;
  metrics: MetricDef[];
  /** a grid that was not measured (BENCH_GRIDS) has no samples */
  samples: Partial<Record<GridName, Record<string, number>[]>>;
};

export type BenchEnvironment = {
  runId: string;
  date: string;
  chrome: string;
  headless: boolean;
  cpuThrottle: number;
  runs: number;
  warmup: number;
  os: string;
  cpu: string;
  viewport: string;
  versions: Partial<Record<GridName, string>>;
  baseURL: string;
  /**
   * height (px) of the scrolling body - the same for all the grids, to
   * within a pixel: `bodyHeightMax` is the tallest one
   */
  bodyHeight?: number;
  bodyHeightMax?: number;
  /**
   * px added to the box of each grid so the bodies have the same height -
   * e.g. to make up for the footer Infinite Table renders when it has no
   * license key, or for MUI's pagination footer
   */
  boxExtraHeight?: Partial<Record<GridName, number>>;
};

/** from Bench.calibrateScroll() - see harness.ts */
export type SizeScrollInfo = {
  /** content px per native scroll px, measured at the middle */
  ratio: number;
  /** the same, from the scroll range (linear mapping) */
  linearRatio: number;
  /** native scroll range (px) */
  scrollMax: number;
  /** id (1-based) of the last row visible when scrolled to the very end */
  lastVisibleRow: number;
  rowCount: number;
};

/** everything measured for one dataset size */
export type SizeResults = {
  size: string;
  rowCount: number;
  checksum: string | null;
  /** of the grids that were measured */
  scroll: Partial<Record<GridName, SizeScrollInfo>> | null;
  results: Record<string, ScenarioResult>;
};

function fmt(value: number, unit: string) {
  if (!Number.isFinite(value)) {
    return '–';
  }
  const digits = Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 10 ? 1 : 2;
  return `${value.toFixed(digits)}${unit ? ' ' + unit : ''}`;
}

function fmtDiff(value: number, unit: string) {
  if (!Number.isFinite(value)) {
    return '–';
  }
  return `${value > 0 ? '+' : ''}${fmt(value, unit)}`;
}

export type GridStats = {
  median: number;
  p95: number;
  sd: number;
  min: number;
  max: number;
};

/** Infinite Table against one other grid, for one metric */
export type Comparison = {
  /** Infinite / other - NaN when `useRatio` is false */
  ratio: number;
  /** Infinite − other */
  diff: number;
  /**
   * false when the other grid has zeros among its values (e.g. 0% blank
   * samples): a ratio means nothing then, and the difference is compared
   */
  useRatio: boolean;
  /** 95% bootstrap CI of the ratio (or of the difference) of the medians */
  ci: readonly [number, number];
  /** null: the CI doesn't exclude "no difference" */
  winner: GridName | null;
};

function compare(
  metric: MetricDef,
  other: OtherGridName,
  otherValues: number[],
  infiniteValues: number[],
): Comparison {
  const otherMedian = median(otherValues);
  const infiniteMedian = median(infiniteValues);
  // the ratio of medians needs the other grid's values > 0 (a resampled
  // median of 0 can't be divided by) - otherwise compare the difference of
  // medians instead
  const useRatio = otherValues.filter(Number.isFinite).every((v) => v > 0);
  const ci = useRatio
    ? bootstrapRatioCI(otherValues, infiniteValues)
    : bootstrapDiffCI(otherValues, infiniteValues);
  // "no difference" is a ratio of 1, or a difference of 0
  const same = useRatio ? 1 : 0;
  let winner: GridName | null = null;
  // only call a winner when the CI excludes "no difference"
  if (Number.isFinite(ci[0]) && (ci[1] < same || ci[0] > same)) {
    const infiniteLower = ci[1] < same;
    winner = infiniteLower === (metric.better === 'lower') ? 'infinite' : other;
  }
  return {
    ratio: useRatio ? infiniteMedian / otherMedian : NaN,
    diff: infiniteMedian - otherMedian,
    useRatio,
    ci,
    winner,
  };
}

/**
 * For every metric of a scenario: the stats of each grid that has samples,
 * and Infinite Table compared with each of the other grids.
 */
export function summarize(result: ScenarioResult) {
  return result.metrics.map((metric) => {
    const values = (grid: GridName) =>
      (result.samples[grid] ?? []).map((s) => s[metric.key]);
    const grids: Partial<Record<GridName, GridStats>> = {};
    for (const grid of GRID_NAMES) {
      const v = values(grid);
      if (v.length) {
        grids[grid] = {
          median: median(v),
          p95: percentile(v, 95),
          sd: stddev(v),
          min: Math.min(...v),
          max: Math.max(...v),
        };
      }
    }
    const vs: Partial<Record<OtherGridName, Comparison>> = {};
    if (grids.infinite) {
      for (const other of OTHER_GRID_NAMES) {
        if (grids[other]) {
          vs[other] = compare(metric, other, values(other), values('infinite'));
        }
      }
    }
    return { metric, grids, vs };
  });
}

/** the grids that have samples in a scenario, in the usual order */
function gridsOf(result: ScenarioResult) {
  return GRID_NAMES.filter((grid) => result.samples[grid]?.length);
}

function comparisonCell(c: Comparison | undefined) {
  if (!c) {
    return '–';
  }
  const value = c.useRatio ? fmt(c.ratio, '×') : fmtDiff(c.diff, '');
  const ci = c.useRatio
    ? `${fmt(c.ci[0], '')}–${fmt(c.ci[1], '')}`
    : `${fmtDiff(c.ci[0], '')} to ${fmtDiff(c.ci[1], '')}`;
  return `${value} (${ci}) ${c.winner ? `**${GRID_LABELS[c.winner]}**` : '≈'}`;
}

export function scenarioTable(result: ScenarioResult) {
  const rows = summarize(result);
  const grids = gridsOf(result);
  const others = grids.filter(
    (grid): grid is OtherGridName => grid !== 'infinite',
  );
  const compared = grids.includes('infinite') ? others : [];
  const lines = [
    `| Metric | ${grids
      .map((grid) => `${GRID_LABELS[grid]} median (sd)`)
      .join(' | ')} |${compared
      .map((grid) => ` Infinite vs ${GRID_LABELS[grid]} |`)
      .join('')}`,
    `|---|${grids.map(() => '---:').join('|')}|${compared
      .map(() => '---:|')
      .join('')}`,
  ];
  for (const r of rows) {
    const { unit } = r.metric;
    lines.push(
      `| ${r.metric.label} (${r.metric.better} is better) | ${grids
        .map((grid) => {
          const stats = r.grids[grid];
          return stats
            ? `${fmt(stats.median, unit)} (±${fmt(stats.sd, '')})`
            : '–';
        })
        .join(' | ')} |${compared
        .map((grid) => ` ${comparisonCell(r.vs[grid])} |`)
        .join('')}`,
    );
  }
  return lines.join('\n');
}

function scrollTable(scroll: Partial<Record<GridName, SizeScrollInfo>>) {
  const grids = GRID_NAMES.filter((grid) => scroll[grid]);
  const lines = [
    `| | ${grids.map((g) => GRID_LABELS[g]).join(' | ')} |`,
    `|---|${grids.map(() => '---:').join('|')}|`,
    `| Last row reachable with the scrollbar | ${grids
      .map((g) => {
        const s = scroll[g]!;
        return s.lastVisibleRow >= s.rowCount
          ? `yes (${s.lastVisibleRow.toLocaleString('en-US')})`
          : `**no** - stops at row ${s.lastVisibleRow.toLocaleString('en-US')}`;
      })
      .join(' | ')} |`,
    `| Native scroll range | ${grids
      .map((g) => `${scroll[g]!.scrollMax.toLocaleString('en-US')} px`)
      .join(' | ')} |`,
    `| Content px per scrollbar px | ${grids
      .map((g) => scroll[g]!.ratio.toFixed(3))
      .join(' | ')} |`,
  ];
  return lines.join('\n');
}

function bodyHeightLine(env: BenchEnvironment) {
  if (env.bodyHeight == null) {
    return '';
  }
  const extra = GRID_NAMES.filter((grid) => env.boxExtraHeight?.[grid]).map(
    (grid) => `${GRID_LABELS[grid]} +${env.boxExtraHeight![grid]} px`,
  );
  return (
    `\n- Grid body: ${
      env.bodyHeightMax != null && env.bodyHeightMax !== env.bodyHeight
        ? `${env.bodyHeight}-${env.bodyHeightMax} px high, with the same number of rows in view in every grid`
        : `${env.bodyHeight} px high in every grid`
    }` +
    (extra.length
      ? ` (to get there, the setup made the boxes taller: ${extra.join(', ')})`
      : '')
  );
}

/** e.g. "AG Grid 36.3.0 · Infinite Table 10.1.5" - the grids that were measured */
export function versionsLine(versions: BenchEnvironment['versions']) {
  return GRID_NAMES.filter((grid) => versions[grid])
    .map((grid) => `${GRID_FULL_NAMES[grid]} ${versions[grid]}`)
    .join(' · ');
}

export function buildReport(
  env: BenchEnvironment,
  sizes: SizeResults[],
  scenarioOrder: string[],
) {
  const out: string[] = [];
  const grids = GRID_NAMES.filter((grid) => env.versions[grid]);

  out.push(
    `# ${grids
      .map((grid) => GRID_FULL_NAMES[grid])
      .join(' vs ')} — benchmark report`,
  );
  out.push('');
  out.push(
    `- Run: \`${env.runId}\` · ${env.date}\n` +
      `- ${versionsLine(env.versions)}\n` +
      `- ${sizes
        .map(
          (s) =>
            `${s.rowCount.toLocaleString('en-US')} rows` +
            (s.checksum ? ` (data checksum \`${s.checksum}\`)` : ''),
        )
        .join(' · ')} × 20 columns, identical data for every grid\n` +
      `- Chrome ${env.chrome} · ${
        env.headless ? 'headless' : 'headed'
      } · CPU throttling ${env.cpuThrottle}× · viewport ${env.viewport}\n` +
      `- ${env.runs} measured runs per grid per scenario (+${env.warmup} warmup, discarded), interleaved, fresh browser context per run\n` +
      `- ${env.os} · ${env.cpu}\n` +
      `- Served from ${env.baseURL}` +
      bodyHeightLine(env),
  );
  out.push('');
  out.push(
    `The "Infinite vs ..." columns compare Infinite Table with one other grid: the ratio of the medians (Infinite / other, so < 1 means Infinite has the lower value), its 95% bootstrap confidence interval, and the grid that does better. A grid is only named when the interval excludes 1; "≈" means no significant difference. When the other grid has zeros among its values (e.g. 0% blank samples) a ratio means nothing, so the difference of the medians (Infinite − other) and its interval are shown instead, and a grid is only named when that interval excludes 0.`,
  );

  for (const size of sizes) {
    out.push('');
    out.push(`# ${size.rowCount.toLocaleString('en-US')} rows`);
    if (size.scroll) {
      out.push('');
      out.push(
        `Scroll range - browsers cap element sizes (Chrome ~16.7M-33.5M px, depending on the version), so a grid has to map the scrollbar onto the rows when the content is taller than that. One that doesn't can't reach its last rows: its scrolling results are for the rows it can reach, and the same wheel gesture goes over fewer rows in it.`,
      );
      out.push('');
      out.push(scrollTable(size.scroll));
    }
    const results = scenarioOrder
      .map((id) => size.results[id])
      .filter((r): r is ScenarioResult => !!r);
    for (const r of results) {
      out.push('');
      out.push(
        `## ${r.scenario} - ${size.rowCount.toLocaleString('en-US')} rows`,
      );
      out.push('');
      out.push(r.description);
      out.push('');
      out.push(scenarioTable(r));
    }
  }
  out.push('');
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// screencast analysis (runs in a browser page, not in node)
// ---------------------------------------------------------------------------

export type BlankAnalysisInput = {
  frames: string[]; // base64 jpeg
  // region to analyze, in screencast image pixels
  region: { left: number; top: number; width: number; height: number };
  rowHeight: number;
};

/**
 * Finds vertical runs of pixel rows without any text ink in the grid body,
 * per screencast frame. Rows of a rendered grid always have text, so a run
 * longer than the normal gap between two text lines means rows are missing
 * from the screen (blank area). Background colors (zebra, hover) and row
 * borders are uniform across a pixel row, so they don't count as ink.
 *
 * Must stay self-contained - it is serialized and run via page.evaluate.
 */
export async function analyzeBlankFramesInBrowser(input: BlankAnalysisInput) {
  const { frames, region, rowHeight } = input;
  const results: { blankRows: number; blankPx: number }[] = [];

  const canvas = new OffscreenCanvas(region.width, region.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  for (const frame of frames) {
    const blob = await (await fetch(`data:image/jpeg;base64,${frame}`)).blob();
    const bitmap = await createImageBitmap(blob);
    ctx.clearRect(0, 0, region.width, region.height);
    ctx.drawImage(
      bitmap,
      region.left,
      region.top,
      region.width,
      region.height,
      0,
      0,
      region.width,
      region.height,
    );
    bitmap.close();
    const { data } = ctx.getImageData(0, 0, region.width, region.height);

    const inkRows: boolean[] = new Array(region.height);
    const buckets = new Uint32Array(32);
    for (let y = 0; y < region.height; y++) {
      buckets.fill(0);
      const rowStart = y * region.width * 4;
      for (let x = 0; x < region.width; x++) {
        const i = rowStart + x * 4;
        const lum =
          (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
        buckets[Math.min(31, Math.floor(lum / 8))]++;
      }
      let bg = 0;
      for (let b = 1; b < 32; b++) {
        if (buckets[b] > buckets[bg]) {
          bg = b;
        }
      }
      const bgLum = bg * 8 + 4;
      let ink = 0;
      for (let x = 0; x < region.width; x++) {
        const i = rowStart + x * 4;
        const lum =
          (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
        if (Math.abs(lum - bgLum) > 70) {
          ink++;
        }
      }
      // a few ink pixels can be column separators - text gives many more
      inkRows[y] = ink > 12;
    }

    // runs of non-ink pixel rows
    const runs: { start: number; length: number }[] = [];
    let runStart = -1;
    for (let y = 0; y <= region.height; y++) {
      const isInk = y === region.height ? true : inkRows[y];
      if (!isInk && runStart === -1) {
        runStart = y;
      } else if (isInk && runStart !== -1) {
        runs.push({ start: runStart, length: y - runStart });
        runStart = -1;
      }
    }
    const interior = runs.filter(
      (r) => r.start > 0 && r.start + r.length < region.height,
    );
    const sorted = interior.map((r) => r.length).sort((a, b) => a - b);
    // normal gap between the text of two adjacent rows
    const normalGap = sorted.length
      ? sorted[Math.floor(sorted.length / 2)]
      : rowHeight;

    let blankRows = 0;
    for (const r of runs) {
      const isEdge = r.start === 0 || r.start + r.length >= region.height;
      const missing = isEdge
        ? Math.floor((r.length - normalGap / 2) / rowHeight)
        : Math.round((r.length - normalGap) / rowHeight);
      if (missing > 0) {
        blankRows += missing;
      }
    }
    // a frame with no text at all is fully blank
    if (
      !runs.length ||
      (runs.length === 1 && runs[0].length === region.height)
    ) {
      blankRows = Math.floor(region.height / rowHeight);
    }
    results.push({
      blankRows,
      blankPx: Math.min(region.height, blankRows * rowHeight),
    });
  }
  return results;
}
