//@ts-nocheck - this file is not being used
import * as React from 'react';
import { useCallback } from 'react';

import { getScrollbarWidth } from '../../utils/getScrollbarWidth';
import { RenderRow } from '../../VirtualList/types';
import type { VirtualBrain, VirtualBrainOptions } from '../../VirtualBrain';

import { VirtualRowList } from '../../VirtualList/VirtualRowList';
import type { Size } from '../../types/Size';
import type {
  InfiniteTableComputedColumn,
  InfiniteTableRowInfo,
} from '../types';
import type { InfiniteTableRowProps } from '../components/InfiniteTableRow/InfiniteTableRowTypes';

import { InfiniteTableRow } from '../components/InfiniteTableRow';
import { TableRowUnvirtualized } from '../components/InfiniteTableRow/InfiniteTableRowUnvirtualized';
import { InfiniteTableState } from '../types/InfiniteTableState';
import { InfiniteTableToggleGroupRowFn } from '../types/InfiniteTableColumn';

type UnpinnedRenderingParams<T> = {
  columnShifts: number[] | null;
  bodySize: Size;
  getData: () => InfiniteTableRowInfo<T>[];
  rowHeight: number;
  toggleGroupRow: InfiniteTableToggleGroupRowFn;

  repaintId: string | number;
  applyScrollHorizontal: ({ scrollLeft }: { scrollLeft: number }) => void;
  verticalVirtualBrain: VirtualBrain;
  horizontalVirtualBrain: VirtualBrain;

  computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
  computedUnpinnedColumns: InfiniteTableComputedColumn<T>[];
  computedUnpinnedColumnsWidth: number;
  computedPinnedStartWidth: number;
  computedPinnedEndWidth: number;
  rowSpan?: VirtualBrainOptions['itemSpan'];

  getState: () => InfiniteTableState<T>;
};
export function useUnpinnedRendering<T>(params: UnpinnedRenderingParams<T>) {
  const {
    columnShifts,
    bodySize,
    getData,
    rowHeight,
    toggleGroupRow,

    repaintId,

    applyScrollHorizontal,
    verticalVirtualBrain,
    horizontalVirtualBrain,
    computedUnpinnedColumnsWidth,
    computedPinnedStartWidth,
    computedPinnedEndWidth,

    computedUnpinnedColumns,

    rowSpan,
    getState,
  } = params;

  const { virtualizeColumns } = getState();

  const shouldVirtualizeColumns =
    typeof virtualizeColumns === 'function'
      ? virtualizeColumns(computedUnpinnedColumns)
      : virtualizeColumns ?? true;

  const renderRowUnpinned: RenderRow = useCallback(
    (rowParams) => {
      const dataArray = getData();
      const rowInfo = dataArray[rowParams.rowIndex];

      const { showZebraRows, showHoverRows } = getState();

      const rowProps: InfiniteTableRowProps<T> = {
        rowInfo,
        showZebraRows,
        showHoverRows,
        getData,
        rowSpan,
        toggleGroupRow,
        virtualizeColumns: shouldVirtualizeColumns,
        brain: null!,
        verticalBrain: verticalVirtualBrain,
        columns: computedUnpinnedColumns,
        rowWidth: computedUnpinnedColumnsWidth,
        ...rowParams,
      };

      if (shouldVirtualizeColumns) {
        rowProps.brain = horizontalVirtualBrain;
        rowProps.repaintId = repaintId;
      }

      const TableRowComponent = shouldVirtualizeColumns
        ? InfiniteTableRow
        : TableRowUnvirtualized;

      return <TableRowComponent<T> {...rowProps} />;
    },
    [
      repaintId,
      rowHeight,
      rowSpan,

      computedUnpinnedColumns,
      computedUnpinnedColumnsWidth,

      shouldVirtualizeColumns,
      horizontalVirtualBrain,
      verticalVirtualBrain,
    ],
  );

  const fakeScrollbar = getScrollbarWidth() ? (
    <div
      data-name="horizontal-scrollbar-placeholder--fake"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: getScrollbarWidth() + 1,
        overflow: 'auto',
        visibility: columnShifts ? 'visible' : 'hidden',
      }}
    >
      <div style={{ height: '100%', width: computedUnpinnedColumnsWidth }} />
    </div>
  ) : null;

  //TODO in the future, we can use something more lightweight instead of the VirtualRowList
  // as the root of the InfiniteTable already renders a VirtualScrollContainer
  // and the VirtualRowList contains another VirtualScrollContainer
  // so I think we could optimize this 🤔 or remove the root VirtualScrollContainer there 🤷‍♂️
  return rowHeight != 0 ? (
    <VirtualRowList
      repaintId={`${repaintId}-unpinned-`}
      brain={verticalVirtualBrain}
      onContainerScroll={applyScrollHorizontal}
      scrollable={
        columnShifts
          ? 'visible'
          : { vertical: false, horizontal: !columnShifts }
      }
      style={{
        height: bodySize.height,
        top: 0,
        position: 'absolute',
        left: computedPinnedStartWidth,
        right: computedPinnedEndWidth,
      }}
      count={getData().length}
      rowHeight={rowHeight}
      renderRow={renderRowUnpinned}
      rowWidth={computedUnpinnedColumnsWidth}
      outerChildren={fakeScrollbar}
    ></VirtualRowList>
  ) : null;
}
