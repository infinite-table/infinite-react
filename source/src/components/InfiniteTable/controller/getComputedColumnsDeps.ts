/**
 * The computed columns of the Vue and Angular roots (React:
 * useComputedColumns): the values they are memoized on, and the
 * getComputedColumns call made when one of them changes. Memoized on the
 * same deps as React, so column identities survive unrelated state changes
 * (eg data updates) - cells and header cells rely on stable `column`
 * identities to skip re-rendering.
 *
 * Each root memoizes with its own computedWithDeps.
 */
import type { DataSourceState } from '../../DataSource/types';
import type { InfiniteTableState } from '../types';
import { getComputedColumns } from '../utils/getComputedColumns';

/**
 * The deps of the computed columns - read them in a reactive context.
 */
export function getComputedColumnsDeps<T>(
  s: InfiniteTableState<T>,
  ds: DataSourceState<T>,
): unknown[] {
  return [
    s.computedColumns,
    s.bodySize.width,
    s.columnMinWidth,
    s.columnMaxWidth,
    s.columnDefaultWidth,
    s.columnDefaultFlex,
    s.columnCssEllipsis,
    s.columnHeaderCssEllipsis,
    s.viewportReservedWidth,
    s.resizableColumns,
    ds.filterValue,
    ds.filterTypes,
    s.sortable,
    ds.sortInfo,
    ds.multiSort,
    s.pinnedEndMaxWidth,
    s.pinnedStartMaxWidth,
    s.draggableColumns,
    s.columnDefaultDraggable,
    s.columnOrder,
    s.columnPinning,
    s.columnDefaultEditable,
    s.columnDefaultFilterable,
    s.columnDefaultGroupable,
    s.columnDefaultSortable,
    s.editable,
    s.columnSizing,
    s.columnTypes,
    s.columnVisibility,
    s.initialColumns,
    ds.groupBy,
  ];
}

/**
 * The computed columns for the current state (what the deps above are read
 * from).
 */
export function getComputedColumnsFromState<T>(
  s: InfiniteTableState<T>,
  ds: DataSourceState<T>,
) {
  return getComputedColumns<T>({
    columns: s.computedColumns,
    userColumns: s.initialColumns,
    scrollbarWidth: undefined,
    bodySize: s.bodySize,
    columnMinWidth: s.columnMinWidth,
    columnMaxWidth: s.columnMaxWidth,
    columnDefaultWidth: s.columnDefaultWidth,
    columnDefaultFlex: s.columnDefaultFlex,
    columnCssEllipsis: s.columnCssEllipsis,
    columnHeaderCssEllipsis: s.columnHeaderCssEllipsis,
    viewportReservedWidth: s.viewportReservedWidth,
    resizableColumns: s.resizableColumns,
    filterValue: ds.filterValue,
    filterTypes: ds.filterTypes,
    sortable: s.sortable,
    sortInfo: ds.sortInfo ?? undefined,
    multiSort: ds.multiSort,
    pinnedEndMaxWidth: s.pinnedEndMaxWidth,
    pinnedStartMaxWidth: s.pinnedStartMaxWidth,
    draggableColumns: s.draggableColumns,
    columnDefaultDraggable: s.columnDefaultDraggable,
    columnOrder: s.columnOrder,
    columnPinning: s.columnPinning,
    columnDefaultEditable: s.columnDefaultEditable,
    columnDefaultFilterable: s.columnDefaultFilterable,
    columnDefaultGroupable: s.columnDefaultGroupable,
    columnDefaultSortable: s.columnDefaultSortable,
    editable: s.editable,
    columnSizing: s.columnSizing,
    columnTypes: s.columnTypes,
    columnVisibility: s.columnVisibility,
    columnVisibilityAssumeVisible: true,
    groupBy: ds.groupBy,
  });
}
