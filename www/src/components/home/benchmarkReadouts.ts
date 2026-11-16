/*
 * The homepage's benchmark numbers, computed at build time from the raw
 * samples of the latest run (src/benchmark/stats.ts, the same medians and
 * confidence intervals as /benchmark). Every grid of the run is shown; the
 * "of 4" badge only appears where Infinite Table wins against each of them.
 */
import {
  BENCHMARK_RUN_PATH,
  GRIDS,
  OTHER_GRIDS,
  benchmark,
  metric,
} from '@www/benchmark/stats';

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

function format(value: number, unit: string) {
  if (unit === 'ms' && value >= 1000) {
    return { text: (value / 1000).toFixed(2), unit: 's' };
  }
  const digits = value >= 100 ? 0 : 1;
  return { text: value.toFixed(digits), unit };
}

function readout(
  label: string,
  scenario: string,
  key: string,
  winsLabel: string,
): Readout {
  const summary = metric(SIZE, scenario, key);
  const { unit } = summary.metric;
  const bars = GRIDS.filter((grid) => summary.values[grid.id] != null)
    .map((grid) => {
      const value = summary.values[grid.id]!;
      const f = format(value, unit);
      return {
        name: grid.short,
        value,
        text: `${f.text} ${f.unit}`,
        us: grid.id === 'infinite',
      };
    })
    .sort((a, b) => a.value - b.value);

  const winsAll = OTHER_GRIDS.every(
    (grid) => summary.vs[grid.id]?.winner === 'infinite',
  );
  const ours = format(summary.values.infinite!, unit);

  return {
    label,
    text: ours.text,
    unit: ours.unit,
    badge: winsAll ? `${winsLabel} of ${bars.length}` : null,
    bars,
  };
}

export function getBenchmarkReadouts() {
  const env = benchmark.environment;
  const versions = GRIDS.map(
    (grid) =>
      `${grid.name} ${(env.versions as Record<string, string>)[grid.id]}`,
  );
  return {
    readouts: [
      readout('Mount 1,000,000 rows', 'mount', 'visibleMs', 'Fastest'),
      readout(
        'Sort 1,000,000 rows by text',
        'sort-string',
        'ascVisibleMs',
        'Fastest',
      ),
      readout('Memory with 1,000,000 rows', 'mount', 'heapMB', 'Lowest'),
    ],
    footnote: `${versions.join(', ')}. Chrome ${env.chrome.split('.')[0]}, ${
      env.cpu
    }, medians of ${env.runs} runs.`,
    href: '/benchmark',
    runPath: BENCHMARK_RUN_PATH,
  };
}
