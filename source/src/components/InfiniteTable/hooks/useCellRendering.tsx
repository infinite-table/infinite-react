import { Ref, useMemo } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import * as React from 'react';

import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import {
  TableRenderCellFn,
  TableRenderCellFnParam,
  TableRenderDetailRowFn,
  TableRenderDetailRowFnParam,
} from '../../HeadlessTable/ReactHeadlessTableRenderer';
import { useLatest } from '../../hooks/useLatest';
import { useRerender } from '../../hooks/useRerender';
import type { Size } from '../../types/Size';
import { InfiniteTableColumnCellProps } from '../components/InfiniteTableRow/InfiniteTableCellTypes';
import { InfiniteTableColumnCell } from '../components/InfiniteTableRow/InfiniteTableColumnCell';
import type { InfiniteTableComputedValues, InfiniteTableApi } from '../types';

import { useInfiniteTable } from './useInfiniteTable';
import { useYourBrain } from './useYourBrain';
import { InfiniteTableDetailRow } from '../components/InfiniteTableRow/InfiniteTableDetailRow';

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

  const { actions, state, getState } = useInfiniteTable<T>();

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
    componentState: dataSourceState,
    getState: getDataSourceState,
    componentActions: dataSourceActions,
    api: dataSourceApi,
  } = useDataSourceContextValue<T>();

  const { dataArray } = dataSourceState;

  const getData = useLatest(dataArray);
  const {
    rowHeight,
    rowDetailHeight,

    groupRenderStrategy,
    brain,
    showZebraRows,
    rowDetailRenderer,
    isRowDetailExpanded: isRowDetailsExpanded,
    isRowDetailEnabled: isRowDetailsEnabled,
    cellClassName,
    cellStyle,
    rowStyle,
    rowDetailCache: rowDetailsCache,
    rowClassName,
    onScrollToTop,
    onScrollToBottom,
    scrollToBottomOffset,
    ready,
  } = state;

  const repaintId = dataSourceState.updatedAt;

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
    return brain.onScrollStop((scrollPosition) => {
      const { scrollTop } = scrollPosition;
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
    });
  }, [brain, onScrollToTop, onScrollToBottom]);

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

  const [, rerender] = useRerender();

  useEffect(() => {
    rerender(); // TODO check this is still needed
  }, [dataSourceState]);

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

      const cellProps: InfiniteTableColumnCellProps<T> = {
        getData,
        virtualized: true,
        showZebraRows,
        groupRenderStrategy,
        rowIndex,
        rowInfo,
        hidden,
        toggleGroupRow,
        rowHeight,
        rowDetailState,

        onMouseEnter,
        onMouseLeave,
        domRef,
        width,
        column,
        columnsMap: computedColumnsMap,
        fieldsToColumn,
        rowStyle,
        rowClassName,
        cellStyle,
        cellClassName,
      };

      return <InfiniteTableColumnCell<T> {...cellProps} />;
    },
    [
      rowHeight,
      rowDetailHeight,
      computedRowSizeCacheForDetails,
      computedRowHeight,
      isRowDetailsExpanded,
      getData,
      computedVisibleColumns,
      computedColumnsMap,
      fieldsToColumn,
      groupRenderStrategy,
      toggleGroupRow,
      showZebraRows,
      repaintId,
      rowStyle,
      rowClassName,
      cellClassName,
      cellStyle,
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
        return null;
      }

      const { rowDetailHeight, rowHeight } =
        computedRowSizeCacheForDetails.getSize(rowIndex);

      return (
        <InfiniteTableDetailRow<T>
          rowInfo={rowInfo}
          rowDetailsCache={rowDetailsCache}
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
    rowDetailsCache,
  ]);

  return {
    renderCell,
    renderDetailRow,
    // repaintId,
  };
}
