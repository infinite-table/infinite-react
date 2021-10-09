import type { InfiniteTableComputedColumn } from './InfiniteTableColumn';
import type {
  InfiniteTablePropColumnOrderNormalized,
  InfiniteTablePropColumnVisibility,
} from './InfiniteTableProps';

export interface InfiniteTableComputedValues<T> {
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
  unpinnedColumnRenderCount: number;
  columnRenderStartIndex: number;
  // setColumnPinning: (columnPinning: InfiniteTablePropColumnPinning) => void;
  // setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => void;
  // setColumnVisibility: (
  //   columnVisibility: InfiniteTablePropColumnVisibility,
  // ) => void;

  // setColumnAggregations: (
  //   columnAggregations: InfiniteTablePropColumnAggregations<T>,
  // ) => void;
}
