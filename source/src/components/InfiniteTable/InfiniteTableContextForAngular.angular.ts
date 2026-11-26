import { InjectionToken, Signal, inject } from '@angular/core';

import type { DataSourceContextValueForAngular } from '../DataSource/DataSourceForAngular.angular';
import type {
  InfiniteTableApi,
  InfiniteTableComputedColumn,
  InfiniteTableComputedValues,
  InfiniteTableState,
  Scrollbars,
} from './types';
import type { InfiniteTableActions } from './types/InfiniteTableState';

/**
 * What an InfiniteTable gives the components inside it (header, cells,
 * menus, `injectInfiniteTable()`).
 *
 * Lives in its own module so components can use it without importing the
 * root component (no circular imports).
 */
export type InfiniteTableContextValueForAngular<T = any> = {
  /** tracked */
  state: Signal<InfiniteTableState<T>>;
  /** untracked */
  getState: () => InfiniteTableState<T>;
  actions: InfiniteTableActions<T>;
  api: InfiniteTableApi<T>;
  getComputed: () => InfiniteTableComputedValues<T>;
  /** tracked: the computed columns (changes when the columns do) */
  computed: Signal<InfiniteTableComputedValues<T>>;
  getComputedVisibleColumns: () => InfiniteTableComputedColumn<T>[];
  /** tracked: whether the body shows scrollbars */
  scrollbars: Signal<Scrollbars>;
  dataSourceContext: DataSourceContextValueForAngular<T>;
};

export const INFINITE_TABLE = new InjectionToken<
  InfiniteTableContextValueForAngular<any>
>('INFINITE_TABLE');

/**
 * In an injection context inside an InfiniteTable: its state, actions, api
 * and computed values.
 */
export function injectInfiniteTable<
  T = any,
>(): InfiniteTableContextValueForAngular<T> {
  return inject(INFINITE_TABLE) as InfiniteTableContextValueForAngular<T>;
}
