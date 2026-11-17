/**
 * The Vue benchmark: five Vue DataGrids, measured by
 * https://github.com/infinite-table/vue-datagrid-performance-comparison (the
 * Vue counterpart of the React benchmark, with the same scenarios, measuring
 * code and statistics). The raw samples of its latest run are copied to
 * public/benchmarks/<run>/results.json, and read like the React ones.
 */
import results from '../../public/benchmarks/2026-11-17-vue-tanstack-table-ag-grid-primevue-element-plus-infinite-table/results.json';

import { createBenchmarkStats, type GridInfo } from './stats';

export const VUE_BENCHMARK_RUN_PATH =
  '/benchmarks/2026-11-17-vue-tanstack-table-ag-grid-primevue-element-plus-infinite-table';

export const VUE_BENCHMARK_REPO =
  'https://github.com/infinite-table/vue-datagrid-performance-comparison';

export type VueGrid =
  | 'tanstack'
  | 'ag-grid'
  | 'primevue'
  | 'element-plus'
  | 'infinite';

/** in the order they are shown, as in the benchmark's own report */
export const VUE_GRIDS: GridInfo<VueGrid>[] = [
  { id: 'tanstack', name: 'TanStack Table', short: 'TanStack' },
  { id: 'ag-grid', name: 'AG Grid Vue', short: 'AG Grid' },
  { id: 'primevue', name: 'PrimeVue DataTable', short: 'PrimeVue' },
  { id: 'element-plus', name: 'Element Plus Table V2', short: 'Element Plus' },
  { id: 'infinite', name: 'Infinite Table for Vue', short: 'Infinite' },
];

export const vueBenchmark = createBenchmarkStats<VueGrid>(results, VUE_GRIDS);
