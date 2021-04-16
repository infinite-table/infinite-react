import { createContext } from 'react';
import { TableContextValue } from './types/TableContextValue';

let TableContext: any;

export function getTableContext<T>(): React.Context<TableContextValue<T>> {
  if (TableContext as React.Context<TableContextValue<T>>) {
    return TableContext;
  }

  return (TableContext = createContext<TableContextValue<T>>(
    (null as any) as TableContextValue<T>,
  ));
}
