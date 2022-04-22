import type { Ref } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import React from 'react';

import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import {
  TableRenderCellFn,
  TableRenderCellFnParam,
} from '../../HeadlessTable/ReactHeadlessTableRenderer';
import { useLatest } from '../../hooks/useLatest';
import { useRerender } from '../../hooks/useRerender';
import type { Size } from '../../types/Size';
import { InfiniteTableColumnCellProps } from '../components/InfiniteTableRow/InfiniteTableCellTypes';
import { InfiniteTableColumnCell } from '../components/InfiniteTableRow/InfiniteTableColumnCell';
import type {
  InfiniteTableComputedValues,
  InfiniteTableImperativeApi,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnVisibility,
} from '../types';

import { useInfiniteTable } from './useInfiniteTable';
import { useYourBrain } from './useYourBrain';

type CellRenderingParam<T> = {
  computed: InfiniteTableComputedValues<T>;
  domRef: Ref<HTMLElement>;

  bodySize: Size;
  columnShifts: number[] | null;
  getComputed: () => InfiniteTableComputedValues<T> | undefined;
};

type CellRenderingResult = {
  renderCell: TableRenderCellFn;
};

const SCROLL_BOTTOM_OFFSET = 1;

export function useCellRendering<T>(
  param: CellRenderingParam<T>,
): CellRenderingResult {
  const { computed, bodySize } = param;

  const { componentActions, componentState, getState } = useInfiniteTable<T>();

  const {
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedVisibleColumns,
    rowspan,
    toggleGroupRow,
    columnSize,
  } = computed;

  const {
    componentState: dataSourceState,
    getState: getDataSourceState,
    componentActions: dataSourceActions,
  } = useDataSourceContextValue<T>();

  const { dataArray } = dataSourceState;

  const getData = useLatest(dataArray);
  const {
    rowHeight,
    groupRenderStrategy,
    brain,
    showZebraRows,
    onScrollToTop,
    onScrollToBottom,
    scrollToBottomOffset,
  } = componentState;

  const repaintId = dataSourceState.updatedAt;

  useYourBrain({
    columnSize,
    brain,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedVisibleColumns,
    rowHeight,
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

    const { onReady } = getState();

    componentActions.ready = true;

    if (onReady) {
      const imperativeApi: InfiniteTableImperativeApi<T> = {
        setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => {
          componentActions.columnOrder = columnOrder;
        },
        setColumnVisibility: (
          columnVisibility: InfiniteTablePropColumnVisibility,
        ) => {
          componentActions.columnVisibility = columnVisibility;
        },
        getState,
        getDataSourceState,
      };

      onReady(imperativeApi);
    }
  }, [!!bodySize.height]);

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

      const cellProps: InfiniteTableColumnCellProps<T> = {
        getData,
        virtualized: true,
        showZebraRows,
        groupRenderStrategy,
        rowIndex,
        rowInfo,
        hidden,
        toggleGroupRow,
        rowHeight: heightWithRowspan,
        onMouseEnter,
        onMouseLeave,
        domRef,
        width,
        column,
      };

      return <InfiniteTableColumnCell<T> {...cellProps} />;
    },
    [
      rowHeight,
      getData,
      computedVisibleColumns,
      groupRenderStrategy,
      toggleGroupRow,
      showZebraRows,
      repaintId,
    ],
  );

  return {
    renderCell,
    // repaintId,
  };
}
