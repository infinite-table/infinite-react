import { inject } from 'vue';
import type { InjectionKey, ShallowRef } from 'vue';

import type { DataSourceContextValueForVue } from '../DataSource/DataSourceForVue.vue';
import type {
  InfiniteTableApi,
  InfiniteTableComputedColumn,
  InfiniteTableComputedValues,
  InfiniteTableState,
} from './types';
import type { InfiniteTableActions } from './types/InfiniteTableState';

/**
 * The Vue counterpart of the React InfiniteTableContext - provided by the
 * InfiniteTable root, consumed by descendants (header, cells, toolbars).
 *
 * Lives in its own module so components can consume it without importing the
 * root component (avoids circular imports).
 */
export type InfiniteTableContextValueForVue<T = any> = {
  state: ShallowRef<InfiniteTableState<T>>;
  getState: () => InfiniteTableState<T>;
  actions: InfiniteTableActions<T>;
  api: InfiniteTableApi<T>;
  getComputed: () => InfiniteTableComputedValues<T>;
  getComputedVisibleColumns: () => InfiniteTableComputedColumn<T>[];
  dataSourceContext: DataSourceContextValueForVue<T>;
};

export const InfiniteTableInjectionKeyForVue: InjectionKey<InfiniteTableContextValueForVue> =
  Symbol('InfiniteTable');

export function useInfiniteTableContext<T = any>() {
  return inject(
    InfiniteTableInjectionKeyForVue,
  ) as InfiniteTableContextValueForVue<T>;
}
