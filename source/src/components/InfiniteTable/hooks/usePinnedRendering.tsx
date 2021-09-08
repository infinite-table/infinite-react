import * as React from 'react';
import { useCallback } from 'react';

import { ScrollPosition } from '../../types/ScrollPosition';
import { getScrollbarWidth } from '../../utils/getScrollbarWidth';
import { RowListWithExternalScrolling } from '../../VirtualList/RowListWithExternalScrolling';
import { VirtualBrain } from '../../VirtualBrain';

import { InfiniteTableRowProps } from '../components/InfiniteTableRow/InfiniteTableRowTypes';
import { TableRowUnvirtualized } from '../components/InfiniteTableRow/InfiniteTableRowUnvirtualized';
import { HorizontalScrollbarPlaceholder } from '../components/ScrollbarPlaceholder';
import {
  InfiniteTableComputedColumn,
  InfiniteTableEnhancedData,
} from '../types';
import type { Size } from '../../types/Size';
import type { RenderRow } from '../../VirtualList/types';
import { InfiniteTableComponentState } from '../types/InfiniteTableState';
import { InfiniteTableToggleGroupRowFn } from '../types/InfiniteTableColumn';

type UsePinnedParams<T> = {
  getState: () => InfiniteTableComponentState<T>;
  getData: () => InfiniteTableEnhancedData<T>[];
  bodySize: Size;

  repaintId: string | number;
  computedPinnedEndColumnsWidth: number;
  computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
  verticalVirtualBrain: VirtualBrain;
  scrollbars: { vertical: boolean; horizontal: boolean };
  rowHeight: number;
  toggleGroupRow: InfiniteTableToggleGroupRowFn;
  computedPinnedStartColumnsWidth: number;
  computedPinnedStartColumns: InfiniteTableComputedColumn<T>[];
};

type RenderPinedRowParams<T> = {
  getState: () => InfiniteTableComponentState<T>;
  getData: () => InfiniteTableEnhancedData<T>[];
  toggleGroupRow: InfiniteTableToggleGroupRowFn;
  columnsWidth: number;
  columns: InfiniteTableComputedColumn<T>[];
};

const UPDATE_SCROLL = (node: HTMLElement, scrollPosition: ScrollPosition) => {
  node.style.transform = `translate3d(0px, ${-scrollPosition.scrollTop}px, 0px)`;
};

function useRenderPinnedRow<T>(params: RenderPinedRowParams<T>) {
  const { getData, getState, columnsWidth, columns } = params;

  const renderPinnedRow: RenderRow = useCallback(
    (rowInfo) => {
      const dataArray = getData();
      const enhancedData = dataArray[rowInfo.rowIndex];

      const { showZebraRows } = getState();

      const rowProps: InfiniteTableRowProps<T> = {
        enhancedData,
        showZebraRows,
        toggleGroupRow: params.toggleGroupRow,
        virtualizeColumns: false,
        brain: null!,
        rowWidth: columnsWidth,
        columns: columns,
        ...rowInfo,
      };

      return <TableRowUnvirtualized<T> {...rowProps} />;
    },
    [columnsWidth, columns],
  );

  return renderPinnedRow;
}
export function usePinnedEndRendering<T>(params: UsePinnedParams<T>) {
  const {
    getState,
    getData,
    rowHeight,
    bodySize,
    computedPinnedEndColumns,
    computedPinnedEndColumnsWidth,
    verticalVirtualBrain,
    repaintId,
    toggleGroupRow,
    scrollbars: {
      vertical: hasVerticalScrollbar,
      horizontal: hasHorizontalScrollbar,
    },
  } = params;

  const renderRowPinnedEnd: RenderRow = useRenderPinnedRow({
    getData,
    getState,
    toggleGroupRow,
    columns: computedPinnedEndColumns,
    columnsWidth: computedPinnedEndColumnsWidth,
  });

  const pinnedEndList =
    computedPinnedEndColumns.length && rowHeight !== 0 ? (
      <RowListWithExternalScrolling
        repaintId={`${repaintId}-pin-end-${rowHeight}`}
        brain={verticalVirtualBrain}
        renderRow={renderRowPinnedEnd}
        style={{
          position: 'absolute',
          height: bodySize.height,
          width: computedPinnedEndColumnsWidth,
          right: 0,
        }}
        updateScroll={UPDATE_SCROLL}
      />
    ) : null;

  const pinnedEndScrollbarPlaceholder =
    pinnedEndList && hasHorizontalScrollbar ? (
      <HorizontalScrollbarPlaceholder
        style={{
          width: computedPinnedEndColumnsWidth,
          right: hasVerticalScrollbar ? getScrollbarWidth() : 0,
        }}
      ></HorizontalScrollbarPlaceholder>
    ) : null;

  return {
    renderRowPinnedEnd,
    pinnedEndList,
    pinnedEndScrollbarPlaceholder,
  };
}

export function usePinnedStartRendering<T>(params: UsePinnedParams<T>) {
  const {
    getData,
    getState,
    rowHeight,
    computedPinnedStartColumns,
    computedPinnedStartColumnsWidth,
    verticalVirtualBrain,
    toggleGroupRow,
    repaintId,
    scrollbars: { horizontal: hasHorizontalScrollbar },
  } = params;
  const renderRowPinnedStart: RenderRow = useRenderPinnedRow({
    getData,
    getState,
    toggleGroupRow,
    columns: computedPinnedStartColumns,
    columnsWidth: computedPinnedStartColumnsWidth,
  });

  const pinnedStartList =
    computedPinnedStartColumns.length && rowHeight !== 0 ? (
      <RowListWithExternalScrolling
        repaintId={`${repaintId}-pin-start-${rowHeight}`}
        brain={verticalVirtualBrain}
        renderRow={renderRowPinnedStart}
        updateScroll={UPDATE_SCROLL}
      ></RowListWithExternalScrolling>
    ) : null;

  const pinnedStartScrollbarPlaceholder =
    pinnedStartList && hasHorizontalScrollbar ? (
      <HorizontalScrollbarPlaceholder
        style={{
          width: computedPinnedStartColumnsWidth,
          left: 0,
        }}
      ></HorizontalScrollbarPlaceholder>
    ) : null;

  return {
    renderRowPinnedStart,
    pinnedStartList,
    pinnedStartScrollbarPlaceholder,
  };
}
