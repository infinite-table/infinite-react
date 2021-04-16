import * as React from 'react';
import { useCallback } from 'react';

import { getScrollbarWidth } from '../../utils/getScrollbarWidth';
import { RenderRow } from '../../VirtualList/types';
import type { VirtualBrain } from '../../VirtualBrain';

import { VirtualRowList } from '../../VirtualList/VirtualRowList';
import type { Size } from '../../types/Size';
import type { TableComputedColumn, TableEnhancedData } from '../types';
import type { TableProps } from '../types/TableProps';
import type { TableRowProps } from '../components/TableRow/TableRowTypes';

import { TableRow } from '../components/TableRow';
import { TableRowUnvirtualized } from '../components/TableRow/TableRowUnvirtualized';

type UnpinnedRenderingParams<T> = {
  columnShifts: number[] | null;
  bodySize: Size;
  getData: () => TableEnhancedData<T>[];

  repaintId: string | number;
  applyScrollHorizontal: ({ scrollLeft }: { scrollLeft: number }) => void;
  verticalVirtualBrain: VirtualBrain;
  horizontalVirtualBrain: VirtualBrain;

  computedPinnedEndColumns: TableComputedColumn<T>[];
  computedUnpinnedColumns: TableComputedColumn<T>[];
  computedUnpinnedColumnsWidth: number;
  computedPinnedStartColumnsWidth: number;
  computedPinnedEndColumnsWidth: number;

  getProps: () => TableProps<T>;
};
export function useUnpinnedRendering<T>(params: UnpinnedRenderingParams<T>) {
  const {
    columnShifts,
    bodySize,
    getData,

    repaintId,

    applyScrollHorizontal,
    verticalVirtualBrain,
    horizontalVirtualBrain,
    computedUnpinnedColumnsWidth,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,

    computedUnpinnedColumns,

    getProps,
  } = params;

  const { virtualizeColumns, rowHeight } = getProps();

  const shouldVirtualizeColumns =
    typeof virtualizeColumns === 'function'
      ? virtualizeColumns(computedUnpinnedColumns)
      : virtualizeColumns ?? true;

  const renderRowUnpinned: RenderRow = useCallback(
    (rowInfo) => {
      const dataArray = getData();
      const enhancedData = dataArray[rowInfo.rowIndex];

      const { showZebraRows } = getProps();

      const rowProps: TableRowProps<T> = {
        enhancedData,
        showZebraRows,
        virtualizeColumns: shouldVirtualizeColumns,
        brain: null!,
        columns: computedUnpinnedColumns,
        rowWidth: computedUnpinnedColumnsWidth,
        ...rowInfo,
      };

      if (shouldVirtualizeColumns) {
        rowProps.brain = horizontalVirtualBrain;
        rowProps.repaintId = repaintId;
      }

      const TableRowComponent = shouldVirtualizeColumns
        ? TableRow
        : TableRowUnvirtualized;

      return <TableRowComponent<T> {...rowProps} />;
    },
    [
      repaintId,

      computedUnpinnedColumns,
      computedUnpinnedColumnsWidth,

      shouldVirtualizeColumns,
      horizontalVirtualBrain,
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

  return (
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
        left: computedPinnedStartColumnsWidth,
        right: computedPinnedEndColumnsWidth,
      }}
      count={getData().length}
      rowHeight={rowHeight}
      renderRow={renderRowUnpinned}
      rowWidth={computedUnpinnedColumnsWidth}
      outerChildren={fakeScrollbar}
    ></VirtualRowList>
  );
}
