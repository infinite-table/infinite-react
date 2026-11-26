/**
 * The body cells' render function of the Vue and Angular roots (React:
 * renderCell in useCellRendering): the values it is memoized on and the
 * props of each cell. The roots wrap the props in their own cell component.
 */
import type { DataSourceState } from '../../DataSource/types';
import type { RowInfoStore } from '../../DataSource/RowInfoStore';
import type { TableRenderCellFnParam } from '../../HeadlessTable/rendererTypes';
import type { GridMouseEvent } from '../../types/DOMTypes';
import type { InfiniteTableColumnRenderingContext } from '../components/InfiniteTableRow/columnRenderingContextType';
import type { computeRowHeightWithCache } from '../hooks/computedRowHeightShared';
import type {
  InfiniteTableApi,
  InfiniteTableComputedColumn,
  InfiniteTableRowInfo,
  InfiniteTableState,
} from '../types';
import type {
  InfiniteTablePropCellClassName,
  InfiniteTablePropCellStyle,
  InfiniteTablePropRepaintCellsKey,
  InfiniteTablePropRowClassName,
  InfiniteTablePropRowStyle,
} from '../types/InfiniteTableProps';

/**
 * The DataSource values a cell reads during its render: a cell prop, so
 * that all cells re-render when one of them changes (React: the
 * dataSourceStatePartialForCell useMemo)
 */
export type DataSourceStatePartialForCell = {
  isNodeReadOnly: unknown;
  selectionMode: unknown;
  cellSelection: unknown;
};

/**
 * The props of a body cell, the same in both frameworks (Vue adds the
 * domRef, Angular the editor renderer).
 */
export type ColumnCellRenderProps<T> = {
  rowIndex: number;
  rowHeight: number;
  width: number;
  hidden: boolean;
  column: InfiniteTableComputedColumn<T>;
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;
  showZebraRows: boolean;
  rowDetailState: false | 'collapsed' | 'expanded';
  inEditMode: boolean;
  rowIndexInHorizontalLayoutPage: number | null;
  horizontalLayoutPageIndex: number | null;
  rowStyle?: InfiniteTablePropRowStyle<T>;
  rowClassName?: InfiniteTablePropRowClassName<T>;
  cellStyle?: InfiniteTablePropCellStyle<T>;
  cellClassName?: InfiniteTablePropCellClassName<T>;
  /** the column-level key if present, otherwise the table-level one */
  repaintCellsKey?: InfiniteTablePropRepaintCellsKey<T>;
  getData: () => InfiniteTableRowInfo<T>[];
  rowInfoStore: RowInfoStore<T>;
  renderingContext: InfiniteTableColumnRenderingContext<T>;
  getComputedVisibleColumns: () => InfiniteTableComputedColumn<T>[];
  getComputedColumnOrder: () => string[];
  dataSourceStatePartial: DataSourceStatePartialForCell;
  onMouseEnter: (event: GridMouseEvent) => void;
  onMouseLeave: (event: GridMouseEvent) => void;
};

/**
 * The deps of the render function, read in a reactive context. NOT the data
 * array (cells read it lazily, with getData): a data update doesn't produce
 * a new render function, so it doesn't re-render every cell - per-row
 * updates reach the cells through their rowInfoStore subscriptions.
 */
export function getRenderCellDeps<T>(
  s: InfiniteTableState<T>,
  ds: DataSourceState<T>,
  computedColumns: unknown,
  dataSourceStatePartial: DataSourceStatePartialForCell,
): unknown[] {
  return [
    computedColumns,
    s.rowHeight,
    s.rowDetailHeight,
    s.onRowMouseEnter,
    s.onRowMouseLeave,
    s.isRowDetailExpanded,
    s.isRowDetailEnabled,
    s.groupRenderStrategy,
    s.wrapRowsHorizontally,
    s.showZebraRows,
    s.brain,
    s.rowStyle,
    s.rowClassName,
    s.cellStyle,
    s.cellClassName,
    s.repaintCellsKey,
    s.editingCell,
    s.updatedAt,
    ds.rowInfoStore,
    dataSourceStatePartial,
  ];
}

/**
 * Returns the props of each cell (null: no cell to render), for the values
 * the render function is created with.
 */
export function createGetColumnCellProps<T>(params: {
  // read when the render function is created (its deps changed)
  computedColumns: {
    computedVisibleColumns: InfiniteTableComputedColumn<T>[];
    computedColumnsMap: Map<string, InfiniteTableComputedColumn<T>>;
    fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;
  };
  state: InfiniteTableState<T>;
  rowInfoStore: RowInfoStore<T>;
  dataSourceStatePartial: DataSourceStatePartialForCell;
  // stable
  getData: () => InfiniteTableRowInfo<T>[];
  getComputedRowHeightResult: () => ReturnType<
    typeof computeRowHeightWithCache
  >;
  api: InfiniteTableApi<T>;
  renderingContext: InfiniteTableColumnRenderingContext<T>;
  getComputedVisibleColumns: () => InfiniteTableComputedColumn<T>[];
  getComputedColumnOrder: () => string[];
}): (cellParams: TableRenderCellFnParam) => ColumnCellRenderProps<T> | null {
  const {
    computedColumns: {
      computedVisibleColumns,
      computedColumnsMap,
      fieldsToColumn,
    },
    state: s,
    rowInfoStore,
    dataSourceStatePartial,
    getData,
    getComputedRowHeightResult,
    api,
    renderingContext,
    getComputedVisibleColumns,
    getComputedColumnOrder,
  } = params;
  const showZebraRows = s.showZebraRows;

  return (cellParams) => {
    const {
      rowIndex,
      colIndex,
      hidden,
      width,
      heightWithRowspan,
      onMouseEnter,
      onMouseLeave,
    } = cellParams;

    const rowInfo = getData()[rowIndex];
    const column = computedVisibleColumns[colIndex];

    if (!rowInfo || !column) {
      return null;
    }

    // when rows have details, the brain sizes the row as row + detail, so
    // the cell takes its own height from the row size cache - otherwise it
    // would cover the detail
    const computedRowSizeCacheForDetails =
      getComputedRowHeightResult().computedRowSizeCacheForDetails;
    const rowHeight = computedRowSizeCacheForDetails
      ? computedRowSizeCacheForDetails.getRowHeight(rowIndex)
      : heightWithRowspan;

    let rowDetailState: false | 'collapsed' | 'expanded' = false;
    const isRowDetailsEnabled = s.isRowDetailEnabled;
    const isRowDetailsExpanded = s.isRowDetailExpanded;
    if (
      !isRowDetailsEnabled ||
      (typeof isRowDetailsEnabled === 'function' &&
        !isRowDetailsEnabled(rowInfo))
    ) {
      rowDetailState = false;
    } else if (isRowDetailsExpanded) {
      rowDetailState = isRowDetailsExpanded(rowInfo) ? 'expanded' : 'collapsed';
    }

    // whether THIS cell is in edit mode - a prop (like React), so an editing
    // start/stop re-renders exactly the affected cell
    const inEditMode = api.isEditorVisibleForCell({
      rowIndex,
      columnId: column.id,
    });

    return {
      rowIndex,
      rowHeight,
      width,
      hidden,
      column,
      columnsMap: computedColumnsMap,
      fieldsToColumn,
      showZebraRows,
      rowDetailState,
      inEditMode,
      rowIndexInHorizontalLayoutPage: s.wrapRowsHorizontally
        ? s.brain.getRowIndexInPage(rowIndex)
        : null,
      horizontalLayoutPageIndex: s.wrapRowsHorizontally
        ? s.brain.getPageIndexForRow(rowIndex)
        : null,
      rowStyle: s.rowStyle as any,
      rowClassName: s.rowClassName as any,
      cellStyle: s.cellStyle as any,
      cellClassName: s.cellClassName as any,
      // the column-level key wins over the table-level one
      repaintCellsKey:
        column.repaintCellsKey !== undefined
          ? column.repaintCellsKey
          : s.repaintCellsKey,
      getData,
      rowInfoStore,
      renderingContext,
      getComputedVisibleColumns,
      getComputedColumnOrder,
      dataSourceStatePartial,
      onMouseEnter,
      onMouseLeave,
    };
  };
}
