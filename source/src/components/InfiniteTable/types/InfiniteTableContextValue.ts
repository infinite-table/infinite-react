import {
  InfiniteTableComponentActions,
  InfiniteTableComponentState,
} from './InfiniteTableState';
import { InfiniteTableComputedValues } from './InfiniteTableComputedValues';

export interface InfiniteTableContextValue<T> {
  componentState: InfiniteTableComponentState<T>;
  componentActions: InfiniteTableComponentActions<T>;
  computed: InfiniteTableComputedValues<T>;
  getComputed: () => InfiniteTableComputedValues<T>;
  getState: () => InfiniteTableComponentState<T>;
}
