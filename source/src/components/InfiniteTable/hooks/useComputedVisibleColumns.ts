import { useMemo } from 'react';

import type { DataSourceSingleSortInfo } from '../../DataSource/types';
import type { InfiniteTableColumn } from '../types';
import type {
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnPinningMap,
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumnTypes,
  InfiniteTablePropColumnVisibility,
} from '../types/InfiniteTableProps';
import type { Size } from '../../types/Size';

import { getComputedVisibleColumns } from '../utils/getComputedVisibleColumns';
import type { GetComputedVisibleColumnsResult } from '../utils/getComputedVisibleColumns';
import { useRerenderOnKeyChange } from './useRerenderOnKeyChange';

type UseComputedVisibleColumnsParam<T> = {
  columns: Map<string, InfiniteTableColumn<T>>;

  bodySize: Size;
  columnMinWidth?: number;
  columnMaxWidth?: number;
  columnCssEllipsis: boolean;
  columnHeaderCssEllipsis: boolean;
  viewportReservedWidth?: number;

  pinnedEndMaxWidth?: number;
  pinnedStartMaxWidth?: number;

  columnDefaultWidth?: number;
  sortable?: boolean;
  draggableColumns?: boolean;
  multiSort: boolean;
  sortInfo?: DataSourceSingleSortInfo<T>[];
  setSortInfo: (sortInfo: DataSourceSingleSortInfo<T>[]) => void;

  columnPinning: InfiniteTablePropColumnPinningMap;
  columnSizing: InfiniteTablePropColumnSizing;
  columnTypes: InfiniteTablePropColumnTypes<T>;
  columnOrder: InfiniteTablePropColumnOrder;
  columnVisibility: InfiniteTablePropColumnVisibility;
  columnVisibilityAssumeVisible?: boolean;
};

type UseComputedVisibleColumnsResult<T> = {
  columns: UseComputedVisibleColumnsParam<T>['columns'];

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
  columnOrder,
  columnPinning,
  columnTypes,
  pinnedEndMaxWidth,
  pinnedStartMaxWidth,
  viewportReservedWidth,
  columnVisibility,
  columnVisibilityAssumeVisible,
  columnSizing,
}: UseComputedVisibleColumnsParam<T>): UseComputedVisibleColumnsResult<T> => {
  const columnsRenderId = useRerenderOnKeyChange(columns);

  const pinningRenderId = useRerenderOnKeyChange(columnPinning);

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

    sortable,
    sortInfo,
    setSortInfo,
    multiSort,

    columnOrder,
    columnVisibility,
    columnVisibilityAssumeVisible,

    pinnedEndMaxWidth,
    pinnedStartMaxWidth,

    columnSizing,
    columnTypes,

    columnPinning,

    columnsRenderId,
    pinningRenderId,
  ]);

  const result: UseComputedVisibleColumnsResult<T> = {
    columns,
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
  };

  return result;
};
