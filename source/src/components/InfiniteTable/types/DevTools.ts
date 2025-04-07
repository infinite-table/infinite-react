import type {
  DataSourceComponentActions,
  DataSourceState,
  DebugTimingKey,
} from '../../DataSource';
import type {
  InfiniteTableApi,
  InfiniteTableComputedValues,
  InfiniteTableState,
} from '.';
import { InfiniteTableActions } from './InfiniteTableState';

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
};

export type DevToolsHostPageMessagePayload = {
  debugId: string;
  columnOrder: string[];
  visibleColumnIds: string[];
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
