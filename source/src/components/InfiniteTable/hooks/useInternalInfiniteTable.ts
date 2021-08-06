import { useContext } from 'react';

import { getInternalInfiniteTableContext } from '../InfiniteTableContext';
import { InternalInfiniteTableContextValue } from '../types/InfiniteTableContextValue';

export const useInternalInfiniteTable = <
  T,
>(): InternalInfiniteTableContextValue<T> => {
  const InternalTableContext = getInternalInfiniteTableContext<T>();

  return useContext(InternalTableContext);
};
