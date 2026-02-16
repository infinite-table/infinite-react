import {
  ComponentStore,
  createComponentStore,
} from '../../utils/ComponentStore';
import type { InfiniteTableContextValue } from './types/InfiniteTableContextValue';

export interface InfiniteTableStore<T>
  extends ComponentStore<InfiniteTableContextValue<T>> {}

export function createInfiniteTableStore<T>() {
  return createComponentStore<
    InfiniteTableContextValue<T>
  >() as InfiniteTableStore<T>;
}
