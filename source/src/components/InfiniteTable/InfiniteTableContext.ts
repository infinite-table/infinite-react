import { createContext } from 'react';

import type { InfiniteTableStore } from './InfiniteTableStore';

let InfiniteTableStoreContext: any;

export function getInfiniteTableStoreContext<T>(): React.Context<
  InfiniteTableStore<T>
> {
  if (InfiniteTableStoreContext as React.Context<InfiniteTableStore<T>>) {
    return InfiniteTableStoreContext;
  }

  return (InfiniteTableStoreContext = createContext<InfiniteTableStore<T>>(
    null as any as InfiniteTableStore<T>,
  ));
}
