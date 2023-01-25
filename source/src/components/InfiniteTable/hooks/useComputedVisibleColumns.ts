import { useMemo } from 'react';

import type {
  DataSourcePropFilterValue,
  DataSourceProps,
  DataSourceSingleSortInfo,
} from '../../DataSource/types';
import type { Size } from '../../types/Size';
import type { InfiniteTableColumn } from '../types';
import type {
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumnTypes,
  InfiniteTablePropColumnVisibility,
  InfiniteTableProps,
  InfiniteTablePropsEditable,
} from '../types/InfiniteTableProps';
import type { GetComputedVisibleColumnsResult } from '../utils/getComputedVisibleColumns';
import { getComputedVisibleColumns } from '../utils/getComputedVisibleColumns';

import { useRerenderOnKeyChange } from './useRerenderOnKeyChange';

type UseComputedVisibleColumnsParam<T> = {
  columns: Map<string, InfiniteTableColumn<T>>;

  bodySize: Size;
  columnMinWidth?: number;
  columnMaxWidth?: number;
  columnCssEllipsis: boolean;
  columnHeaderCssEllipsis: boolean;
  viewportReservedWidth?: number;

  resizableColumns: boolean | undefined;
  scrollbarWidth: number | undefined;

  pinnedEndMaxWidth?: number;
  pinnedStartMaxWidth?: number;

  columnDefaultWidth?: number;
  sortable?: boolean;
  draggableColumns?: boolean;
  multiSort: boolean;
  sortInfo?: DataSourceSingleSortInfo<T>[];
  setSortInfo: (sortInfo: DataSourceSingleSortInfo<T>[]) => void;

  filterValue?: DataSourcePropFilterValue<T>;
  filterTypes?: DataSourceProps<T>['filterTypes'];

  editable: InfiniteTablePropsEditable<T>;
  columnDefaultEditable?: InfiniteTableProps<T>['columnDefaultEditable'];
  columnDefaultFilterable?: InfiniteTableProps<T>['columnDefaultFilterable'];
  columnPinning: InfiniteTablePropColumnPinning;
  columnSizing: InfiniteTablePropColumnSizing;
  columnTypes: InfiniteTablePropColumnTypes<T>;
  columnOrder: InfiniteTablePropColumnOrder;
  columnVisibility: InfiniteTablePropColumnVisibility;
  columnVisibilityAssumeVisible?: boolean;
};

type UseComputedVisibleColumnsResult<T> = {
  renderSelectionCheckBox: boolean;
  columns: UseComputedVisibleColumnsParam<T>['columns'];
  fieldsToColumn: GetComputedVisibleColumnsResult<T>['fieldsToColumn'];

  computedColumnsMap: GetComputedVisibleColumnsResult<T>['computedColumnsMap'];
  computedColumnsMapInInitialOrder: GetComputedVisibleColumnsResult<T>['computedColumnsMapInInitialOrder'];
  computedRemainingSpace: GetComputedVisibleColumnsResult<T>['computedRemainingSpace'];
  computedUnpinnedOffset: GetComputedVisibleColumnsResult<T>['computedUnpinnedOffset'];
  computedPinnedEndOffset: GetComputedVisibleColumnsResult<T>['computedPinnedEndOffset'];

  computedPinnedStartColumnsWidth: GetComputedVisibleColumnsResult<T>['computedPinnedStartColumnsWidth'];
  computedPinnedEndColumnsWidth: GetComputedVisibleColumnsResult<T>['computedPinnedEndColumnsWidth'];
  computedUnpinnedColumnsWidth: GetComputedVisibleColumnsResult<T>['computedUnpinnedColumnsWidth'];

  computedPinnedStartColumns: GetComputedVisibleColumnsResult<T>['computedPinnedStartColumns'];
  computedPinnedEndColumns: GetComputedVisibleColumnsResult<T>['computedPinnedEndColumns'];
  computedUnpinnedColumns: GetComputedVisibleColumnsResult<T>['computedUnpinnedColumns'];

  computedVisibleColumns: GetComputedVisibleColumnsResult<T>['computedVisibleColumns'];
  computedVisibleColumnsMap: GetComputedVisibleColumnsResult<T>['computedVisibleColumnsMap'];
  computedPinnedEndWidth: GetComputedVisibleColumnsResult<T>['computedPinnedEndWidth'];
  computedPinnedStartWidth: GetComputedVisibleColumnsResult<T>['computedPinnedStartWidth'];

  computedColumnOrder: GetComputedVisibleColumnsResult<T>['computedColumnOrder'];
};

export const useComputedVisibleColumns = <T extends unknown>({
  columns,
  bodySize,
  columnMinWidth,
  columnMaxWidth,
  columnDefaultWidth,
  sortable,
  columnCssEllipsis,
  columnHeaderCssEllipsis,
  draggableColumns,
  sortInfo,
  multiSort,
  setSortInfo,
  filterValue,
  filterTypes,
  columnOrder,
  columnPinning,
  editable,
  columnDefaultEditable,
  columnDefaultFilterable,
  scrollbarWidth,
  columnTypes,
  pinnedEndMaxWidth,
  pinnedStartMaxWidth,
  viewportReservedWidth,
  resizableColumns,
  columnVisibility,
  columnVisibilityAssumeVisible,
  columnSizing,
}: UseComputedVisibleColumnsParam<T>): UseComputedVisibleColumnsResult<T> => {
  const columnsRenderId = useRerenderOnKeyChange(columns);

  const {
    computedRemainingSpace,
    computedColumnOrder,
    computedVisibleColumns,
    computedVisibleColumnsMap,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedUnpinnedColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedUnpinnedColumnsWidth,
    computedUnpinnedOffset,
    computedPinnedEndOffset,
    computedPinnedEndWidth,
    computedPinnedStartWidth,
    renderSelectionCheckBox,
    computedColumnsMap,
    computedColumnsMapInInitialOrder,
    fieldsToColumn,
  } = useMemo(() => {
    return getComputedVisibleColumns({
      columns,
      scrollbarWidth,

      bodySize,
      columnMinWidth,
      columnMaxWidth,
      columnDefaultWidth,
      columnCssEllipsis,
      columnHeaderCssEllipsis,
      viewportReservedWidth,
      resizableColumns,

      filterValue,
      filterTypes,

      sortable,
      sortInfo,
      setSortInfo,
      multiSort,
      pinnedEndMaxWidth,
      pinnedStartMaxWidth,

      draggableColumns,
      columnOrder,

      columnPinning,
      columnDefaultEditable,
      columnDefaultFilterable,
      editable,

      columnSizing,
      columnTypes,

      columnVisibility,
      columnVisibilityAssumeVisible: columnVisibilityAssumeVisible ?? true,
    });
  }, [
    columns,

    bodySize.width,
    columnMinWidth,
    columnMaxWidth,
    columnDefaultWidth,

    viewportReservedWidth,
    scrollbarWidth,

    sortable,
    sortInfo,
    setSortInfo,
    multiSort,

    filterValue,
    filterTypes,

    columnOrder,
    columnVisibility,
    columnVisibilityAssumeVisible,
    resizableColumns,

    pinnedEndMaxWidth,
    pinnedStartMaxWidth,

    columnSizing,
    columnTypes,

    columnPinning,
    columnDefaultEditable,
    columnDefaultFilterable,
    editable,

    columnsRenderId,
  ]);

  const result: UseComputedVisibleColumnsResult<T> = {
    renderSelectionCheckBox,
    columns,
    computedColumnsMap,
    computedPinnedEndWidth,
    computedPinnedStartWidth,
    computedRemainingSpace,
    computedUnpinnedOffset,
    computedPinnedEndOffset,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedUnpinnedColumnsWidth,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedUnpinnedColumns,
    computedVisibleColumns,
    computedVisibleColumnsMap,
    computedColumnOrder,
    computedColumnsMapInInitialOrder,
    fieldsToColumn,
  };

  return result;
};
