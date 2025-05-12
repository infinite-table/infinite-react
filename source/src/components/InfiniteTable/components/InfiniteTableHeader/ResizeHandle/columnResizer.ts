import { RefObject } from 'react';

import { InfiniteTableComputedColumn } from '../../../types';
import {
  addToInfiniteColumnOffset,
  InternalVarUtils,
} from '../../../utils/infiniteDOMUtils';

export function getColumnResizer<T>(
  colIndex: number,
  {
    columns,
    shareSpaceOnResize,
    domRef,
  }: {
    columns: InfiniteTableComputedColumn<T>[];
    shareSpaceOnResize: boolean;
    domRef: RefObject<HTMLDivElement | null>;
  },
) {
  const column = columns[colIndex];

  return {
    resize(diff: number) {
      // set the new width for the current column
      InternalVarUtils.columnWidths.set(
        colIndex,
        column.computedWidth + diff,
        domRef.current,
      );

      const nextColIndex = colIndex + 1;

      if (shareSpaceOnResize) {
        // and then manage width and offset for next column
        const nextColumn = columns[nextColIndex];
        if (!nextColumn) {
          return;
        }
        InternalVarUtils.columnWidths.set(
          nextColIndex,
          nextColumn.computedWidth - diff,
          domRef.current,
        );

        if (nextColumn.computedPinned === 'start') {
          addToInfiniteColumnOffset(nextColumn, diff, domRef.current);
        } else {
          InternalVarUtils.columnOffsets.set(
            nextColIndex,
            nextColumn.computedOffset + diff,
            domRef.current,
          );
        }
        return;
      }
      if (column.computedPinned === 'end') {
        // when a pinned end col is resized
        // we need to adjust just it's own width
        // and no other offsets, since the offsets are computed
        // based on the widths of previos pinned end cols
        // see #startcoloffsets-pinnedend

        // TODO it would be a great idea to computed offsets for all other columns
        // in this way, and we would not need to adjust offsets anymore on resize - just
        // adjust column widths
        return;
      }

      if (column.computedPinned === 'start') {
        for (let i = nextColIndex, len = columns.length; i < len; i++) {
          const col = columns[i];

          if (col.computedPinned === 'start') {
            addToInfiniteColumnOffset(col, diff, domRef.current);
            continue;
          }
          if (col.computedPinned === 'end') {
            continue;
          }
          InternalVarUtils.columnOffsets.set(
            i,
            col.computedOffset + diff,
            domRef.current,
          );
        }
        return;
      }

      for (let i = nextColIndex, len = columns.length; i < len; i++) {
        const col = columns[i];

        if (col.computedPinned) {
          continue;
        }
        InternalVarUtils.columnOffsets.set(
          i,
          col.computedOffset + diff,
          domRef.current,
        );
      }
    },
  };
}
/**
 *
 * @param colIndexes An array of indexes for the columns that will be resized
 * @param config
 * @param config.columns The array of computed visible columns
 * @param config.domRef A ref that points to the DOM node of the component.
 * @returns The resizer object, with a resize(diffs: number[]) method that should be called when the user moves/drags the resize handle.
 */
export function getColumnGroupResizer<T>(
  colIndexes: number[],
  config: {
    columns: InfiniteTableComputedColumn<T>[];
    domRef: RefObject<HTMLDivElement | null>;
  },
) {
  const lastColIndex = colIndexes[colIndexes.length - 1];

  return {
    /**
     * Performs real-time resizing of columns by updating the corresponding
     * CSS variables for the corresponding colIndexes.
     *
     * Note: this resize is transient - so after the resize handle is dropped,
     * the table needs to be re-rendered so that the actual widths end up in the component state as well.
     *
     * @param diffs an array of diffs, one for each column in the colIndexes
     */
    resize(diffs: number[]) {
      const { columns, domRef } = config;
      const firstCol = columns[colIndexes[0]];
      let offset = firstCol.computedOffset;
      let diffSum = 0;

      const node = domRef.current;

      diffs.forEach((diff, i) => {
        diffSum += diff;

        const colIndex = colIndexes[i];
        const column = columns[colIndex];
        const newWidth = column.computedWidth + diff;

        InternalVarUtils.columnWidths.set(colIndex, newWidth, node);

        if (column.computedPinned === 'end') {
          return;
        }

        if (offset) {
          InternalVarUtils.columnOffsets.set(colIndex, offset, node);
        }
        offset += newWidth;
      });

      if (firstCol.computedPinned === 'end') {
        return;
      }

      for (let i = lastColIndex + 1; i < columns.length; i++) {
        const col = columns[i];

        if (col.computedPinned === 'end') {
          continue;
        }
        InternalVarUtils.columnOffsets.set(
          i,
          col.computedOffset + diffSum,
          node,
        );
      }
    },
  };
}
