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
import {
  DS_ERROR_CODES,
  ERROR_CODES,
  INFINITE_ERROR_CODES,
} from '../errorCodes';

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

export type ErrorCodeKey = keyof typeof ERROR_CODES;
export type DataSourceDebugWarningKey = keyof typeof DS_ERROR_CODES;
export type InfiniteTableDebugWarningKey = keyof typeof INFINITE_ERROR_CODES;

export type DebugWarningPayload = {
  message: string;
  code: ErrorCodeKey;
  type: 'error' | 'warning';
  status?: 'new' | 'discarded';
  debugId?: string;
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

export type DevToolsOverrides = Partial<
  DevToolsInfiniteOverrides & DevToolsDataSourceOverrides
>;

export type DevToolsInfiniteOverrides = Partial<{
  groupRenderStrategy: InfiniteTableState<any>['groupRenderStrategy'];
  columnVisibility: InfiniteTableState<any>['columnVisibility'];
}>;

export type DevToolsDataSourceOverrides = Partial<{
  groupBy: DataSourceState<any>['groupBy'];
  sortInfo: DataSourceState<any>['sortInfo'];
  multiSort: DataSourceState<any>['multiSort'];
}>;

export type DevToolsHostPageMessagePayload = {
  debugId: string;
  columnOrder: string[];
  visibleColumnIds: string[];
  columnVisibility: InfiniteTableState<any>['columnVisibility'];
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
  sortInfo: { field: string; dir: 1 | -1; type?: string }[];
  multiSort: DataSourceState<any>['multiSort'];
  selectionMode: DataSourceState<any>['selectionMode'];
  devToolsDetected: InfiniteTableState<any>['devToolsDetected'];
  debugTimings: Record<DebugTimingKey, number>;
  debugWarnings: Record<ErrorCodeKey, DebugWarningPayload>;
};

export type DevToolsHostPageMessageType = 'update' | 'unmount' | 'log';

export type DevToolsHostPageLogMessage = {
  type: Extract<DevToolsHostPageMessageType, 'log'>;
  payload: DevToolsHostPageLogMessagePayload;
};

export type DevToolsHostPageLogMessagePayload = {
  channel: string;
  color: string;
  args: any[];
  timestamp: number;
  debugId?: string;
};

export type DevToolsHostPageMessage = {
  source: Extract<DevToolsMessageAddress, 'infinite-table-page'>;
  target: Extract<DevToolsMessageAddress, 'infinite-table-devtools-background'>;
  url: string;
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
  | DevToolsHostPageLogMessage
);
export type DevToolsHookFn = (
  debugId: string,
  options: null | DevToolsHookFnOptions,
) => void;
