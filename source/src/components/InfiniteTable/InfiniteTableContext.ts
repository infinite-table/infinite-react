import { createContext } from 'react';
import {
  InfiniteTableContextValue,
  InternalInfiniteTableContextValue,
} from './types/InfiniteTableContextValue';

let TableContext: any;
let InternalTableContext: any;

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

export function getInternalInfiniteTableContext<T>(): React.Context<
  InternalInfiniteTableContextValue<T>
> {
  if (
    InternalTableContext as React.Context<InternalInfiniteTableContextValue<T>>
  ) {
    return InternalTableContext;
  }

  return (InternalTableContext = createContext<
    InternalInfiniteTableContextValue<T>
  >(null as any as InternalInfiniteTableContextValue<T>));
}
