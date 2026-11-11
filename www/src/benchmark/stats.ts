/**
 * Summary statistics for the /benchmark page, computed at build time from the
 * raw samples in public/benchmarks/<run>/results.json.
 *
 * Same algorithm as the benchmark's own report (examples/src/benchmark/
 * benchUtils.ts): medians, and a seeded 95% bootstrap confidence interval of
 * the ratio of medians (or of the difference, when AG Grid has zeros), so the
 * numbers here match report.md exactly.
 */
import results from '../../public/benchmarks/2026-11-11-ag-grid-vs-infinite-table/results.json';

export const BENCHMARK_RUN_PATH =
  '/benchmarks/2026-11-11-ag-grid-vs-infinite-table';

type Grid = 'ag-grid' | 'infinite';
type Metric = { key: string; label: string; unit: string; better: 'lower' | 'higher' };
type Scenario = {
  scenario: string;
  description: string;
  metrics: Metric[];
  samples: Record<Grid, Record<string, number>[]>;
};
type Size = {
  size: string;
  rowCount: number;
  checksum: string;
  results: Record<string, Scenario>;
};
type Results = {
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
    versions: { 'ag-grid': string; infinite: string };
  };
  sizes: Record<string, Size>;
};

export const benchmark = results as unknown as Results;

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
  const resample = (v: number[]) => v.map(() => v[Math.floor(random() * v.length)]);
  const values: number[] = [];
  for (let i = 0; i < 2000; i++) {
    const value = stat(median(resample(A)), median(resample(B)));
    if (value !== undefined) values.push(value);
  }
  return [percentile(values, 2.5), percentile(values, 97.5)] as const;
}

export type MetricSummary = {
  metric: Metric;
  ag: number;
  infinite: number;
  /** Infinite / AG Grid, when it means something */
  ratio?: number;
  /** Infinite - AG Grid, when AG Grid has zeros */
  diff?: number;
  ci: readonly [number, number];
  winner: 'Infinite Table' | 'AG Grid' | 'tie';
};

export function summarize(size: string, scenario: string): MetricSummary[] {
  const result = benchmark.sizes[size].results[scenario];
  return result.metrics.map((metric) => {
    const values = (grid: Grid) => result.samples[grid].map((s) => s[metric.key]);
    const ag = values('ag-grid');
    const inf = values('infinite');
    const agMedian = median(ag);
    const infMedian = median(inf);
    const useRatio = ag.filter(Number.isFinite).every((v) => v > 0);
    const ci = useRatio
      ? bootstrap(ag, inf, 1234567, (ma, mb) => (ma !== 0 ? mb / ma : undefined))
      : bootstrap(ag, inf, 7654321, (ma, mb) => mb - ma);
    const same = useRatio ? 1 : 0;
    let winner: MetricSummary['winner'] = 'tie';
    if (Number.isFinite(ci[0]) && (ci[1] < same || ci[0] > same)) {
      const infLower = ci[1] < same;
      winner = infLower === (metric.better === 'lower') ? 'Infinite Table' : 'AG Grid';
    }
    return {
      metric,
      ag: agMedian,
      infinite: infMedian,
      ratio: useRatio ? infMedian / agMedian : undefined,
      diff: useRatio ? undefined : infMedian - agMedian,
      ci,
      winner,
    };
  });
}

export function metric(size: string, scenario: string, key: string) {
  const found = summarize(size, scenario).find((m) => m.metric.key === key);
  if (!found) {
    throw new Error(`No metric ${scenario}/${key} for ${size}`);
  }
  return found;
}

export function formatMetric(value: number, unit: string) {
  if (!Number.isFinite(value)) return '–';
  const abs = Math.abs(value);
  const text = value.toLocaleString('en-US', {
    maximumFractionDigits: abs >= 100 ? 0 : abs >= 10 ? 1 : 2,
  });
  if (!unit) return text;
  return unit === '%' ? `${text}%` : `${text} ${unit}`;
}
