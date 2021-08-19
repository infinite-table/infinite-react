import { InfiniteTableState, InfiniteTableComputedValues } from '../types';

import { DataSourceSingleSortInfo } from '../../DataSource/types';
import { useComputedVisibleColumns } from './useComputedVisibleColumns';

import { sortAscending } from '../../../utils/sortAscending';
import { useCallback, useState } from 'react';
import { useColumnAggregations } from './useColumnAggregations';
import { useComponentState } from '../../hooks/useComponentState';
import { InfiniteTableReadOnlyState } from '../types/InfiniteTableState';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useColumnGroups } from './useColumnGroups';

export function useComputed<T>(): InfiniteTableComputedValues<T> {
  const { componentActions, componentState } = useComponentState<
    InfiniteTableState<T>,
    InfiniteTableReadOnlyState<T>
  >();

  const {
    componentActions: dataSourceActions,
    componentState: dataSourceState,
  } = useDataSourceContextValue<T>();

  const { columnOrder, columnVisibility, columnPinning, bodySize } =
    componentState;

  useState(() => {
    componentState.onRowHeightChange.onChange((rowHeight) => {
      if (rowHeight) {
        componentActions.rowHeight = rowHeight;
      }
    });
  });

  useColumnAggregations<T>();
  useColumnGroups<T>();

  const setSortInfo = useCallback(
    (sortInfo: DataSourceSingleSortInfo<T>[]) =>
      (dataSourceActions.sortInfo = sortInfo),
    [],
  );
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
  } = useComputedVisibleColumns({
    columns: componentState.columns,
    columnMinWidth: componentState.columnMinWidth,
    columnMaxWidth: componentState.columnMaxWidth,
    columnDefaultWidth: componentState.columnDefaultWidth,
    bodySize,

    sortable: componentState.sortable,
    draggableColumns: componentState.draggableColumns,
    sortInfo: dataSourceState.sortInfo,
    setSortInfo,

    columnOrder,

    columnVisibility,
    columnVisibilityAssumeVisible: true, //props.columnVisibilityAssumeVisible,

    columnPinning,
  });

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

  return {
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
