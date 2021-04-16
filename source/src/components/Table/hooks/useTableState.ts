import { useContext } from 'react';
import { TableState } from '../types';

import { getTableContext } from '../TableContext';

export const useTableState = <T>(): TableState<T> => {
  const TableContext = getTableContext<T>();
  const { state } = useContext(TableContext);

  return state;
};
