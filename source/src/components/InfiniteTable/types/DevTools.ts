import type { DataSourceState } from '../../DataSource';
import type { InfiniteTableComputedValues, InfiniteTableState } from '.';

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
};

export type DevToolsHostPageMessagePayload = {
  debugId: string;
  columnOrder: string[];
  visibleColumnIds: string[];
  selectionMode: DataSourceState<any>['selectionMode'];
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
