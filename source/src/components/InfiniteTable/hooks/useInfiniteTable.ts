import { useContext } from 'react';
import type { InfiniteTableContextValue } from '../types';

import { getInfiniteTableContext } from '../InfiniteTableContext';

export const useInfiniteTable = <T>(): InfiniteTableContextValue<T> => {
  const TableContext = getInfiniteTableContext<T>();

  return useContext(TableContext);
};
