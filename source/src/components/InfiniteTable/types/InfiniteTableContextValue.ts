import { InfiniteTableActions, InfiniteTableState } from './InfiniteTableState';
import { InfiniteTableComputedValues } from './InfiniteTableComputedValues';
import { InfiniteTableImperativeApi } from './InfiniteTableProps';

export interface InfiniteTableContextValue<T> {
  imperativeApi: InfiniteTableImperativeApi<T>;
  componentState: InfiniteTableState<T>;
  componentActions: InfiniteTableActions<T>;
  computed: InfiniteTableComputedValues<T>;
  getComputed: () => InfiniteTableComputedValues<T>;
  getState: () => InfiniteTableState<T>;
}
