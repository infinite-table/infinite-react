import type { MatrixBrainOptions } from '../../VirtualBrain/MatrixBrain';
import { MultiCellSelector } from '../utils/MultiCellSelector';
import { MultiRowSelector } from '../utils/MultiRowSelector';

import type { InfiniteTableComputedColumn } from './InfiniteTableColumn';
import type { InfiniteTablePropColumnOrderNormalized } from './InfiniteTableProps';

export interface InfiniteTableComputedValues<T> {
  scrollbars: {
    vertical: boolean;
    horizontal: boolean;
  };
  multiRowSelector: MultiRowSelector;
  multiCellSelector: MultiCellSelector;

  renderSelectionCheckBox: boolean;
  rowspan?: MatrixBrainOptions['rowspan'];
  computedPinnedStartOverflow: boolean;
  computedPinnedEndOverflow: boolean;
  computedPinnedStartColumns: InfiniteTableComputedColumn<T>[];
  computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
  computedUnpinnedColumns: InfiniteTableComputedColumn<T>[];
  computedVisibleColumns: InfiniteTableComputedColumn<T>[];
  computedVisibleColumnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  computedColumnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  computedColumnsMapInInitialOrder: Map<string, InfiniteTableComputedColumn<T>>;
  // computedColumnVisibility: InfiniteTablePropColumnVisibility;
  computedColumnOrder: InfiniteTablePropColumnOrderNormalized;
  computedPinnedStartColumnsWidth: number;
  computedPinnedStartWidth: number;
  computedPinnedEndColumnsWidth: number;
  computedPinnedEndWidth: number;
  computedUnpinnedColumnsWidth: number;
  computedUnpinnedOffset: number;
  computedPinnedEndOffset: number;
  computedRemainingSpace: number;
  fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;
  toggleGroupRow: (groupKeys: any[]) => void;
  columnSize: (colIndex: number) => number;
  // setColumnPinning: (columnPinning: InfiniteTablePropColumnPinning) => void;
  // setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => void;
  // setColumnVisibility: (
  //   columnVisibility: InfiniteTablePropColumnVisibility,
  // ) => void;
}
