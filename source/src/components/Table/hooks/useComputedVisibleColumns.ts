import { useMemo } from 'react';

import type { DataSourceSingleSortInfo } from '../../DataSource/types';
import type { TableColumn } from '../types';
import {
  TablePropColumnOrder,
  TablePropColumnPinning,
  TablePropColumnVisibility,
} from '../types/TableProps';
import type { Size } from '../../types/Size';

import { getComputedVisibleColumns } from '../utils/getComputedVisibleColumns';
import { useColumnPinningRerenderOnKeyChange } from './useColumnPinningRerenderOnKeyChange';
import { useColumnRerenderOnKeyChange } from './useColumnRerenderOnKeyChange';
import { useColumnVisibilityRerenderOnKeyChange } from './useColumnVisibilityRerenderOnKeyChange';
import { dbg } from '../../../utils/debug';

const debug = dbg('useColumns');

export const useComputedVisibleColumns = <T extends unknown>({
  columns,
  bodySize,
  columnMinWidth,
  columnMaxWidth,
  columnDefaultWidth,
  sortable,
  draggableColumns,
  sortInfo,
  setSortInfo,
  columnOrder,
  columnPinning,
  columnVisibility,
  columnVisibilityAssumeVisible,
}: {
  columns: Map<string, TableColumn<T>>;

  bodySize: Size;
  columnMinWidth?: number;
  columnMaxWidth?: number;
  columnDefaultWidth?: number;
  sortable?: boolean;
  draggableColumns?: boolean;
  sortInfo: DataSourceSingleSortInfo<T>[];
  setSortInfo: (sortInfo: DataSourceSingleSortInfo<T>[]) => void;

  columnPinning: TablePropColumnPinning;
  columnOrder: TablePropColumnOrder;
  columnVisibility: TablePropColumnVisibility;
  columnVisibilityAssumeVisible?: boolean;
}) => {
  const columnsRenderId = useColumnRerenderOnKeyChange(columns);
  const visibilityRenderId = useColumnVisibilityRerenderOnKeyChange(
    columnVisibility,
  );
  const pinningRenderId = useColumnPinningRerenderOnKeyChange(columnPinning);

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
  } = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      debug('Computing columns');
    }
    return getComputedVisibleColumns({
      columns,

      bodySize,
      columnMinWidth,
      columnMaxWidth,
      columnDefaultWidth,

      sortable,
      sortInfo,
      setSortInfo,

      draggableColumns,
      columnOrder,

      columnPinning,

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

    columnOrder,
    columnVisibility,
    columnVisibilityAssumeVisible,

    columnPinning,

    columnsRenderId,
    visibilityRenderId,
    pinningRenderId,
  ]);

  return {
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
};
