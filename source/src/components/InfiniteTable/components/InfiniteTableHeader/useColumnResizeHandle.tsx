import * as React from 'react';
import { useCallback } from 'react';
import { useInfiniteTableSelector } from '../../hooks/useInfiniteTableSelector';
import { InfiniteTableComputedColumn } from '../../types';
import {
  computeColumnResizeForDiff,
  ColumnResizeContext,
} from './ResizeHandle/columnResizeShared';
import { ResizeHandle } from './ResizeHandle';

export function useColumnResizeHandle<T>(
  column: InfiniteTableComputedColumn<T>,
  opts: {
    horizontalLayoutPageIndex: number | null;
  },
) {
  const { computedVisibleColumns, getState, getComputed, actions } =
    useInfiniteTableSelector((ctx) => {
      return {
        computedVisibleColumns: ctx.computed.computedVisibleColumns,
        getState: ctx.getState,
        getComputed: ctx.getComputed,
        actions: ctx.actions,
      };
    });
  const computeResizeForDiff = useCallback(
    ({
      diff,
      shareSpaceOnResize,
    }: {
      diff: number;
      shareSpaceOnResize: boolean;
    }) => {
      const result = computeColumnResizeForDiff<T>({
        // the selector's getComputed loses the T generic, hence the cast
        context: { getState, getComputed } as ColumnResizeContext<T>,
        column,
        diff,
        shareSpaceOnResize,
      });

      // TODO I think this can be removed

      // if (
      //   activeCellIndex &&
      //   activeCellIndex[1] >= column.computedVisibleIndex
      // ) {
      //   const activeColumn = columns[activeCellIndex[1]];
      //   const currentColumn = columns[column.computedVisibleIndex];

      //   if (activeCellIndex[1] === currentColumn.computedVisibleIndex) {
      //     setInfiniteColumnWidth(
      //       currentColumn.computedVisibleIndex,
      //       currentColumn.computedWidth + result.adjustedDiff,
      //       domRef.current,
      //     );
      //   } else if (activeColumn) {
      //     setInfiniteColumnOffset(
      //       activeColumn.computedVisibleIndex,
      //       activeColumn.computedOffset + result.adjustedDiff,
      //       domRef.current,
      //     );
      //   }

      //   if (
      //     shareSpaceOnResize &&
      //     activeCellIndex[1] === currentColumn.computedVisibleIndex + 1 &&
      //     activeColumn
      //   ) {
      //     setInfiniteColumnWidth(
      //       activeColumn.computedVisibleIndex,
      //       activeColumn.computedWidth - result.adjustedDiff,
      //       domRef.current,
      //     );
      //   }
      // }

      return result;
    },
    [column, getState, getComputed],
  );

  const onColumnResize = useCallback(
    ({
      diff,
      shareSpaceOnResize,
    }: {
      diff: number;
      shareSpaceOnResize: boolean;
    }) => {
      const { columnSizing, reservedWidth } = computeResizeForDiff({
        diff,
        shareSpaceOnResize,
      });

      if (!shareSpaceOnResize) {
        actions.viewportReservedWidth = reservedWidth;
      }
      actions.columnSizing = columnSizing;
    },
    [computeResizeForDiff, actions],
  );

  const resizeHandle = column.computedResizable ? (
    <ResizeHandle
      horizontalLayoutPageIndex={opts.horizontalLayoutPageIndex}
      columns={computedVisibleColumns}
      columnIndex={column.computedVisibleIndex}
      computeResize={computeResizeForDiff}
      onResize={onColumnResize}
    />
  ) : null;

  return resizeHandle;
}
