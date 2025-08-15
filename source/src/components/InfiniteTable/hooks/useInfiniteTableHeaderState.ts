import { createContext } from 'react';
import { InfiniteTableHeaderState } from '../state/getInfiniteHeaderState';

let HeaderContext: any;

export function getInfiniteTableHeaderContext<T>(): React.Context<
  InfiniteTableHeaderState<T>
> {
  if (HeaderContext as React.Context<InfiniteTableHeaderState<T>>) {
    return HeaderContext;
  }

  return (HeaderContext = createContext<InfiniteTableHeaderState<T>>(
    null as any as InfiniteTableHeaderState<T>,
  ));
}
