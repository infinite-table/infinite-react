import { InfiniteTableState, InfiniteTableComputedValues } from '../types';

import { DataSourceSingleSortInfo } from '../../DataSource/types';
import { useComputedVisibleColumns } from './useComputedVisibleColumns';

import { sortAscending } from '../../../utils/DeepMap/sortAscending';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useComponentState } from '../../hooks/useComponentState';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useColumnGroups } from './useColumnGroups';
import { useColumnsWhen } from './useColumnsWhen';
import type { VirtualBrainOptions } from '../../VirtualBrain';

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
    columnVisibilityAssumeVisible: true, //props.columnVisibilityAssumeVisible,

    columnPinning,

    columnSizing,
    columnTypes,
  });

  const rowSpan = useMemo<VirtualBrainOptions['itemSpan']>(() => {
    const colsWithRowspan = computedVisibleColumns.filter(
      (col) => typeof col.rowspan === 'function',
    );

    return colsWithRowspan.length
      ? ({ itemIndex }) => {
          let maxSpan = 1;

          const dataArray = getDataSourceState().dataArray;
          const rowInfo = dataArray[itemIndex];
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
              rowIndex: itemIndex,
            });

            if (span > maxSpan) {
              maxSpan = span;
            }
          });
          return maxSpan;
        }
      : undefined;
  }, [computedVisibleColumns]);

  const unpinnedColumnWidths = computedUnpinnedColumns.map(
    (c) => c.computedWidth,
  );

  // // const columnVirtualBrain = React.useMemo(() => {
  // const brain = new VirtualBrain({
  //   count: columnWidths.length,
  //   itemMainAxisSize: (itemIndex: number) => columnWidths[itemIndex],
  //   mainAxis: 'horizontal',
  // });
  // // }, columnSizes);

  let sortedUnpinnedColumnWidths: number[] = [...unpinnedColumnWidths].sort(
    sortAscending,
  );

  let unpinnedColumnRenderCount = 0;
  let colWidthSum = 0;

  const unpinnedViewportSize =
    bodySize.width -
    computedPinnedEndColumnsWidth -
    computedPinnedStartColumnsWidth;
  while (unpinnedViewportSize > 0 && colWidthSum <= unpinnedViewportSize) {
    colWidthSum += sortedUnpinnedColumnWidths[unpinnedColumnRenderCount];
    unpinnedColumnRenderCount++;
  }
  if (unpinnedViewportSize > 0) {
    unpinnedColumnRenderCount++;
  }
  unpinnedColumnRenderCount = Math.min(
    unpinnedColumnRenderCount,
    computedUnpinnedColumns.length,
  );

  let columnRenderStartIndex = 0;

  const scrollLeft = componentState.scrollPosition.scrollLeft;

  colWidthSum = 0;
  while (colWidthSum < scrollLeft) {
    colWidthSum += unpinnedColumnWidths[columnRenderStartIndex];
    columnRenderStartIndex++;
  }
  if (colWidthSum > scrollLeft) {
    columnRenderStartIndex--;
  }

  const computedPinnedStartOverflow = computedPinnedStartWidth
    ? computedPinnedStartColumnsWidth > computedPinnedStartWidth
    : false;
  const computedPinnedEndOverflow = computedPinnedEndWidth
    ? computedPinnedEndColumnsWidth > computedPinnedEndWidth
    : false;

  return {
    rowSpan,
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
    unpinnedColumnRenderCount,
    columnRenderStartIndex,
  };
}
