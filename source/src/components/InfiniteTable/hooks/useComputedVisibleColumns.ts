import { useMemo } from 'react';

import type {
  DataSourcePropFilterValue,
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

  pinnedEndMaxWidth?: number;
  pinnedStartMaxWidth?: number;

  columnDefaultWidth?: number;
  sortable?: boolean;
  draggableColumns?: boolean;
  multiSort: boolean;
  sortInfo?: DataSourceSingleSortInfo<T>[];
  setSortInfo: (sortInfo: DataSourceSingleSortInfo<T>[]) => void;

  filterValue?: DataSourcePropFilterValue<T>;

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
  columnOrder,
  columnPinning,
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
    fieldsToColumn,
  } = useMemo(() => {
    return getComputedVisibleColumns({
      columns,

      bodySize,
      columnMinWidth,
      columnMaxWidth,
      columnDefaultWidth,
      columnCssEllipsis,
      columnHeaderCssEllipsis,
      viewportReservedWidth,
      resizableColumns,

      filterValue,

      sortable,
      sortInfo,
      setSortInfo,
      multiSort,
      pinnedEndMaxWidth,
      pinnedStartMaxWidth,

      draggableColumns,
      columnOrder,

      columnPinning,

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

    sortable,
    sortInfo,
    setSortInfo,
    multiSort,

    filterValue,

    columnOrder,
    columnVisibility,
    columnVisibilityAssumeVisible,
    resizableColumns,

    pinnedEndMaxWidth,
    pinnedStartMaxWidth,

    columnSizing,
    columnTypes,

    columnPinning,

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
    fieldsToColumn,
  };

  return result;
};
