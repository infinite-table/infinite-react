import type { MatrixBrainOptions } from '../../VirtualBrain/MatrixBrain';

import type { InfiniteTableComputedColumn } from './InfiniteTableColumn';
import type {
  InfiniteTablePropColumnOrderNormalized,
  InfiniteTablePropColumnVisibility,
} from './InfiniteTableProps';

export interface InfiniteTableComputedValues<T> {
  scrollbars: {
    vertical: boolean;
    horizontal: boolean;
  };
  showColumnFilters: boolean;
  rowspan?: MatrixBrainOptions['rowspan'];
  computedPinnedStartOverflow: boolean;
  computedPinnedEndOverflow: boolean;
  computedPinnedStartColumns: InfiniteTableComputedColumn<T>[];
  computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
  computedUnpinnedColumns: InfiniteTableComputedColumn<T>[];
  computedVisibleColumns: InfiniteTableComputedColumn<T>[];
  computedVisibleColumnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  computedColumnVisibility: InfiniteTablePropColumnVisibility;
  computedColumnOrder: InfiniteTablePropColumnOrderNormalized;
  computedPinnedStartColumnsWidth: number;
  computedPinnedStartWidth: number;
  computedPinnedEndColumnsWidth: number;
  computedPinnedEndWidth: number;
  computedUnpinnedColumnsWidth: number;
  computedUnpinnedOffset: number;
  computedPinnedEndOffset: number;
  computedRemainingSpace: number;
  toggleGroupRow: (groupKeys: any[]) => void;
  columnSize: (colIndex: number) => number;
  // setColumnPinning: (columnPinning: InfiniteTablePropColumnPinning) => void;
  // setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => void;
  // setColumnVisibility: (
  //   columnVisibility: InfiniteTablePropColumnVisibility,
  // ) => void;
}
