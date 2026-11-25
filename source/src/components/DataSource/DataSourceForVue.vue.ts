import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  provide,
  shallowRef,
} from 'vue';
import type { ComputedRef, InjectionKey, ShallowRef } from 'vue';

import { buildManagedVueComponent } from '../hooks/useComponentState/useManagedComponent.vue';
import { runControllerEffectsForVue } from '../hooks/runControllerEffectsForVue.vue';

import {
  deriveStateFromProps,
  forwardProps,
  initSetupState,
  getInterceptActions,
  onPropChange,
  getMappedCallbacks,
  cleanupDataSource,
} from './state/getInitialState';
import { concludeReducer } from './state/reducer';
import { getDataSourceApi } from './getDataSourceApi';
import { createDataSourceEffects } from './dataSourceEffects';
import type { Scrollbars } from '../InfiniteTable/types/InfiniteTableProps';

import type {
  DataSourceApi,
  DataSourceComponentActions,
  DataSourceState,
} from './types';
import { useGetMasterDetailContextForVue } from './DataSourceMasterDetailContextForVue.vue';

/**
 * All public DataSource props (camelCase). Declared explicitly so Vue
 * resolves them as props (with kebab-case normalization in templates) and
 * absent props stay `undefined` — which is what presence-based
 * controlled/uncontrolled detection relies on. Array-form declaration on
 * purpose: no Boolean casting, no defaults.
 */
export const DATA_SOURCE_PROP_NAMES = [
  'debugId',
  'primaryKey',
  'fields',
  'refetchKey',
  'batchOperationDelay',
  'rowInfoReducers',
  'data',
  'selectionMode',
  'useGroupKeysForMultiRowSelection',
  'multiRowSelectionTarget',
  'rowSelection',
  'defaultRowSelection',
  'onRowSelectionChange',
  'cellSelection',
  'defaultCellSelection',
  'onCellSelectionChange',
  'rowDisabledState',
  'defaultRowDisabledState',
  'onRowDisabledStateChange',
  'isRowDisabled',
  'isRowSelected',
  'lazyLoad',
  'loading',
  'defaultLoading',
  'onLoadingChange',
  'onReady',
  'pivotBy',
  'defaultPivotBy',
  'onPivotByChange',
  'aggregationReducers',
  'defaultAggregationReducers',
  'groupBy',
  'defaultGroupBy',
  'onGroupByChange',
  'groupRowsState',
  'defaultGroupRowsState',
  'onGroupRowsStateChange',
  'collapseGroupRowsOnDataFunctionChange',
  'sortFunction',
  'sortInfo',
  'defaultSortInfo',
  'onSortInfoChange',
  'onDataParamsChange',
  'onDataArrayChange',
  'onDataMutations',
  'livePagination',
  'livePaginationCursor',
  'onLivePaginationCursorChange',
  'filterFunction',
  'treeFilterFunction',
  'shouldReloadData',
  'filterValue',
  'defaultFilterValue',
  'onFilterValueChange',
  'filterDelay',
  'filterTypes',
  'sortTypes',
  'multiSort',
  // tree props (TreeDataSourceProps)
  'nodesKey',
  'isNodeExpanded',
  'isNodeCollapsed',
  'isNodeReadOnly',
  'isNodeSelectable',
  'isNodeSelected',
  'treeSelection',
  'defaultTreeSelection',
  'onTreeSelectionChange',
  'onTreeDataMutations',
  'onNodeCollapse',
  'onNodeExpand',
  'treeExpandState',
  'defaultTreeExpandState',
  'onTreeExpandStateChange',
] as const;

export type DataSourceContextValueForVue<T = any> = {
  state: ShallowRef<DataSourceState<T>>;
  getDataSourceState: () => DataSourceState<T>;
  dataSourceActions: DataSourceComponentActions<T>;
  dataSourceApi: DataSourceApi<T>;
  assignState: (state: Partial<DataSourceState<T>>) => void;
};

export const DataSourceInjectionKeyForVue: InjectionKey<DataSourceContextValueForVue> =
  Symbol('DataSource');

export function useDataSourceContext<T = any>() {
  return inject(
    DataSourceInjectionKeyForVue,
  ) as DataSourceContextValueForVue<T>;
}

/**
 * Vue sibling of the React `useDataSourceState` hook: selects a value from
 * the state of the closest <DataSource>. Returns a computed ref, so whatever
 * reads it re-renders only when the selected value changes.
 *
 * Call it in `setup()` of a component rendered inside <DataSource>.
 */
export function useDataSourceState<R, T = any>(
  selector: (state: DataSourceState<T>) => R,
): ComputedRef<R> {
  const { state } = useDataSourceContext<T>();

  return computed(() => selector(state.value));
}

const { useManagedComponent: useManagedDataSourceVue } =
  buildManagedVueComponent({
    debugName: 'DataSource',
    //@ts-ignore
    initSetupState,
    //@ts-ignore
    forwardProps,
    //@ts-ignore
    concludeReducer,
    //@ts-ignore
    mapPropsToState: deriveStateFromProps,
    //@ts-ignore
    onPropChange,
    //@ts-ignore
    cleanup: cleanupDataSource,
    //@ts-ignore
    interceptActions: getInterceptActions(),
    //@ts-ignore
    mappedCallbacks: getMappedCallbacks(),
  });

/**
 * Composition-level DataSource setup — usable directly (returns the context
 * value) or through the DataSource component below.
 */
export function useDataSourceForVue<T>(props: any) {
  // when rendered inside a row-detail, the InfiniteTableDetailRow sibling
  // provides the master-detail context - the master DataSource gets the
  // default () => undefined
  const getDataSourceMasterContext = useGetMasterDetailContextForVue();
  const isDetail = !!getDataSourceMasterContext();

  const { contextValue: managedContextValue } = useManagedDataSourceVue(props);

  const state = managedContextValue.state as unknown as ShallowRef<
    DataSourceState<T>
  >;
  const dataSourceActions =
    managedContextValue.componentActions as unknown as DataSourceComponentActions<T>;
  // non-tracking getter (NOT `() => state.value`): getDataSourceState is the
  // imperative accessor handed to cells/api/event handlers - reading the
  // reactive ref here would subscribe every calling component to ALL state
  // changes. Reactive consumers read `state.value` directly instead.
  const getDataSourceState =
    managedContextValue.getComponentState as () => DataSourceState<T>;

  state.value.getDataSourceMasterContextRef.current =
    getDataSourceMasterContext;

  const dataSourceApi = getDataSourceApi<T>({
    getState: getDataSourceState,
    actions: dataSourceActions,
  });

  const contextValue: DataSourceContextValueForVue<T> = {
    state,
    getDataSourceState,
    dataSourceActions,
    dataSourceApi,
    assignState: managedContextValue.assignState as (
      s: Partial<DataSourceState<T>>,
    ) => void,
  };

  provide(
    DataSourceInjectionKeyForVue,
    contextValue as DataSourceContextValueForVue<any>,
  );

  // data loading, lazy loading, livePagination, master-detail registration,
  // the data change callbacks and onReady - shared with the Angular
  // DataSource (dataSourceEffects.ts)
  const scrollbars = shallowRef<Scrollbars>({
    vertical: false,
    horizontal: false,
  });
  const dataSourceEffects = createDataSourceEffects<T>({
    state: () => state.value,
    getState: getDataSourceState,
    actions: dataSourceActions,
    api: dataSourceApi,
    assignState: contextValue.assignState,
    getDataSourceMasterContext,
    scrollbars: {
      get: () => scrollbars.value,
      set: (value) => {
        scrollbars.value = value;
      },
    },
  });
  runControllerEffectsForVue(dataSourceEffects.effects, {
    before: dataSourceEffects.beforeEffectsMount,
    after: dataSourceEffects.afterEffectsMount,
  });

  onBeforeUnmount(() => {
    dataSourceEffects.destroy();
    const dataSourceState = getDataSourceState();
    dataSourceState.onCleanup(dataSourceState);
  });

  if (__DEV__ && !isDetail) {
    (globalThis as any).getDataSourceState = getDataSourceState;
    (globalThis as any).dataSourceActions = dataSourceActions;
    (globalThis as any).dataSourceApi = dataSourceApi;
  }
  if (__DEV__) {
    if (state.value.debugId) {
      (globalThis as any).dataSources = (globalThis as any).dataSources || {};
      (globalThis as any).dataSources[state.value.debugId] = {
        getState: getDataSourceState,
        actions: dataSourceActions,
        api: dataSourceApi,
      };
    }
  }

  return contextValue;
}

/**
 * Vue sibling of the DataSource component. The default slot receives the
 * current DataSourceState (mirrors React's children-as-function support).
 */
export const DataSource = defineComponent({
  name: 'DataSource',
  props: [...DATA_SOURCE_PROP_NAMES],
  setup(props, { slots }) {
    const contextValue = useDataSourceForVue(props);

    return () => slots.default?.(contextValue.state.value) ?? null;
  },
});
