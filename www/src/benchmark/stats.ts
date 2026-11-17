/**
 * Summary statistics for the /benchmark page, computed at build time from the
 * raw samples in public/benchmarks/<run>/results.json.
 *
 * Same algorithm as the benchmark's own report (src/benchmark/benchUtils.ts
 * in the benchmark repository): medians, and - for Infinite Table against
 * each of the other grids - a seeded 95% bootstrap confidence interval of the
 * ratio of medians (or of the difference, when the other grid has zeros), so
 * the numbers here match report.md exactly.
 */
import results from '../../public/benchmarks/2026-11-12-infinite-table-mui-x-ag-grid-tanstack-table/results.json';

export const BENCHMARK_RUN_PATH =
  '/benchmarks/2026-11-12-infinite-table-mui-x-ag-grid-tanstack-table';

export type Grid = 'mui' | 'ag-grid' | 'tanstack' | 'infinite';
export type OtherGrid = Exclude<Grid, 'infinite'>;

/** in the order they are shown; `key` is the prop of a BenchmarkChart row */
export const GRIDS: {
  id: Grid;
  key: 'mui' | 'ag' | 'tanstack' | 'infinite';
  name: string;
  short: string;
}[] = [
  { id: 'mui', key: 'mui', name: 'MUI X Data Grid', short: 'MUI X' },
  { id: 'ag-grid', key: 'ag', name: 'AG Grid', short: 'AG Grid' },
  {
    id: 'tanstack',
    key: 'tanstack',
    name: 'TanStack Table',
    short: 'TanStack',
  },
  {
    id: 'infinite',
    key: 'infinite',
    name: 'Infinite Table',
    short: 'Infinite',
  },
];
export const OTHER_GRIDS = GRIDS.filter((grid) => grid.id !== 'infinite') as {
  id: OtherGrid;
  key: 'mui' | 'ag' | 'tanstack';
  name: string;
  short: string;
}[];

export const gridName = (grid: Grid) => GRIDS.find((g) => g.id === grid)!.name;

type Metric = {
  key: string;
  label: string;
  unit: string;
  better: 'lower' | 'higher';
};
type Scenario<G extends string = Grid> = {
  scenario: string;
  description: string;
  metrics: Metric[];
  /** a grid a scenario doesn't run for has no samples */
  samples: Partial<Record<G, Record<string, number>[]>>;
};
type ScrollInfo = {
  ratio: number;
  scrollMax: number;
  lastVisibleRow: number;
  rowCount: number;
};
type Size<G extends string = Grid> = {
  size: string;
  rowCount: number;
  checksum: string;
  scroll: Partial<Record<G, ScrollInfo>> | null;
  results: Record<string, Scenario<G>>;
};
type Results<G extends string = Grid> = {
  environment: {
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
    versions: Record<G, string>;
  };
  sizes: Record<string, Size<G>>;
};

function percentile(values: number[], p: number) {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return NaN;
  const idx = ((v.length - 1) * p) / 100;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return v[lo] + (v[hi] - v[lo]) * (idx - lo);
}

const median = (values: number[]) => percentile(values, 50);

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function bootstrap(
  a: number[],
  b: number[],
  seed: number,
  stat: (ma: number, mb: number) => number | undefined,
) {
  const A = a.filter(Number.isFinite);
  const B = b.filter(Number.isFinite);
  if (A.length < 2 || B.length < 2) return [NaN, NaN] as const;
  const random = seeded(seed);
  const resample = (v: number[]) =>
    v.map(() => v[Math.floor(random() * v.length)]);
  const values: number[] = [];
  for (let i = 0; i < 2000; i++) {
    const value = stat(median(resample(A)), median(resample(B)));
    if (value !== undefined) values.push(value);
  }
  return [percentile(values, 2.5), percentile(values, 97.5)] as const;
}

/** Infinite Table against one other grid */
export type Comparison<G extends string = Grid> = {
  /** Infinite / other, when it means something */
  ratio?: number;
  /** Infinite - other, when the other grid has zeros */
  diff?: number;
  ci: readonly [number, number];
  /** 'tie': the confidence interval includes "no difference" */
  winner: G | 'tie';
};

export type MetricSummary<G extends string = Grid> = {
  metric: Metric;
  /** the median of each grid that was measured */
  values: Partial<Record<G, number>>;
  vs: Partial<Record<Exclude<G, 'infinite'>, Comparison<G>>>;
};

/** What a page needs to show a run: its grids, in the order they are shown. */
export type GridInfo<G extends string = string> = {
  id: G;
  name: string;
  short: string;
};

/**
 * The statistics of one run. `grids` has an `infinite` entry: every other
 * grid is compared against it. The React run below and the Vue one
 * (vueStats.ts) are both read with this.
 */
export function createBenchmarkStats<
  G extends string,
  I extends GridInfo<G> = GridInfo<G>,
>(results: unknown, grids: I[]) {
  type Other = Exclude<G, 'infinite'>;
  const benchmark = results as Results<G>;
  const infinite = 'infinite' as G;
  const otherGrids = grids.filter((grid) => grid.id !== infinite) as (I & {
    id: Other;
  })[];

  function summarize(size: string, scenario: string): MetricSummary<G>[] {
    const result = benchmark.sizes[size].results[scenario];
    return result.metrics.map((metric) => {
      const samples = (grid: G) =>
        (result.samples[grid] ?? []).map((s) => s[metric.key]);
      const values: MetricSummary<G>['values'] = {};
      for (const grid of grids) {
        const v = samples(grid.id);
        if (v.length) {
          values[grid.id] = median(v);
        }
      }
      const vs: MetricSummary<G>['vs'] = {};
      const inf = samples(infinite);
      for (const { id: other } of otherGrids) {
        const otherSamples = samples(other);
        if (!inf.length || !otherSamples.length) {
          continue;
        }
        const useRatio = otherSamples
          .filter(Number.isFinite)
          .every((v) => v > 0);
        const ci = useRatio
          ? bootstrap(otherSamples, inf, 1234567, (ma, mb) =>
              ma !== 0 ? mb / ma : undefined,
            )
          : bootstrap(otherSamples, inf, 7654321, (ma, mb) => mb - ma);
        const same = useRatio ? 1 : 0;
        let winner: Comparison<G>['winner'] = 'tie';
        if (Number.isFinite(ci[0]) && (ci[1] < same || ci[0] > same)) {
          const infLower = ci[1] < same;
          winner = infLower === (metric.better === 'lower') ? infinite : other;
        }
        vs[other] = {
          ratio: useRatio ? values[infinite]! / values[other]! : undefined,
          diff: useRatio ? undefined : values[infinite]! - values[other]!,
          ci,
          winner,
        };
      }
      return { metric, values, vs };
    });
  }

  function metric(size: string, scenario: string, key: string) {
    const found = summarize(size, scenario).find((m) => m.metric.key === key);
    if (!found) {
      throw new Error(`No metric ${scenario}/${key} for ${size}`);
    }
    return found;
  }

  /** the grids that have samples in a scenario */
  function gridsOf(size: string, scenario: string) {
    const { samples } = benchmark.sizes[size].results[scenario];
    return grids.filter((grid) => samples[grid.id]?.length);
  }

  return { benchmark, grids, otherGrids, summarize, metric, gridsOf };
}

/** The React run, as one object (the exports below are its parts). */
export const reactBenchmark = createBenchmarkStats<
  Grid,
  (typeof GRIDS)[number]
>(results, GRIDS);

export const { benchmark, summarize, metric, gridsOf } = reactBenchmark;

export function formatMetric(value: number, unit: string) {
  if (!Number.isFinite(value)) return '–';
  const abs = Math.abs(value);
  const text = value.toLocaleString('en-US', {
    maximumFractionDigits: abs >= 100 ? 0 : abs >= 10 ? 1 : 2,
  });
  if (!unit) return text;
  return unit === '%' ? `${text}%` : `${text} ${unit}`;
}
