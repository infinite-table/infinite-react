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
  InfiniteTablePropsSortable,
} from '../types/InfiniteTableProps';
import type { GetComputedColumnsResult } from '../utils/getComputedColumns';
import { getComputedColumns } from '../utils/getComputedColumns';

import { useRerenderOnKeyChange } from './useRerenderOnKeyChange';

type UseComputedColumnsParam<T> = {
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
  columnDefaultFlex?: number;
  sortable?: InfiniteTablePropsSortable<T>;
  draggableColumns?: boolean;
  multiSort: boolean;
  sortInfo?: DataSourceSingleSortInfo<T>[];

  filterValue?: DataSourcePropFilterValue<T>;
  filterTypes?: DataSourceProps<T>['filterTypes'];

  editable: InfiniteTablePropsEditable<T>;
  columnDefaultEditable?: InfiniteTableProps<T>['columnDefaultEditable'];
  columnDefaultFilterable?: InfiniteTableProps<T>['columnDefaultFilterable'];
  columnDefaultSortable?: InfiniteTableProps<T>['columnDefaultSortable'];
  columnPinning: InfiniteTablePropColumnPinning;
  columnSizing: InfiniteTablePropColumnSizing;
  columnTypes: InfiniteTablePropColumnTypes<T>;
  columnOrder: InfiniteTablePropColumnOrder;
  columnVisibility: InfiniteTablePropColumnVisibility;
  columnVisibilityAssumeVisible?: boolean;
};

type UseComputedVisibleColumnsResult<T> = {
  renderSelectionCheckBox: boolean;
  columns: UseComputedColumnsParam<T>['columns'];
  fieldsToColumn: GetComputedColumnsResult<T>['fieldsToColumn'];

  computedColumnsMap: GetComputedColumnsResult<T>['computedColumnsMap'];
  computedColumnsMapInInitialOrder: GetComputedColumnsResult<T>['computedColumnsMapInInitialOrder'];
  computedRemainingSpace: GetComputedColumnsResult<T>['computedRemainingSpace'];
  computedUnpinnedOffset: GetComputedColumnsResult<T>['computedUnpinnedOffset'];
  computedPinnedEndOffset: GetComputedColumnsResult<T>['computedPinnedEndOffset'];

  computedPinnedStartColumnsWidth: GetComputedColumnsResult<T>['computedPinnedStartColumnsWidth'];
  computedPinnedEndColumnsWidth: GetComputedColumnsResult<T>['computedPinnedEndColumnsWidth'];
  computedUnpinnedColumnsWidth: GetComputedColumnsResult<T>['computedUnpinnedColumnsWidth'];

  computedPinnedStartColumns: GetComputedColumnsResult<T>['computedPinnedStartColumns'];
  computedPinnedEndColumns: GetComputedColumnsResult<T>['computedPinnedEndColumns'];
  computedUnpinnedColumns: GetComputedColumnsResult<T>['computedUnpinnedColumns'];

  computedVisibleColumns: GetComputedColumnsResult<T>['computedVisibleColumns'];
  computedVisibleColumnsMap: GetComputedColumnsResult<T>['computedVisibleColumnsMap'];
  computedPinnedEndWidth: GetComputedColumnsResult<T>['computedPinnedEndWidth'];
  computedPinnedStartWidth: GetComputedColumnsResult<T>['computedPinnedStartWidth'];

  computedColumnOrder: GetComputedColumnsResult<T>['computedColumnOrder'];
};

export const useComputedColumns = <T extends unknown>({
  columns,
  bodySize,
  columnMinWidth,
  columnMaxWidth,
  columnDefaultWidth,
  columnDefaultFlex,
  sortable,
  columnCssEllipsis,
  columnHeaderCssEllipsis,
  draggableColumns,
  sortInfo,
  multiSort,
  filterValue,
  filterTypes,
  columnOrder,
  columnPinning,
  editable,
  columnDefaultEditable,
  columnDefaultFilterable,
  columnDefaultSortable,
  scrollbarWidth,
  columnTypes,
  pinnedEndMaxWidth,
  pinnedStartMaxWidth,
  viewportReservedWidth,
  resizableColumns,
  columnVisibility,
  columnVisibilityAssumeVisible,
  columnSizing,
}: UseComputedColumnsParam<T>): UseComputedVisibleColumnsResult<T> => {
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
    return getComputedColumns({
      columns,
      scrollbarWidth,

      bodySize,
      columnMinWidth,
      columnMaxWidth,
      columnDefaultWidth,
      columnDefaultFlex,
      columnCssEllipsis,
      columnHeaderCssEllipsis,
      viewportReservedWidth,
      resizableColumns,

      filterValue,
      filterTypes,

      sortable,
      sortInfo,
      multiSort,
      pinnedEndMaxWidth,
      pinnedStartMaxWidth,

      draggableColumns,
      columnOrder,

      columnPinning,
      columnDefaultEditable,
      columnDefaultFilterable,
      columnDefaultSortable,
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
