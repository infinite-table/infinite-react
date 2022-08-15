import { InfiniteTableActions, InfiniteTableState } from './InfiniteTableState';
import { InfiniteTableComputedValues } from './InfiniteTableComputedValues';
import { InfiniteTableApi } from './InfiniteTableProps';

export interface InfiniteTableContextValue<T> {
  imperativeApi: InfiniteTableApi<T>;
  componentState: InfiniteTableState<T>;
  componentActions: InfiniteTableActions<T>;
  computed: InfiniteTableComputedValues<T>;
  getComputed: () => InfiniteTableComputedValues<T>;
  getState: () => InfiniteTableState<T>;
}
