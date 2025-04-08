import type {
  DataSourceApi,
  DataSourceComponentActions,
  DataSourceState,
  DebugTimingKey,
} from '../../DataSource';
import type {
  InfiniteTableApi,
  InfiniteTableComputedColumn,
  InfiniteTableComputedValues,
  InfiniteTableState,
} from '.';
import type { InfiniteTableActions } from './InfiniteTableState';

export type DevToolsMessageAddress =
  | 'infinite-table-devtools-contentscript'
  | 'infinite-table-devtools-contentscript-panel'
  | 'infinite-table-devtools-background'
  | 'infinite-table-page';

export type DevToolsGenericMessage = {
  source: DevToolsMessageAddress;
  target: DevToolsMessageAddress;
  payload: any;
  type: string;
};

export type DevToolsHookFnOptions = {
  getState: () => InfiniteTableState<any>;
  getDataSourceState: () => DataSourceState<any>;
  getComputed: () => InfiniteTableComputedValues<any>;
  actions: InfiniteTableActions<any>;
  dataSourceActions: DataSourceComponentActions<any>;
  api: InfiniteTableApi<any>;
  dataSourceApi: DataSourceApi<any>;
};

export type DevToolsInfiniteOverrides = Partial<{
  groupRenderStrategy: InfiniteTableState<any>['groupRenderStrategy'];
  columnVisibility: InfiniteTableState<any>['columnVisibility'];
}>;

export type DevToolsDataSourceOverrides = Partial<{
  groupBy: DataSourceState<any>['groupBy'];
}>;

export type DevToolsHostPageMessagePayload = {
  debugId: string;
  columnOrder: string[];
  visibleColumnIds: string[];
  columns: Record<
    string,
    {
      field: InfiniteTableComputedColumn<any>['field'];
      dataType: InfiniteTableComputedColumn<any>['computedDataType'];
      sortType: InfiniteTableComputedColumn<any>['computedSortType'];
      filtered: InfiniteTableComputedColumn<any>['computedFiltered'];
      sorted: InfiniteTableComputedColumn<any>['computedSorted'];
      width: InfiniteTableComputedColumn<any>['computedWidth'];
    }
  >;
  groupRenderStrategy: InfiniteTableState<any>['groupRenderStrategy'];
  groupBy: string[];
  selectionMode: DataSourceState<any>['selectionMode'];
  devToolsDetected: InfiniteTableState<any>['devToolsDetected'];
  debugTimings: Record<DebugTimingKey, number>;
};

export type DevToolsHostPageMessageType = 'update' | 'unmount';

export type DevToolsHostPageMessage = {
  source: Extract<DevToolsMessageAddress, 'infinite-table-page'>;
  target: Extract<DevToolsMessageAddress, 'infinite-table-devtools-background'>;
} & (
  | {
      type: Extract<DevToolsHostPageMessageType, 'update'>;
      payload: DevToolsHostPageMessagePayload;
    }
  | {
      type: Extract<DevToolsHostPageMessageType, 'unmount'>;
      payload: {
        debugId: string;
      };
    }
);
export type DevToolsHookFn = (
  debugId: string,
  options: null | DevToolsHookFnOptions,
) => void;
