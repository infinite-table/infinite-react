import { InfiniteTableState } from './InfiniteTableState';

import { InfiniteTableActionType } from './InfiniteTableActionType';

export type InfiniteTableAction = {
  type: InfiniteTableActionType;
  payload?: any;
};

export interface InfiniteTableReducer<T> {
  (
    state: InfiniteTableState<T>,
    action: InfiniteTableAction,
  ): InfiniteTableState<T>;
}

export interface InfiniteTableScopedReducer<T> {
  (state: T, action: InfiniteTableAction): T;
}
