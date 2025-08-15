import { createContext } from 'react';
import { InfiniteTableHeaderState } from '../../state/getInfiniteHeaderState';
import { ManagedComponentStateContextValue } from '../../../hooks/useComponentState/types';

const HeaderContext = createContext<
  ManagedComponentStateContextValue<InfiniteTableHeaderState<any>, any>
>(null as any);

export function getInfiniteTableHeaderContext<T>(): React.Context<
  ManagedComponentStateContextValue<InfiniteTableHeaderState<T>, any>
> {
  return HeaderContext;
}
