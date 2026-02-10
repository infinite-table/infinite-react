import { useEffect, useMemo, useState } from 'react';

import { useLatest } from '../../hooks/useLatest';
import type { InfiniteTableState, InfiniteTableComputedValues } from '../types';
import { MultiCellSelector } from '../utils/MultiCellSelector';
import { MultiRowSelector } from '../utils/MultiRowSelector';

import { useColumnRowspan } from './useColumnRowspan';
import { useColumnSizeFn } from './useColumnSizeFn';
import { useColumnsWhen } from './useColumnsWhen';
import { useComputedColumns } from './useComputedColumns';
import { useComputedRowHeight } from './useComputedRowHeight';
import { useScrollbars } from './useScrollbars';
import { DataSourceState, useDataSourceSelector } from '../../DataSource';
import { InfiniteTableActions } from '../types/InfiniteTableState';

export function useComputed<T>(options: {
  state: InfiniteTableState<T>;
  actions: InfiniteTableActions<T>;
  getState: () => InfiniteTableState<T>;
}): InfiniteTableComputedValues<T> {
  const { state, actions, getState } = options;
  const {
    columnOrder,
    columnCssEllipsis,
    columnHeaderCssEllipsis,
    columnMinWidth,
    columnMaxWidth,
    columnDefaultWidth,
    columnDefaultFlex,
    columnDefaultSortable,
    columnDefaultDraggable,
    pinnedStartMaxWidth,
    pinnedEndMaxWidth,
    columnVisibility,
    columnPinning,
    columnSizing,
    editable,
    columnDefaultEditable,
    columnDefaultFilterable,
    columnDefaultGroupable,
    columnTypes,
    rowHeight,
    rowDetailHeight,
    isRowDetailExpanded: isRowDetailsExpanded,
    isRowDetailEnabled: isRowDetailsEnabled,
    bodySize,
    showSeparatePivotColumnForSingleAggregation,
    onRowHeightCSSVarChange,
    onFlashingDurationCSSVarChange,
    onRowDetailHeightCSSVarChange,
    onColumnHeaderHeightCSSVarChange,

    computedColumns,
    viewportReservedWidth,
    resizableColumns,
    sortable,
    draggableColumns,
  } = state;

  const componentActions = actions;

  const {
    multiSort,
    filterValue,
    filterTypes,
    groupBy,
    sortInfo,
    dataSourceActions,
    getDataSourceState,
    dataSourceApi,
  } = useDataSourceSelector((ctx) => {
    return {
      dataSourceActions: ctx.dataSourceActions,
      getDataSourceState: ctx.getDataSourceState as () => DataSourceState<T>,
      dataSourceApi: ctx.dataSourceApi,
      sortInfo: ctx.dataSourceState.sortInfo as DataSourceState<T>['sortInfo'],
      multiSort: ctx.dataSourceState.multiSort,
      filterValue: ctx.dataSourceState
        .filterValue as DataSourceState<T>['filterValue'],
      filterTypes: ctx.dataSourceState.filterTypes,
      groupBy: ctx.dataSourceState.groupBy as DataSourceState<T>['groupBy'],
    };
  });

  useState(() => {
    onRowHeightCSSVarChange.onChange((rowHeight) => {
      if (rowHeight) {
        componentActions.rowHeight = rowHeight;
      }
    });
    onFlashingDurationCSSVarChange.onChange((flashingDuration) => {
      const num = flashingDuration ? flashingDuration * 1 : null;
      if (num != null && !isNaN(num)) {
        componentActions.flashingDurationCSSVarValue = num;
      }
    });
    onRowDetailHeightCSSVarChange.onChange((rowDetailHeight) => {
      if (rowDetailHeight) {
        componentActions.rowDetailHeight = rowDetailHeight;
      }
    });
    onColumnHeaderHeightCSSVarChange.onChange((columnHeaderHeight) => {
      if (columnHeaderHeight) {
        componentActions.columnHeaderHeight = columnHeaderHeight;
      }
    });
  });

  useEffect(() => {
    dataSourceActions.showSeparatePivotColumnForSingleAggregation =
      showSeparatePivotColumnForSingleAggregation;
  }, [showSeparatePivotColumnForSingleAggregation]);

  // const { multiSort, filterValue, filterTypes, groupBy } = dataSourceState;

  const { toggleGroupRow } = useColumnsWhen<T>(state, actions);

  const columns = computedColumns;

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
    renderSelectionCheckBox,
    computedColumnsMap,
    computedColumnsMapInInitialOrder,
    fieldsToColumn,
  } = useComputedColumns({
    columns,
    // scrollbarWidth: scrollbars.vertical ? getScrollbarWidth() : 0,

    // #scrollbarverticaltag
    // we use the default scrollbar width - using it dynamically causes issues
    // since we can have a scenario where there is no vertical scrollbar and a horizontal resize
    // can cause a horizontal scrollbar which in turn causes a vertical scrollbar and the scenario
    // can loop so it's safer for now to always reserve space for the scrollbar
    scrollbarWidth: undefined,
    columnCssEllipsis,
    columnHeaderCssEllipsis,
    columnMinWidth,
    columnMaxWidth,
    columnDefaultWidth,
    columnDefaultFlex,
    columnDefaultSortable,
    columnDefaultDraggable,
    pinnedStartMaxWidth,
    pinnedEndMaxWidth,
    bodySize,

    viewportReservedWidth,
    resizableColumns,

    sortable,
    draggableColumns,
    sortInfo: sortInfo ?? undefined,
    multiSort,

    groupBy,
    columnOrder,

    columnVisibility,
    columnVisibilityAssumeVisible: true,

    columnPinning,
    editable,
    columnDefaultEditable,
    columnDefaultFilterable,
    columnDefaultGroupable,
    filterValue,
    filterTypes,

    columnSizing,
    columnTypes,
  });

  const rowspan = useColumnRowspan(computedVisibleColumns);
  const columnSize = useColumnSizeFn<T>(computedVisibleColumns);
  const scrollbars = useScrollbars<T>(getState);

  const computedPinnedStartOverflow = computedPinnedStartWidth
    ? computedPinnedStartColumnsWidth > computedPinnedStartWidth
    : false;
  const computedPinnedEndOverflow = computedPinnedEndWidth
    ? computedPinnedEndColumnsWidth > computedPinnedEndWidth
    : false;

  const [multiRowSelector] = useState(() => {
    const multiRowSelector = new MultiRowSelector({
      isRowDisabledAt: (index: number) => {
        const dataItem = getDataSourceState().dataArray[index];
        return dataItem?.rowDisabled ?? false;
      },
      getIdForIndex: (index: number) => {
        const dataItem = getDataSourceState().dataArray[index];

        return dataItem?.id ?? -1;
      },
    });

    return multiRowSelector;
  });

  const getComputedVisibleColumns = useLatest(computedVisibleColumns);

  const [multiCellSelector] = useState(() => {
    return new MultiCellSelector({
      getPrimaryKeyByIndex: dataSourceApi.getPrimaryKeyByIndex,
      getColumnIdByIndex: (colIndex: number) => {
        return getComputedVisibleColumns()[colIndex]?.id || '';
      },
    });
  });

  const { computedRowHeight, computedRowSizeCacheForDetails } =
    useComputedRowHeight<T>({
      rowDetailHeight,
      rowHeight,
      isRowDetailsExpanded,
      isRowDetailsEnabled,
      getDataSourceState,
    });

  return useMemo(
    () => ({
      multiRowSelector,
      multiCellSelector,
      computedRowSizeCacheForDetails,
      computedRowHeight,
      scrollbars,
      columnSize,
      rowspan,
      toggleGroupRow,
      computedColumnsMap,
      computedColumnsMapInInitialOrder,
      renderSelectionCheckBox,
      computedPinnedStartOverflow,
      computedPinnedEndOverflow,
      computedPinnedStartWidth,
      computedPinnedEndWidth,
      computedVisibleColumns,
      computedColumnOrder,
      computedRemainingSpace,
      computedVisibleColumnsMap,
      // computedColumnVisibility: columnVisibility,
      computedPinnedStartColumns,
      computedPinnedEndColumns,
      computedUnpinnedColumns,
      computedPinnedStartColumnsWidth,
      computedPinnedEndColumnsWidth,
      computedUnpinnedColumnsWidth,
      computedUnpinnedOffset,
      computedPinnedEndOffset,
      fieldsToColumn,
    }),
    [
      multiRowSelector,
      multiCellSelector,
      computedRowSizeCacheForDetails,
      computedRowHeight,
      scrollbars,
      columnSize,
      rowspan,
      toggleGroupRow,
      computedColumnsMap,
      computedColumnsMapInInitialOrder,
      renderSelectionCheckBox,
      computedPinnedStartOverflow,
      computedPinnedEndOverflow,
      computedPinnedStartWidth,
      computedPinnedEndWidth,
      computedVisibleColumns,
      computedColumnOrder,
      computedRemainingSpace,
      computedVisibleColumnsMap,
      computedPinnedStartColumns,
      computedPinnedEndColumns,
      computedUnpinnedColumns,
      computedPinnedStartColumnsWidth,
      computedPinnedEndColumnsWidth,
      computedUnpinnedColumnsWidth,
      computedUnpinnedOffset,
      computedPinnedEndOffset,
      fieldsToColumn,
    ],
  );
}
