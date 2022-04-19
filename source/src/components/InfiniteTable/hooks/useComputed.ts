import { useCallback, useEffect, useMemo, useState } from 'react';

import type { InfiniteTableState, InfiniteTableComputedValues } from '../types';
import type { DataSourceSingleSortInfo } from '../../DataSource/types';
import type { MatrixBrainOptions } from '../../VirtualBrain/MatrixBrain';

import { useComputedVisibleColumns } from './useComputedVisibleColumns';
import { getScrollbarWidth } from '../../utils/getScrollbarWidth';
import { useComponentState } from '../../hooks/useComponentState';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useColumnGroups } from './useColumnGroups';
import { useColumnsWhen } from './useColumnsWhen';
import { useColumnSizeFn } from './useColumnSizeFn';

export function useComputed<T>(): InfiniteTableComputedValues<T> {
  const { componentActions, componentState } =
    useComponentState<InfiniteTableState<T>>();

  const {
    componentActions: dataSourceActions,
    componentState: dataSourceState,
    getState: getDataSourceState,
  } = useDataSourceContextValue<T>();

  const {
    columnOrder,
    columnVisibility,
    columnPinning,
    columnSizing,
    columnTypes,
    brain,
    bodySize,
    showSeparatePivotColumnForSingleAggregation,
  } = componentState;

  useState(() => {
    componentState.onRowHeightCSSVarChange.onChange((rowHeight) => {
      if (rowHeight) {
        componentActions.rowHeight = rowHeight;
      }
    });
    componentState.onHeaderHeightCSSVarChange.onChange((headerHeight) => {
      if (headerHeight) {
        componentActions.headerHeight = headerHeight;
      }
    });
  });

  useEffect(() => {
    dataSourceActions.showSeparatePivotColumnForSingleAggregation =
      showSeparatePivotColumnForSingleAggregation;
  }, [showSeparatePivotColumnForSingleAggregation]);

  const { multiSort } = dataSourceState;

  useColumnGroups<T>();

  const { toggleGroupRow } = useColumnsWhen<T>();

  const setSortInfo = useCallback(
    (sortInfo: DataSourceSingleSortInfo<T>[]) => {
      const newSortInfo = multiSort ? sortInfo : sortInfo[0] ?? null;
      //@ts-ignore
      dataSourceActions.sortInfo = newSortInfo;
    },
    [getDataSourceState],
  );

  const columns = componentState.computedColumns;

  const {
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
    computedRemainingSpace,
    computedPinnedStartWidth,
    computedPinnedEndWidth,
  } = useComputedVisibleColumns({
    columns,
    columnCssEllipsis: componentState.columnCssEllipsis,
    columnHeaderCssEllipsis: componentState.columnHeaderCssEllipsis,
    columnMinWidth: componentState.columnMinWidth,
    columnMaxWidth: componentState.columnMaxWidth,
    columnDefaultWidth: componentState.columnDefaultWidth,
    pinnedStartMaxWidth: componentState.pinnedStartMaxWidth,
    pinnedEndMaxWidth: componentState.pinnedEndMaxWidth,
    bodySize,

    viewportReservedWidth: componentState.viewportReservedWidth,

    sortable: componentState.sortable,
    draggableColumns: componentState.draggableColumns,
    sortInfo: dataSourceState.sortInfo ?? undefined,
    multiSort,
    setSortInfo,

    columnOrder,

    columnVisibility,
    columnVisibilityAssumeVisible: true,

    columnPinning,

    columnSizing,
    columnTypes,
  });

  const rowspan = useMemo<MatrixBrainOptions['rowspan']>(() => {
    const colsWithRowspan = computedVisibleColumns.filter(
      (col) => typeof col.rowspan === 'function',
    );

    return colsWithRowspan.length
      ? ({ rowIndex }) => {
          let maxSpan = 1;

          const dataArray = getDataSourceState().dataArray;
          const rowInfo = dataArray[rowIndex];
          const data = rowInfo.data;

          colsWithRowspan.forEach((column) => {
            if (!column.rowspan) {
              return;
            }
            const span = column.rowspan({
              column,
              data,
              dataArray,
              rowInfo,
              rowIndex,
            });

            if (span > maxSpan) {
              maxSpan = span;
            }
          });
          return maxSpan;
        }
      : undefined;
  }, [computedVisibleColumns]);

  const computedPinnedStartOverflow = computedPinnedStartWidth
    ? computedPinnedStartColumnsWidth > computedPinnedStartWidth
    : false;
  const computedPinnedEndOverflow = computedPinnedEndWidth
    ? computedPinnedEndColumnsWidth > computedPinnedEndWidth
    : false;

  const columnSize = useColumnSizeFn<T>(computedVisibleColumns);

  const hasHorizontalScrollbar =
    computedUnpinnedColumnsWidth >
    bodySize.width -
      computedPinnedStartColumnsWidth -
      computedPinnedEndColumnsWidth;

  const reservedContentHeight =
    brain.getTotalSize().height +
    (hasHorizontalScrollbar ? getScrollbarWidth() : 0);

  const hasVerticalScrollbar =
    bodySize.height > 0 && bodySize.height < reservedContentHeight;

  const scrollbars = useMemo(
    () => ({
      vertical: hasVerticalScrollbar,
      horizontal: hasHorizontalScrollbar,
    }),
    [hasVerticalScrollbar, hasHorizontalScrollbar],
  );
  return {
    scrollbars,
    columnSize,
    rowspan,
    toggleGroupRow,
    computedPinnedStartOverflow,
    computedPinnedEndOverflow,
    computedPinnedStartWidth,
    computedPinnedEndWidth,
    computedVisibleColumns,
    computedColumnOrder,
    computedRemainingSpace,
    computedVisibleColumnsMap,
    computedColumnVisibility: columnVisibility,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedUnpinnedColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedUnpinnedColumnsWidth,
    computedUnpinnedOffset,
    computedPinnedEndOffset,
  };
}
