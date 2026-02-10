import { Ref, useMemo } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import * as React from 'react';

import {
  TableRenderCellFn,
  TableRenderCellFnParam,
  TableRenderDetailRowFn,
  TableRenderDetailRowFnParam,
} from '../../HeadlessTable/rendererTypes';
import { useLatest } from '../../hooks/useLatest';
import type { Size } from '../../types/Size';
import { InfiniteTableColumnCellProps } from '../components/InfiniteTableRow/InfiniteTableCellTypes';
import { InfiniteTableColumnCell } from '../components/InfiniteTableRow/InfiniteTableColumnCell';
import type {
  InfiniteTableComputedValues,
  InfiniteTableApi,
  InfiniteTableProps,
} from '../types';

import { useYourBrain } from './useYourBrain';
import { InfiniteTableDetailRow } from '../components/InfiniteTableRow/InfiniteTableDetailRow';
import { visibility } from '../utilities.css';
import { useInfiniteTableSelector } from './useInfiniteTableSelector';
import { DataSourceState, useDataSourceSelector } from '../../DataSource';

type CellRenderingParam<T> = {
  computed: InfiniteTableComputedValues<T>;
  domRef: Ref<HTMLElement>;

  imperativeApi: InfiniteTableApi<T>;

  bodySize: Size;

  getComputed: () => InfiniteTableComputedValues<T> | undefined;
};

type CellRenderingResult = {
  renderCell: TableRenderCellFn;
  renderDetailRow: TableRenderDetailRowFn | undefined;
};

const SCROLL_BOTTOM_OFFSET = 1;

export function useCellRendering<T>(
  param: CellRenderingParam<T>,
): CellRenderingResult {
  const { computed, bodySize, imperativeApi } = param;

  const {
    actions,
    getState,
    getComputed,
    getDataSourceMasterContext,
    rowHeight,
    rowDetailHeight,
    onRowMouseEnter,
    onRowMouseLeave,
    groupRenderStrategy,
    brain,
    showZebraRows,
    rowDetailRenderer,
    isRowDetailsExpanded,
    isRowDetailsEnabled,
    cellClassName,
    cellStyle,
    rowStyle,
    rowDetailCache,
    rowClassName,
    onScrollToTop,
    onScrollToBottom,
    onScrollStop,
    scrollToBottomOffset,
    wrapRowsHorizontally,
    updatedAt,
    ready,
    editingCell,
  } = useInfiniteTableSelector((ctx) => {
    return {
      actions: ctx.actions,
      state: ctx.state,
      getState: ctx.getState,
      getComputed: ctx.getComputed,
      getDataSourceMasterContext: ctx.getDataSourceMasterContext,
      rowHeight: ctx.state.rowHeight,
      rowDetailHeight: ctx.state.rowDetailHeight,

      onRowMouseEnter: ctx.state
        .onRowMouseEnter as InfiniteTableProps<T>['onRowMouseEnter'],
      onRowMouseLeave: ctx.state
        .onRowMouseLeave as InfiniteTableProps<T>['onRowMouseLeave'],

      groupRenderStrategy: ctx.state.groupRenderStrategy,
      brain: ctx.state.brain,
      showZebraRows: ctx.state.showZebraRows,
      rowDetailRenderer: ctx.state
        .rowDetailRenderer as InfiniteTableProps<T>['rowDetailRenderer'],
      isRowDetailsExpanded: ctx.state
        .isRowDetailExpanded as InfiniteTableProps<T>['isRowDetailExpanded'],
      isRowDetailsEnabled: ctx.state
        .isRowDetailEnabled as InfiniteTableProps<T>['isRowDetailEnabled'],
      cellClassName: ctx.state.cellClassName,
      cellStyle: ctx.state.cellStyle,
      rowStyle: ctx.state.rowStyle,
      rowDetailCache: ctx.state.rowDetailCache,
      rowClassName: ctx.state.rowClassName,
      onScrollToTop: ctx.state.onScrollToTop,
      onScrollToBottom: ctx.state.onScrollToBottom,
      onScrollStop: ctx.state.onScrollStop,
      scrollToBottomOffset: ctx.state.scrollToBottomOffset,
      wrapRowsHorizontally: ctx.state.wrapRowsHorizontally,
      updatedAt: ctx.state.updatedAt,
      ready: ctx.state.ready,
      editingCell: ctx.state.editingCell,
    };
  });

  const {
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedVisibleColumns,
    computedColumnsMap,
    computedRowHeight,
    computedRowSizeCacheForDetails,
    fieldsToColumn,
    rowspan,
    toggleGroupRow,
    columnSize,
  } = computed;

  const {
    dataArray,
    rowInfoStore,
    selectionMode,
    cellSelection,
    isNodeReadOnly,
    getDataSourceState,
    dataSourceApi,
    dataSourceActions,
  } = useDataSourceSelector((ctx) => {
    return {
      dataSourceApi: ctx.dataSourceApi,
      dataSourceActions: ctx.dataSourceActions,
      getDataSourceState: ctx.getDataSourceState,
      dataArray: ctx.dataSourceState
        .dataArray as DataSourceState<T>['dataArray'],
      rowInfoStore: ctx.dataSourceState.rowInfoStore,
      selectionMode: ctx.dataSourceState.selectionMode,
      cellSelection: ctx.dataSourceState.cellSelection,
      isNodeReadOnly: ctx.dataSourceState.isNodeReadOnly,
    };
  });

  const getData = useLatest(dataArray);

  useYourBrain<T>({
    columnSize,
    brain,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedVisibleColumns,
    computedRowHeight,
    dataArray,
    bodySize,
    rowspan,
  });

  const scrollTopMaxRef = useRef<number>(0);

  useEffect(() => {
    return brain.onRenderCountChange(() => {
      scrollTopMaxRef.current = brain.scrollTopMax;
    });
  }, [brain]);

  useEffect(() => {
    return brain.onRenderRangeChange((range) => {
      getState().onRenderRangeChange?.(range);
    });
  }, [brain]);

  useEffect(() => {
    return brain.onScrollStop((scrollPosition) => {
      const { scrollTop, scrollLeft } = scrollPosition;
      if (scrollTop === 0) {
        onScrollToTop?.();
      }

      const offset = scrollToBottomOffset ?? SCROLL_BOTTOM_OFFSET;
      const isScrollBottom = scrollTop + offset >= scrollTopMaxRef.current;

      if (isScrollBottom) {
        onScrollToBottom?.();

        const { livePagination, livePaginationCursor, dataArray } =
          getDataSourceState();
        if (livePagination) {
          dataSourceActions.cursorId =
            livePaginationCursor !== undefined
              ? // when there is a `livePaginationCursor` defined we set the cursorId to Date.now
                // as that will trigger the dataSource to fetch more data
                Date.now()
              : // but when there is no `livePaginationCursor` defined we use the `dataArray.length`
                // as the cursorId, we we can't randomise it, otherwise when we get to the end
                // of the dataset, we will still request more data
                // see #useDataArrayLengthAsCursor ref
                dataArray.length;
        }
      }

      if (onScrollStop) {
        const range = brain.getRenderRange();
        onScrollStop({
          scrollTop,
          scrollLeft,
          renderRange: range,
          viewportSize: getState().bodySize,
          firstVisibleRowIndex: range.start[0],
          lastVisibleRowIndex: range.end[0],
          firstVisibleColIndex: range.start[1],
          lastVisibleColIndex: range.end[1],
        });
      }
    });
  }, [brain, onScrollToTop, onScrollToBottom, onScrollStop]);

  useEffect(() => {
    if (!bodySize.height) {
      return;
    }

    actions.ready = true;
  }, [!!bodySize.height]);

  useEffect(() => {
    if (!ready) {
    }
    const { onReady } = getState();

    if (onReady) {
      onReady({ api: imperativeApi, dataSourceApi });
    }
  }, [ready]);

  // const [, rerender] = useRerender();

  // useEffect(() => {
  //   rerender(); // TODO check this is still needed
  // }, [dataSourceState]);

  const dataSourceStatePartialForCell = useMemo(() => {
    return {
      isNodeReadOnly,
      selectionMode,
      cellSelection,
    };
  }, [isNodeReadOnly, selectionMode, cellSelection]);

  const renderCell: TableRenderCellFn = useCallback(
    (params: TableRenderCellFnParam) => {
      const {
        rowIndex,
        colIndex,
        heightWithRowspan,
        domRef,
        hidden,
        width,
        onMouseLeave,
        onMouseEnter,
      } = params;

      const dataArray = getData();
      const rowInfo = dataArray[rowIndex];
      const column = computedVisibleColumns[colIndex];

      if (!rowInfo) {
        return null;
      }
      if (!column) {
        return null;
      }

      // it's important we pass the computed rowDetailHeight
      // and not the initially provided one - as the computed one
      // will be set on the rowInfo

      const rowHeight = computedRowSizeCacheForDetails
        ? computedRowSizeCacheForDetails.getRowHeight(rowIndex)
        : heightWithRowspan;

      let rowDetailState: false | 'collapsed' | 'expanded' = false;

      if (
        !isRowDetailsEnabled ||
        (typeof isRowDetailsEnabled === 'function' &&
          !isRowDetailsEnabled(rowInfo))
      ) {
        rowDetailState = false;
      } else if (isRowDetailsExpanded) {
        rowDetailState = isRowDetailsExpanded(rowInfo)
          ? 'expanded'
          : 'collapsed';
      }

      const rowIndexInHorizontalLayoutPage = wrapRowsHorizontally
        ? brain.getRowIndexInPage(rowIndex)
        : null;

      const horizontalLayoutPageIndex = wrapRowsHorizontally
        ? brain.getPageIndexForRow(rowIndex)
        : null;

      // Calculate if this specific cell is in edit mode
      // This is passed as a prop to ensure the cell re-renders when editing state changes
      const inEditMode = imperativeApi.isEditorVisibleForCell({
        rowIndex,
        columnId: column.id,
      });

      const cellProps: InfiniteTableColumnCellProps<T> = {
        getData,
        virtualized: true,
        showZebraRows,
        groupRenderStrategy,
        rowIndexInHorizontalLayoutPage,
        horizontalLayoutPageIndex,

        rowIndex,
        rowInfoStore,
        hidden,
        toggleGroupRow,
        rowHeight,
        rowDetailState,

        onMouseEnter,
        onMouseLeave,
        onRowMouseEnter,
        onRowMouseLeave,
        domRef,
        width,
        column,
        columnsMap: computedColumnsMap,
        fieldsToColumn,
        rowStyle,
        rowClassName,
        cellStyle,
        cellClassName,

        // Whether this specific cell is in edit mode
        // Passed as prop to trigger re-render when editing state changes
        inEditMode,

        // DataSource context values passed as props to avoid context re-renders
        getDataSourceState,
        dataSourceApi,
        dataSourceActions,

        // InfiniteTable context values passed as props to avoid context re-renders
        getState,
        imperativeApi,
        componentActions: actions,

        getComputed,
        getDataSourceMasterContext,
        dataSourceStatePartialForCell,
      };

      return <InfiniteTableColumnCell<T> {...cellProps} />;
    },
    [
      rowHeight,
      rowDetailHeight,
      onRowMouseEnter,
      onRowMouseLeave,
      computedRowSizeCacheForDetails,
      computedRowHeight,
      isRowDetailsExpanded,
      getData,
      computedVisibleColumns,
      computedColumnsMap,
      fieldsToColumn,
      groupRenderStrategy,
      wrapRowsHorizontally,
      toggleGroupRow,
      showZebraRows,
      brain,
      rowInfoStore,
      rowStyle,
      rowClassName,
      cellClassName,
      cellStyle,
      getDataSourceState,
      dataSourceApi,
      dataSourceActions,

      getState,
      imperativeApi,
      actions,

      getComputed,
      getDataSourceMasterContext,

      updatedAt,
      editingCell,
      dataSourceStatePartialForCell,
    ],
  );

  const renderDetailRow = useMemo(() => {
    if (!isRowDetailsExpanded) {
      return undefined;
    }

    return (params: TableRenderDetailRowFnParam) => {
      const { rowIndex, domRef } = params;

      const dataArray = getData();
      const rowInfo = dataArray[rowIndex];

      if (
        !rowInfo ||
        !isRowDetailsExpanded(rowInfo) ||
        !computedRowSizeCacheForDetails
      ) {
        // normally we would have returned `null`
        // but if we return null, the headless renderer will lose track
        // of the HTMLElement, and then when we scroll down and want
        // to reuse the HTMLElement, it will be gone, and the rendering will break
        return <div ref={domRef} className={visibility.hidden} />;
      }

      const { rowDetailHeight, rowHeight } =
        computedRowSizeCacheForDetails.getSize(rowIndex);

      return (
        <InfiniteTableDetailRow<T>
          rowInfo={rowInfo}
          rowDetailsCache={rowDetailCache}
          rowIndex={rowIndex}
          domRef={domRef}
          detailOffset={rowHeight}
          rowDetailHeight={rowDetailHeight}
          rowDetailRenderer={rowDetailRenderer!}
        />
      );
    };
  }, [
    ready,
    renderCell,
    rowDetailRenderer,
    rowDetailHeight,
    isRowDetailsExpanded,
    rowDetailCache,
  ]);

  return {
    renderCell,
    renderDetailRow,
    // repaintId,
  };
}
