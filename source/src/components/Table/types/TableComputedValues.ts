import { TablePropColumnPinning } from '.';
import type { TableComputedColumn } from './TableColumn';
import type {
  TablePropColumnOrder,
  TablePropColumnOrderNormalized,
  TablePropColumnVisibility,
  TableProps,
} from './TableProps';

export interface TableComputedValues<T> extends TableProps<T> {
  computedPinnedStartColumns: TableComputedColumn<T>[];
  computedPinnedEndColumns: TableComputedColumn<T>[];
  computedUnpinnedColumns: TableComputedColumn<T>[];
  computedVisibleColumns: TableComputedColumn<T>[];
  computedVisibleColumnsMap: Map<string, TableComputedColumn<T>>;
  computedColumnVisibility: TablePropColumnVisibility;
  computedColumnOrder: TablePropColumnOrderNormalized;
  computedPinnedStartColumnsWidth: number;
  computedPinnedEndColumnsWidth: number;
  computedUnpinnedColumnsWidth: number;
  computedUnpinnedOffset: number;
  computedPinnedEndOffset: number;
  computedRemainingSpace: number;
  showZebraRows: boolean;
  unpinnedColumnRenderCount: number;
  columnRenderStartIndex: number;
  setColumnPinning: (columnPinning: TablePropColumnPinning) => void;
  setColumnOrder: (columnOrder: TablePropColumnOrder) => void;
  setColumnVisibility: (columnVisibility: TablePropColumnVisibility) => void;
}
