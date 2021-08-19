import { useContext } from 'react';
import { InfiniteTableState } from '../types';

import { getInfiniteTableContext } from '../InfiniteTableContext';

export const useInfiniteTableState = <T>(): InfiniteTableState<T> => {
  const TableContext = getInfiniteTableContext<T>();
  const { componentState } = useContext(TableContext);

  return componentState;
};
