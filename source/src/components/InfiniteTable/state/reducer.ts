import type { InfiniteTableState, InfiniteTableAction } from '../types';

export const reducer = <
  T,
  S extends InfiniteTableState<T>,
  A extends InfiniteTableAction,
>(
  state: S,
  action: A,
) => {
  return state;
};
