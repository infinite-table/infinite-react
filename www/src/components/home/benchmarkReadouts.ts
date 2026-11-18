/*
 * The home pages' benchmark numbers, computed at build time from the raw
 * samples of the latest run (src/benchmark/stats.ts, the same medians and
 * confidence intervals as /benchmark): the React run on the React home page,
 * the Vue run (src/benchmark/vueStats.ts) on the Vue one. Every grid of the
 * run is shown; the "of 4" badge only appears where Infinite Table wins
 * against each of them.
 */
import {
  BENCHMARK_RUN_PATH,
  describeMachine,
  reactBenchmark,
  type GridInfo,
  type MetricSummary,
} from '@www/benchmark/stats';
import {
  VUE_BENCHMARK_REPO,
  VUE_BENCHMARK_RUN_PATH,
  vueBenchmark,
} from '@www/benchmark/vueStats';

/** What the readouts need from a run (createBenchmarkStats returns it). */
type Run = {
  benchmark: {
    environment: {
      chrome: string;
      cpu: string;
      os: string;
      runId: string;
      runs: number;
      versions: Record<string, string>;
    };
  };
  grids: GridInfo[];
  otherGrids: GridInfo[];
  metric: (
    size: string,
    scenario: string,
    key: string,
  ) => MetricSummary<string>;
};

const SIZE = '1m';

export type ReadoutBar = {
  name: string;
  value: number;
  text: string;
  us: boolean;
};

export type Readout = {
  label: string;
  /** Infinite Table's median */
  text: string;
  unit: string;
  /** e.g. "Fastest of 4": only when the run says so for every other grid */
  badge: string | null;
  bars: ReadoutBar[];
};

/**
 * One unit for a whole readout: seconds when any grid takes a second or
 * more, so the bars of one readout never mix ms and s.
 */
function unitFor(values: number[], unit: string) {
  return unit === 'ms' && Math.max(...values) >= 1000 ? 's' : unit;
}

function format(value: number, unit: string, shownUnit: string) {
  if (unit === 'ms' && shownUnit === 's') {
    return (value / 1000).toFixed(2);
  }
  return value.toFixed(value >= 100 ? 0 : 1);
}

function readout(
  run: Run,
  label: string,
  scenario: string,
  key: string,
  winsLabel: string,
  /** grids left out of this readout: ones that don't do what it measures */
  exclude: string[] = [],
): Readout {
  const summary = run.metric(SIZE, scenario, key);
  const { unit } = summary.metric;
  const measured = run.grids.filter(
    (grid) => summary.values[grid.id] != null && !exclude.includes(grid.id),
  );
  const shownUnit = unitFor(
    measured.map((grid) => summary.values[grid.id]!),
    unit,
  );
  const bars = measured
    .map((grid) => {
      const value = summary.values[grid.id]!;
      return {
        name: grid.short,
        value,
        text: `${format(value, unit, shownUnit)} ${shownUnit}`,
        us: grid.id === 'infinite',
      };
    })
    .sort((a, b) => a.value - b.value);

  const winsAll = run.otherGrids
    .filter((grid) => !exclude.includes(grid.id))
    .every((grid) => summary.vs[grid.id]?.winner === 'infinite');

  return {
    label,
    text: format(summary.values.infinite!, unit, shownUnit),
    unit: shownUnit,
    badge: winsAll ? `${winsLabel} of ${bars.length}` : null,
    bars,
  };
}

function readoutsOf(run: Run, sortExclude: string[] = []) {
  const env = run.benchmark.environment;
  const versions = run.grids.map(
    (grid) => `${grid.name} ${env.versions[grid.id]}`,
  );
  return {
    readouts: [
      readout(run, 'Mount 1,000,000 rows', 'mount', 'visibleMs', 'Fastest'),
      readout(
        run,
        'Sort 1,000,000 rows by text',
        'sort-string',
        'ascVisibleMs',
        'Fastest',
        sortExclude,
      ),
      readout(run, 'Memory with 1,000,000 rows', 'mount', 'heapMB', 'Lowest'),
    ],
    footnote: `${versions.join(', ')}. Chrome ${env.chrome.split('.')[0]}, ${describeMachine(
      env,
    )}, medians of ${env.runs} runs.`,
  };
}

/** The React run: the numbers of the React home page. */
export function getBenchmarkReadouts() {
  return {
    ...readoutsOf(reactBenchmark as unknown as Run),
    href: '/benchmark',
    runPath: BENCHMARK_RUN_PATH,
  };
}

/**
 * The Vue run: the numbers of the Vue home page. Its report is the
 * benchmark's repository.
 *
 * Element Plus Table V2 is not in the sort readout: it has no sorting. Its
 * benchmark page sorts the array itself (Array.prototype.sort) and the table
 * renders the result, so that time is the browser's, not a grid's. Its
 * mount time and memory are in: it renders the
 * rows it is given and keeps nothing per row, so neither grows with the row
 * count (the same at 300,000 rows as at 1,000,000).
 */
export function getVueBenchmarkReadouts() {
  return {
    ...readoutsOf(vueBenchmark as unknown as Run, ['element-plus']),
    href: VUE_BENCHMARK_REPO,
    runPath: VUE_BENCHMARK_RUN_PATH,
  };
}
