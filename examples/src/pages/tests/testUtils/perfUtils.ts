import fs from 'node:fs';
import path from 'node:path';

export interface PerfMetrics {
  scriptingTime: number; // in milliseconds
  renderingTime: number;
  paintingTime: number;
  totalTime: number;
}

export interface PerfBaseline {
  scriptingTime: number;
  renderingTime: number;
  paintingTime: number;
  totalTime: number;
}

export const DEFAULT_THRESHOLD = 40;

export interface PerfBaselines {
  [testName: string]: PerfBaseline;
}

export const isCI = !!process.env.CI;

// Get developer name for local baseline file
function getDevName(): string {
  // Allow override via env var
  if (process.env.PERF_DEV_NAME) {
    return process.env.PERF_DEV_NAME;
  }
  // Try git config user.name
  try {
    const { execSync } = require('child_process');
    const gitUser = execSync('git config user.name', {
      encoding: 'utf-8',
    }).trim();
    // Convert to lowercase and replace spaces/special chars with dashes
    return gitUser
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
  } catch {
    return 'local';
  }
}

export const devName = getDevName();

// Use separate baseline files for local (per-dev) and CI
const BASELINES_PATH = path.resolve(
  __dirname,
  isCI
    ? '../../../../perf-baselines.ci.json'
    : `../../../../perf-baselines.${devName}.json`,
);

/**
 * Parse a Chrome trace JSON file and extract performance metrics
 * Uses the same event categorization as Chrome DevTools Performance panel
 */
export function parseTraceFile(tracePath: string): PerfMetrics {
  const traceContent = fs.readFileSync(tracePath, 'utf-8');
  const trace = JSON.parse(traceContent);

  // Chrome traces can be either an array or an object with traceEvents
  const events = Array.isArray(trace) ? trace : trace.traceEvents || [];

  // Find the main renderer thread
  let mainPid: number | null = null;
  let mainTid: number | null = null;
  for (const event of events) {
    if (event.name === 'thread_name' && event.args?.name === 'CrRendererMain') {
      mainPid = event.pid;
      mainTid = event.tid;
      break;
    }
  }

  // Scripting events (as categorized by Chrome DevTools)
  // Based on Chrome DevTools source: TimelineModel.js
  const scriptingEvents = new Set([
    'EvaluateScript',
    'FunctionCall',
    'GCEvent',
    'MajorGC',
    'MinorGC',
    'TimerFire',
    'EventDispatch',
    'XHRReadyStateChange',
    'XHRLoad',
    'CompileScript',
    'CompileCode',
    'CompileModule',
    'OptimizeCode',
    'RunMicrotasks',
    'FireIdleCallback',
    'FireAnimationFrame',
    'ParseHTML',
    'ParseAuthorStyleSheet',
    'v8.compile',
    'v8.compileModule',
    'v8.optimize',
    'v8.wasm.streamFromResponseCallback',
    'v8.wasm.compiledModule',
    'v8.wasm.cachedModule',
    'v8.wasm.moduleCacheHit',
    'v8.wasm.moduleCacheInvalid',
    'StreamingCompileScript',
    'StreamingCompileScriptWaiting',
    'StreamingCompileScriptParsing',
  ]);

  // Rendering events
  const renderingEvents = new Set([
    'Layout',
    'RecalculateStyles',
    'UpdateLayoutTree',
    'HitTest',
    'ScheduleStyleRecalculation',
    'InvalidateLayout',
    'ScrollLayer',
    'PrePaint',
    'Layerize',
  ]);

  // Painting events
  const paintingEvents = new Set([
    'Paint',
    'PaintImage',
    'PaintSetup',
    'CompositeLayers',
    'Rasterize',
    'RasterTask',
    'DecodeImage',
    'ResizeImage',
    'UpdateLayer',
    'UpdateLayerTree',
    'Commit',
    'GPUTask',
  ]);

  // Collect events by category with their time ranges
  interface TimeRange {
    start: number;
    end: number;
  }

  const scriptingRanges: TimeRange[] = [];
  const renderingRanges: TimeRange[] = [];
  const paintingRanges: TimeRange[] = [];

  // Track trace bounds for total time calculation (only from main renderer thread)
  let traceStart = Infinity;
  let traceEnd = -Infinity;

  for (const event of events) {
    // Only process events on main renderer thread
    if (event.pid !== mainPid || event.tid !== mainTid) continue;

    // Track trace bounds from main thread events
    if (event.ts !== undefined && event.ts > 0) {
      traceStart = Math.min(traceStart, event.ts);
      if (event.dur) {
        traceEnd = Math.max(traceEnd, event.ts + event.dur);
      } else {
        traceEnd = Math.max(traceEnd, event.ts);
      }
    }

    // Skip events without duration for category calculation
    if (!event.dur) continue;

    const name = event.name;
    const range: TimeRange = {
      start: event.ts,
      end: event.ts + event.dur,
    };

    if (scriptingEvents.has(name)) {
      scriptingRanges.push(range);
    } else if (renderingEvents.has(name)) {
      renderingRanges.push(range);
    } else if (paintingEvents.has(name)) {
      paintingRanges.push(range);
    }
  }

  // Calculate total time for each category by merging overlapping ranges
  // This avoids double-counting nested events
  function calculateMergedTime(ranges: TimeRange[]): number {
    if (ranges.length === 0) return 0;

    // Sort by start time
    const sorted = [...ranges].sort((a, b) => a.start - b.start);

    // Merge overlapping ranges
    const merged: TimeRange[] = [];
    let current = { ...sorted[0] };

    for (let i = 1; i < sorted.length; i++) {
      const range = sorted[i];
      if (range.start <= current.end) {
        // Overlapping, extend current range
        current.end = Math.max(current.end, range.end);
      } else {
        // Non-overlapping, save current and start new
        merged.push(current);
        current = { ...range };
      }
    }
    merged.push(current);

    // Sum up all ranges (convert from microseconds to milliseconds)
    let total = 0;
    for (const range of merged) {
      total += range.end - range.start;
    }

    return total / 1000;
  }

  const scriptingTime = calculateMergedTime(scriptingRanges);
  const renderingTime = calculateMergedTime(renderingRanges);
  const paintingTime = calculateMergedTime(paintingRanges);

  // Total time is the wall-clock duration of the trace
  const totalTime =
    traceStart !== Infinity && traceEnd !== -Infinity
      ? (traceEnd - traceStart) / 1000
      : scriptingTime + renderingTime + paintingTime;

  return {
    scriptingTime: Math.round(scriptingTime * 100) / 100,
    renderingTime: Math.round(renderingTime * 100) / 100,
    paintingTime: Math.round(paintingTime * 100) / 100,
    totalTime: Math.round(totalTime * 100) / 100,
  };
}

/**
 * Load baselines from file
 */
export function loadBaselines(): PerfBaselines {
  if (!fs.existsSync(BASELINES_PATH)) {
    return {};
  }
  const content = fs.readFileSync(BASELINES_PATH, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save baselines to file
 */
export function saveBaselines(baselines: PerfBaselines): void {
  fs.writeFileSync(BASELINES_PATH, JSON.stringify(baselines, null, 2) + '\n');
}

/**
 * Get the baseline for a specific test
 */
export function getBaseline(testName: string): PerfBaseline | null {
  const baselines = loadBaselines();
  return baselines[testName] || null;
}

/**
 * Save or update a baseline for a specific test
 */
export function saveBaseline(testName: string, metrics: PerfMetrics): void {
  const baselines = loadBaselines();
  baselines[testName] = {
    scriptingTime: Math.round(metrics.scriptingTime * 100) / 100,
    renderingTime: Math.round(metrics.renderingTime * 100) / 100,
    paintingTime: Math.round(metrics.paintingTime * 100) / 100,
    totalTime: Math.round(metrics.totalTime * 100) / 100,
  };
  saveBaselines(baselines);
}

export interface PerfComparisonResult {
  passed: boolean;
  baseline: number;
  current: number;
  difference: number; // percentage difference
  threshold: number;
  message: string;
}

/**
 * Compare current metrics against baseline
 * Returns comparison result with pass/fail status
 */
export function compareAgainstBaseline(
  testName: string,
  currentMetrics: PerfMetrics,
  options: {
    compare: 'scriptingTime' | 'renderingTime' | 'paintingTime' | 'totalTime';
  } = {
    compare: 'totalTime',
  },
): PerfComparisonResult | null {
  const baseline = getBaseline(testName);

  if (!baseline) {
    // No baseline exists - this is not a failure, but we should note it
    return null;
  }

  const compare = options?.compare ?? 'totalTime';

  const threshold = DEFAULT_THRESHOLD;
  const baselineValue = baseline[compare];
  const currentValue = currentMetrics[compare];

  // Calculate percentage difference (positive = slower, negative = faster)
  const difference = ((currentValue - baselineValue) / baselineValue) * 100;
  const passed = difference <= threshold;

  let message: string;
  if (passed) {
    if (difference < 0) {
      message = `Performance improved by ${Math.abs(difference).toFixed(
        1,
      )}% (${currentValue}ms vs baseline ${baselineValue}ms - comparing ${compare})`;
    } else if (difference === 0) {
      message = `Performance unchanged (${currentValue}ms - comparing ${compare})`;
    } else {
      message = `Performance within threshold: +${difference.toFixed(
        1,
      )}% (${currentValue}ms vs baseline ${baselineValue}ms, threshold: ${threshold}% - comparing ${compare})`;
    }
  } else {
    message = `Performance regression detected: +${difference.toFixed(
      1,
    )}% exceeds ${threshold}% threshold (${currentValue}ms vs baseline ${baselineValue}ms - comparing ${compare})`;
  }

  return {
    passed,
    baseline: baselineValue,
    current: currentValue,
    difference: Math.round(difference * 100) / 100,
    threshold,
    message,
  };
}

/**
 * Format test name for baseline storage (consistent key format)
 */
export function formatTestName(filePathNoExt: string, title: string): string {
  // Extract relative path from the full path
  const testsIndex = filePathNoExt.indexOf('tests/');
  const relativePath =
    testsIndex >= 0 ? filePathNoExt.slice(testsIndex) : filePathNoExt;
  return `${relativePath}:${title}`;
}
