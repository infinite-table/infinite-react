import { useEffect, useState } from 'react';

import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSourceState';
import { useManagedComponentState } from '../../hooks/useComponentState';
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

export function useComputed<T>(): InfiniteTableComputedValues<T> {
  const { componentActions, componentState } =
    useManagedComponentState<InfiniteTableState<T>>();

  const {
    componentActions: dataSourceActions,
    componentState: dataSourceState,
    getState: getDataSourceState,
    api: dataSourceApi,
  } = useDataSourceContextValue<T>();

  const {
    columnOrder,
    columnVisibility,
    columnPinning,
    columnSizing,
    editable,
    columnDefaultEditable,
    columnDefaultFilterable,
    columnTypes,
    rowHeight,
    rowDetailHeight,
    isRowDetailExpanded: isRowDetailsExpanded,
    isRowDetailEnabled: isRowDetailsEnabled,
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
    componentState.onRowDetailHeightCSSVarChange.onChange((rowDetailHeight) => {
      if (rowDetailHeight) {
        componentActions.rowDetailHeight = rowDetailHeight;
      }
    });
    componentState.onColumnHeaderHeightCSSVarChange.onChange(
      (columnHeaderHeight) => {
        if (columnHeaderHeight) {
          componentActions.columnHeaderHeight = columnHeaderHeight;
        }
      },
    );
  });

  useEffect(() => {
    dataSourceActions.showSeparatePivotColumnForSingleAggregation =
      showSeparatePivotColumnForSingleAggregation;
  }, [showSeparatePivotColumnForSingleAggregation]);

  const { multiSort, filterValue, filterTypes } = dataSourceState;

  const { toggleGroupRow } = useColumnsWhen<T>();

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
    columnCssEllipsis: componentState.columnCssEllipsis,
    columnHeaderCssEllipsis: componentState.columnHeaderCssEllipsis,
    columnMinWidth: componentState.columnMinWidth,
    columnMaxWidth: componentState.columnMaxWidth,
    columnDefaultWidth: componentState.columnDefaultWidth,
    columnDefaultFlex: componentState.columnDefaultFlex,
    columnDefaultSortable: componentState.columnDefaultSortable,
    pinnedStartMaxWidth: componentState.pinnedStartMaxWidth,
    pinnedEndMaxWidth: componentState.pinnedEndMaxWidth,
    bodySize,

    viewportReservedWidth: componentState.viewportReservedWidth,
    resizableColumns: componentState.resizableColumns,

    sortable: componentState.sortable,
    draggableColumns: componentState.draggableColumns,
    sortInfo: dataSourceState.sortInfo ?? undefined,
    multiSort,

    columnOrder,

    columnVisibility,
    columnVisibilityAssumeVisible: true,

    columnPinning,
    editable,
    columnDefaultEditable,
    columnDefaultFilterable,
    filterValue,
    filterTypes,

    columnSizing,
    columnTypes,
  });

  const rowspan = useColumnRowspan(computedVisibleColumns);
  const columnSize = useColumnSizeFn<T>(computedVisibleColumns);
  const scrollbars = useScrollbars<T>(brain);

  const computedPinnedStartOverflow = computedPinnedStartWidth
    ? computedPinnedStartColumnsWidth > computedPinnedStartWidth
    : false;
  const computedPinnedEndOverflow = computedPinnedEndWidth
    ? computedPinnedEndColumnsWidth > computedPinnedEndWidth
    : false;

  const [multiRowSelector] = useState(() => {
    const multiRowSelector = new MultiRowSelector({
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

  return {
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
  };
}
