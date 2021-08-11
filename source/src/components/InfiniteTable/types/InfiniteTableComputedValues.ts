import { InfiniteTablePropColumnPinning } from '.';
import type { InfiniteTableComputedColumn } from './InfiniteTableColumn';
import type {
  InfiniteTablePropColumnAggregations,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnOrderNormalized,
  InfiniteTablePropColumnVisibility,
  InfiniteTableProps,
} from './InfiniteTableProps';

export interface InfiniteTableComputedValues<T> {
  columns: InfiniteTableProps<T>['columns'];
  computedPinnedStartColumns: InfiniteTableComputedColumn<T>[];
  computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
  computedUnpinnedColumns: InfiniteTableComputedColumn<T>[];
  computedVisibleColumns: InfiniteTableComputedColumn<T>[];
  computedVisibleColumnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  computedColumnVisibility: InfiniteTablePropColumnVisibility;
  computedColumnOrder: InfiniteTablePropColumnOrderNormalized;
  computedColumnAggregations: InfiniteTablePropColumnAggregations<T>;
  computedPinnedStartColumnsWidth: number;
  computedPinnedEndColumnsWidth: number;
  computedUnpinnedColumnsWidth: number;
  computedUnpinnedOffset: number;
  computedPinnedEndOffset: number;
  computedRemainingSpace: number;
  showZebraRows: boolean;
  unpinnedColumnRenderCount: number;
  columnRenderStartIndex: number;
  setColumnPinning: (columnPinning: InfiniteTablePropColumnPinning) => void;
  setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => void;
  setColumnVisibility: (
    columnVisibility: InfiniteTablePropColumnVisibility,
  ) => void;

  // setColumnAggregations: (
  //   columnAggregations: InfiniteTablePropColumnAggregations<T>,
  // ) => void;
  rowHeight: number;
}
