import { createContext } from 'react';
import { InfiniteTableContextValue } from './types/InfiniteTableContextValue';

let TableContext: any;

export function getInfiniteTableContext<T>(): React.Context<
  InfiniteTableContextValue<T>
> {
  if (TableContext as React.Context<InfiniteTableContextValue<T>>) {
    return TableContext;
  }

  return (TableContext = createContext<InfiniteTableContextValue<T>>(
    null as any as InfiniteTableContextValue<T>,
  ));
}
