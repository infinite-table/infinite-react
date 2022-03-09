import * as React from 'react';
import { useCallback } from 'react';

import { ScrollPosition } from '../../types/ScrollPosition';
import { getScrollbarWidth } from '../../utils/getScrollbarWidth';
import {
  RowListWithExternalScrolling,
  RowListWithExternalScrollingListProps,
} from '../../VirtualList/RowListWithExternalScrolling';
import { VirtualBrain, VirtualBrainOptions } from '../../VirtualBrain';

import { InfiniteTableRowProps } from '../components/InfiniteTableRow/InfiniteTableRowTypes';
import { TableRowUnvirtualized } from '../components/InfiniteTableRow/InfiniteTableRowUnvirtualized';
import { HorizontalScrollbarPlaceholder } from '../components/ScrollbarPlaceholder';
import type {
  InfiniteTableComputedColumn,
  InfiniteTableRowInfo,
  Scrollbars,
} from '../types';
import type { Size } from '../../types/Size';
import type { RenderRow } from '../../VirtualList/types';
import { InfiniteTableState } from '../types/InfiniteTableState';
import { InfiniteTableToggleGroupRowFn } from '../types/InfiniteTableColumn';
import { join } from '../../../utils/join';
import { VirtualScrollContainer } from '../../VirtualScrollContainer';
import { SpacePlaceholder } from '../../VirtualList/SpacePlaceholder';
import { ScrollListener } from '../../VirtualBrain/ScrollListener';
import {
  PinnedRowsClsVariants,
  PinnedRowsContainerClsVariants,
} from '../InfiniteCls.css';

type UsePinnedParams<T> = {
  getState: () => InfiniteTableState<T>;
  getData: () => InfiniteTableRowInfo<T>[];
  bodySize: Size;
  pinnedStartScrollListener: ScrollListener;
  pinnedEndScrollListener: ScrollListener;

  repaintId: string | number;
  computedPinnedStartWidth: number;
  computedPinnedEndWidth: number;

  computedPinnedStartOverflow: boolean;
  computedPinnedEndOverflow: boolean;

  computedPinnedEndColumnsWidth: number;
  computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
  verticalVirtualBrain: VirtualBrain;
  scrollbars: Scrollbars;
  rowHeight: number;
  toggleGroupRow: InfiniteTableToggleGroupRowFn;
  computedPinnedStartColumnsWidth: number;
  computedPinnedStartColumns: InfiniteTableComputedColumn<T>[];
  rowSpan?: VirtualBrainOptions['itemSpan'];
};

type RenderPinnedRowParams<T> = {
  repaintId: string | number;
  getState: () => InfiniteTableState<T>;
  getData: () => InfiniteTableRowInfo<T>[];
  toggleGroupRow: InfiniteTableToggleGroupRowFn;
  columnsWidth: number;
  columns: InfiniteTableComputedColumn<T>[];
  verticalBrain: VirtualBrain;
  rowSpan?: VirtualBrainOptions['itemSpan'];
};

const UPDATE_SCROLL = (
  node: HTMLElement,
  brainScrollPosition: ScrollPosition,
  horizontalPinnedScrollPosition?: ScrollPosition,
) => {
  node.style.transform = `translate3d(${
    horizontalPinnedScrollPosition
      ? -horizontalPinnedScrollPosition.scrollLeft
      : 0
  }px, ${-brainScrollPosition.scrollTop}px, 0px)`;
};

type PinnedRowsContainerProps = {
  maxWidth?: number;
  count: number;
  rowHeight: number;
  rowWidth: number;
  height: number;
  pinning: 'start' | 'end';
  brain: VirtualBrain;
  renderRow: RenderRow;
  hasOverflow: boolean;

  pinnedScrollListener: ScrollListener;

  repaintId: number | string;
};

const PinnedRowsContainerClassName = `InfinitePinnedRows`;
function PinnedRowsContainer(props: PinnedRowsContainerProps) {
  const {
    maxWidth,
    pinning,
    rowWidth,
    height,

    pinnedScrollListener,
    hasOverflow,
    brain,
    renderRow,
  } = props;

  const style = React.useMemo<React.CSSProperties | undefined>(() => {
    const result: React.CSSProperties =
      pinning === 'end'
        ? {
            width: rowWidth,
            height,
            right: 0,
          }
        : {};

    if (!hasOverflow && pinning === 'end') {
      result.position = 'absolute';
    }
    if (hasOverflow) {
      // it shouldn't be needed, but if we don't provide it,
      // the browser renders this box (for pinned start only) lower with about 15px (the size of the scrollbar)
      result.height = getScrollbarWidth();
      result.width = getScrollbarWidth();
    }

    return result;
  }, [height, rowWidth, pinning, hasOverflow]);

  const updateScroll: typeof UPDATE_SCROLL = useCallback(
    (node, scrollPosition) => {
      UPDATE_SCROLL(
        node,
        scrollPosition,
        hasOverflow ? pinnedScrollListener.getScrollPosition() : undefined,
      );
    },
    [hasOverflow, pinnedScrollListener],
  );

  const rowListProps: RowListWithExternalScrollingListProps = {
    style,
    brain,
    renderRow,
    updateScroll,
    className: join(
      `${PinnedRowsContainerClassName}`,
      PinnedRowsClsVariants[pinning === 'start' ? 'pinnedStart' : 'pinnedEnd'],
      `${PinnedRowsContainerClassName}--pinned-${pinning}`,
      `${PinnedRowsContainerClassName}--overflow`,
      PinnedRowsClsVariants.overflow,
    ),
  };

  if (hasOverflow) {
    return (
      <VirtualScrollContainer
        scrollable={{
          horizontal: true,
          vertical: false,
        }}
        style={{
          width: maxWidth,
          height,
          position: 'absolute',
          [pinning === 'start' ? 'left' : 'right']: 0,
          [pinning === 'start' ? 'right' : 'left']: 'unset',
        }}
        onContainerScroll={pinnedScrollListener?.setScrollPosition}
        className={join(
          PinnedRowsContainerClsVariants({
            pinned: pinning,
          }),
          `${PinnedRowsContainerClassName}Container`,
          `${PinnedRowsContainerClassName}Container--pinned-${pinning}`,
        )}
      >
        <RowListWithExternalScrolling
          {...rowListProps}
          onMount={(node) => {
            // TODO cleanup on component unmount
            pinnedScrollListener?.onScroll((scrollPosition) => {
              updateScroll(node, brain.getScrollPosition(), scrollPosition);
            });
          }}
        />
        <SpacePlaceholder width={rowWidth} height={1} />
      </VirtualScrollContainer>
    );
  }

  return <RowListWithExternalScrolling {...rowListProps} />;
}

function useRenderPinnedRow<T>(params: RenderPinnedRowParams<T>) {
  const { getData, getState, columnsWidth, columns, rowSpan, verticalBrain } =
    params;

  const dataArray = getData();

  const renderPinnedRow: RenderRow = useCallback(
    (rowParams) => {
      const rowInfo = dataArray[rowParams.rowIndex];

      const { showZebraRows, showHoverRows } = getState();

      const rowProps: InfiniteTableRowProps<T> = {
        rowInfo,
        getData,
        showZebraRows,
        showHoverRows,
        toggleGroupRow: params.toggleGroupRow,
        virtualizeColumns: false,
        verticalBrain,
        brain: null!,
        rowSpan,
        rowWidth: columnsWidth,
        columns: columns,
        ...rowParams,
      };

      return <TableRowUnvirtualized<T> {...rowProps} />;
    },
    [columnsWidth, columns, verticalBrain, dataArray],
  );

  return renderPinnedRow;
}

export function usePinnedRenderingForSide<T>(
  side: 'start' | 'end',
  params: UsePinnedParams<T>,
) {
  const {
    getState,
    getData,
    rowHeight,
    bodySize,
    computedPinnedEndColumns,
    computedPinnedEndColumnsWidth,
    computedPinnedStartColumns,
    computedPinnedStartColumnsWidth,
    verticalVirtualBrain,
    computedPinnedEndWidth,
    computedPinnedEndOverflow,
    computedPinnedStartWidth,
    computedPinnedStartOverflow,
    pinnedStartScrollListener,
    pinnedEndScrollListener,

    rowSpan,
    repaintId,
    toggleGroupRow,
    scrollbars: {
      vertical: hasVerticalScrollbar,
      horizontal: hasHorizontalScrollbar,
    },
  } = params;

  const count = getData().length;
  const rowWidth =
    side === 'start'
      ? computedPinnedStartColumnsWidth
      : computedPinnedEndColumnsWidth;
  const columns =
    side === 'start' ? computedPinnedStartColumns : computedPinnedEndColumns;
  const columnsWidth =
    side === 'start'
      ? computedPinnedStartColumnsWidth
      : computedPinnedEndColumnsWidth;

  const maxWidth =
    side === 'start' ? computedPinnedStartWidth : computedPinnedEndWidth;
  const hasOverflow =
    side === 'start' ? computedPinnedStartOverflow : computedPinnedEndOverflow;

  const pinnedScrollListener =
    side === 'start' ? pinnedStartScrollListener : pinnedEndScrollListener;
  const renderRowPinned: RenderRow = useRenderPinnedRow({
    getData,
    getState,
    repaintId,
    toggleGroupRow,
    rowSpan,
    verticalBrain: verticalVirtualBrain,
    columns,
    columnsWidth,
  });

  const pinnedList =
    columns.length && rowHeight !== 0 ? (
      <PinnedRowsContainer
        pinning={side}
        pinnedScrollListener={pinnedScrollListener}
        hasOverflow={hasOverflow}
        rowHeight={rowHeight}
        rowWidth={rowWidth}
        maxWidth={maxWidth}
        height={bodySize.height}
        count={count}
        repaintId={`${repaintId}-pin-${side}-${rowHeight}`}
        brain={verticalVirtualBrain}
        renderRow={renderRowPinned}
      />
    ) : null;

  const pinnedScrollbarPlaceholder =
    pinnedList && hasHorizontalScrollbar && !hasOverflow ? (
      <HorizontalScrollbarPlaceholder
        style={
          side === 'end'
            ? {
                width: columnsWidth,
                right: hasVerticalScrollbar ? getScrollbarWidth() : 0,
              }
            : {
                width: columnsWidth,
                left: 0,
              }
        }
      ></HorizontalScrollbarPlaceholder>
    ) : null;

  return {
    renderRowPinned,
    pinnedList,
    pinnedScrollbarPlaceholder,
  };
}
export function usePinnedEndRendering<T>(params: UsePinnedParams<T>) {
  const {
    renderRowPinned: renderRowPinnedEnd,
    pinnedList: pinnedEndList,
    pinnedScrollbarPlaceholder: pinnedEndScrollbarPlaceholder,
  } = usePinnedRenderingForSide('end', params);

  return {
    renderRowPinnedEnd,
    pinnedEndList,
    pinnedEndScrollbarPlaceholder,
  };
}

export function usePinnedStartRendering<T>(params: UsePinnedParams<T>) {
  const {
    renderRowPinned: renderRowPinnedStart,
    pinnedList: pinnedStartList,
    pinnedScrollbarPlaceholder: pinnedStartScrollbarPlaceholder,
  } = usePinnedRenderingForSide('start', params);

  const result = {
    renderRowPinnedStart,
    pinnedStartList,
    pinnedStartScrollbarPlaceholder,
  };

  return result;
}
