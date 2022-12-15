import * as React from 'react';
import { useCallback } from 'react';
import { computeResize } from '../../../flexbox';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import {
  InfiniteTableComputedColumn,
  InfiniteTablePropColumnSizing,
} from '../../types';
import { ResizeHandle } from './ResizeHandle';

export function useColumnResizeHandle<T>(
  column: InfiniteTableComputedColumn<T>,
) {
  const {
    computed: { computedVisibleColumns },
    getState,
    getComputed,
    actions,
  } = useInfiniteTable<T>();
  const computeResizeForDiff = useCallback(
    ({
      diff,
      shareSpaceOnResize,
    }: {
      diff: number;
      shareSpaceOnResize: boolean;
    }) => {
      const state = getState();
      const { columnSizing, viewportReservedWidth, bodySize } = state;

      const columns = getComputed().computedVisibleColumns;

      let atLeastOneFlex = false;

      const columnSizingWithFlex = columns.reduce((acc, col) => {
        if (col.computedFlex) {
          acc[col.id] = { ...columnSizing[col.id], flex: col.computedWidth }; // we explicitly need to have here `{ flex: col.computedWidth }` and not `{ flex: col.computedFlex }`
          // this is to make the test #advancedcolumnresizing work

          atLeastOneFlex = true;
        }
        return acc;
      }, {} as InfiniteTablePropColumnSizing);

      const columnSizingForResize = atLeastOneFlex
        ? {
            // #advancedcolumnresizing-important
            // yep, this order is correct - first apply current columnSizing from state
            ...columnSizing,

            // and then for flex columns, we override with actual computed widths from above
            ...columnSizingWithFlex,
          }
        : columnSizing;

      const result = computeResize({
        shareSpaceOnResize,
        availableSize: bodySize.width,
        reservedWidth: viewportReservedWidth || 0,
        dragHandleOffset: diff,
        dragHandlePositionAfter: column.computedVisibleIndex,
        columnSizing: columnSizingForResize,
        items: columns.map((c) => {
          return {
            id: c.id,
            computedFlex: c.computedFlex,
            computedWidth: c.computedWidth,
            computedMinWidth: c.computedMinWidth,
            computedMaxWidth: c.computedMaxWidth,
          };
        }),
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
    [column],
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
    [computeResizeForDiff],
  );

  const resizeHandle = column.computedResizable ? (
    <ResizeHandle
      columns={computedVisibleColumns}
      columnIndex={column.computedVisibleIndex}
      computeResize={computeResizeForDiff}
      onResize={onColumnResize}
    />
  ) : null;

  return resizeHandle;
}
