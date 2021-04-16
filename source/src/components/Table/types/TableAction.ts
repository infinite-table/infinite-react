import { TableState } from './TableState';

import { TableActionType } from './TableActionType';

export type TableAction = {
  type: TableActionType;
  payload?: any;
};

export interface TableReducer<T> {
  (state: TableState<T>, action: TableAction): TableState<T>;
}

export interface TableScopedReducer<T> {
  (state: T, action: TableAction): T;
}
