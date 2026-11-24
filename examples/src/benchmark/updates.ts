/**
 * Live data updates: what the grids show while rows change (the "view"), and
 * the changes themselves.
 *
 * The same in every grid: a page opened with `?view=sorted` (or `filtered`,
 * `grouped`) mounts its grid with the sorting / filter / grouping below
 * already applied, and the spec then sends it batches of changed rows (see
 * prepareUpdates in harness.ts). Without `?view=` the grid shows the rows as
 * they are, which is what every other scenario uses.
 */
import { BenchRow } from './data';

export type BenchView = 'plain' | 'sorted' | 'filtered' | 'grouped';

export const BENCH_VIEWS: BenchView[] = [
  'plain',
  'sorted',
  'filtered',
  'grouped',
];

/** `sorted`: by salary, highest first - the column the updates change */
export const BENCH_SORT_FIELD = 'salary' satisfies keyof BenchRow;
export const BENCH_SORT_DIR = -1 as const;

/**
 * `filtered`: salary >= 115,000 - about half of the rows, and rows go in and
 * out of the filter as their salary changes
 */
export const BENCH_FILTER_FIELD = 'salary' satisfies keyof BenchRow;
export const BENCH_FILTER_MIN = 115_000;

export function passesBenchFilter(row: BenchRow) {
  return row[BENCH_FILTER_FIELD] >= BENCH_FILTER_MIN;
}

/**
 * `grouped`: grouped by department (10 groups, all collapsed), with the sum
 * of the salaries of each group in the salary column
 */
export const BENCH_GROUP_FIELD = 'department' satisfies keyof BenchRow;
export const BENCH_AGGREGATE_FIELD = 'salary' satisfies keyof BenchRow;

/** the fields an update changes - numbers, like prices in a live feed */
export const BENCH_UPDATED_FIELDS = [
  'salary',
  'bonus',
  'hours',
  'score',
] as const satisfies (keyof BenchRow)[];

export function getBenchView(search: string): BenchView {
  const view = new URLSearchParams(search).get('view') ?? 'plain';
  if (!(BENCH_VIEWS as string[]).includes(view)) {
    throw new Error(`Unknown view "${view}" - use ${BENCH_VIEWS.join(', ')}`);
  }
  return view as BenchView;
}

/**
 * For the grids that take their rows as a prop: a new array, with the
 * changed rows in place of the old ones. `rows` is in the order of the data
 * (by id) - the grids sort and filter it themselves.
 */
export function applyBenchUpdates(rows: BenchRow[], changed: BenchRow[]) {
  const next = rows.slice();
  for (let i = 0; i < changed.length; i++) {
    const row = changed[i];
    next[row.id - 1] = row;
  }
  return next;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

/**
 * The new version of a row: a new object, with the updated fields moved by
 * up to ±1% (the salary always changes, by at least a cent)
 */
export function driftRow(row: BenchRow, random: () => number): BenchRow {
  const drift = () => 1 + (random() * 2 - 1) * 0.01;
  let salary = round2(row.salary * drift());
  if (salary === row.salary) {
    salary = round2(salary + 0.01);
  }
  return {
    ...row,
    salary,
    bonus: round2(row.bonus * drift()),
    hours: round2(row.hours * drift()),
    score: Math.max(0, row.score + Math.floor(random() * 11) - 5),
  };
}
