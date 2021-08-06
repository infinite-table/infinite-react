import type { ScrollPosition } from '../../types/ScrollPosition';
import type {
  InfiniteTablePropColumnAggregations,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropColumnVisibility,
} from './InfiniteTableProps';
import { Size } from '../../types/Size';

export interface InfiniteTableState<T> {
  columnShifts: null | number[];
  draggingColumnId: null | string;
  // viewportSize: Size;
  bodySize: Size;
  scrollPosition: ScrollPosition;
  columnOrder: InfiniteTablePropColumnOrder;
  columnVisibility: InfiniteTablePropColumnVisibility;
  columnPinning: InfiniteTablePropColumnPinning;
  columnAggregations: InfiniteTablePropColumnAggregations<T>;

  x?: T;
}
