import { useContext } from 'react';
import { InfiniteTableState } from '../types';

import { getInfiniteTableContext } from '../InfiniteTableContext';

export const useInfiniteTableState = <T>(): InfiniteTableState<T> => {
  const TableContext = getInfiniteTableContext<T>();
  const { state } = useContext(TableContext);

  return state;
};
