import { useContext } from 'react';
import type { TableContextValue } from '../types';

import { getTableContext } from '../TableContext';

export const useTable = <T>(): TableContextValue<T> => {
  const TableContext = getTableContext<T>();

  return useContext(TableContext);
};
