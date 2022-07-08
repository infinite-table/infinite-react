import binarySearch from 'binary-search';
import { stripVar } from '../../../utils/stripVar';

import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';
import { InternalVars } from '../theme.css';

import { InfiniteTableComputedColumn } from '../types';
import {
  InfiniteTableColumnPinnedValues,
  InfiniteTableImperativeApi,
} from '../types/InfiniteTableProps';
import {
  restoreInfiniteColumnReorderDuration,
  setInfiniteColumnOffsetWhileReordering,
  setInfiniteVarOnRoot,
} from '../utils/infiniteDOMUtils';
import { moveXatY } from '../utils/moveXatY';
import { progressiveSpeedScroller } from '../utils/progressiveSpeedScroller';

type TopLeft = {
  left: number;
  top: number;
};
type TopLeftOrNull = TopLeft | null;

type MousePosition = {
  clientX: number;
  clientY: number;
};

type ColumnBreakpoint = {
  columnId: string;
  index: number;
  breakpoint: number;
};

export type ReorderDragResult = {
  currentDropIndex: number;
  currentDragColumnPinned: InfiniteTableColumnPinnedValues;
};

export type ReorderParams<T> = {
  computedVisibleColumns: InfiniteTableComputedColumn<T>[];
  computedPinnedStartColumns: InfiniteTableComputedColumn<T>[];
  computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
  computedUnpinnedColumns: InfiniteTableComputedColumn<T>[];

  computedVisibleColumnsMap: Map<string, InfiniteTableComputedColumn<T>>;

  brain: MatrixBrain;

  tableRect: DOMRect;
  /**
   * The rect of the column header which is being dragged
   */
  dragColumnHeaderTargetRect: DOMRect;

  infiniteDOMNode: HTMLElement;

  dragColumnId: string;

  initialMousePosition: MousePosition;

  imperativeApi: InfiniteTableImperativeApi<T>;

  setProxyPosition: (position: TopLeftOrNull) => void;
  columnOffsetAtIndexCSSVar: string;
  columnWidthAtIndexCSSVar: string;
};

const PROXY_OFFSET = 10;

const pinnedStartWidthCSSVar = stripVar(InternalVars.pinnedStartWidth);
const pinnedEndWidthCSSVar = stripVar(InternalVars.pinnedEndWidth);

export function reorderColumnsOnDrag<T>(params: ReorderParams<T>) {
  const {
    columnOffsetAtIndexCSSVar,
    columnWidthAtIndexCSSVar,
    computedVisibleColumns,
    computedVisibleColumnsMap,
    computedPinnedEndColumns,
    computedPinnedStartColumns,
    dragColumnId,
    infiniteDOMNode,
    brain,
    dragColumnHeaderTargetRect,
    tableRect,
    setProxyPosition,
    imperativeApi,
  } = params;

  // returns the total width of the pinned start columns
  // but not that one of them may be the drag column
  // and it might have been dragged out of pinning
  // so we need to substract it
  function getCurrentPinnedWidth(pinned: 'start' | 'end') {
    let currentWidth =
      pinned === 'start' ? pinnedStartInitialWidth : pinnedEndInitialWidth;

    // the pinning has not changed
    if (initialDragColumnPinned === currentDragColumnPinned) {
      return currentWidth;
    }
    if (currentDragColumnPinned === pinned) {
      // was not pinned, but is now
      return currentWidth + dragColumn.computedWidth;
    }
    if (initialDragColumnPinned === pinned) {
      // was pinned, but by dragging it's no longer pinned
      return currentWidth - dragColumn.computedWidth;
    }

    return currentWidth;
  }

  function isColumnVisible(b: ColumnBreakpoint) {
    if (b.index === dragColumnIndex) {
      return true;
    }
    const col = computedVisibleColumns[b.index];

    if (col.computedPinned) {
      return true;
    }

    const scrollLeft = brain.getScrollPosition().scrollLeft;

    return (
      col.computedOffset >= scrollLeft + getCurrentPinnedWidth('start') &&
      col.computedOffset + col.computedWidth <
        scrollLeft + tableRect.width - getCurrentPinnedWidth('end')
    );
  }

  const getBreakPoints = <T>(columns: InfiniteTableComputedColumn<T>[]) => {
    return columns
      .map((c) => {
        return {
          columnId: c.id,
          index: c.computedVisibleIndex,
          breakpoint:
            // tableRect.left +
            c.computedOffset + Math.round(c.computedWidth / 2),
        };
      })
      .filter(isColumnVisible);
  };

  const initialPinnedStartCount = computedPinnedStartColumns.length;
  let currentPinnedStartCount = initialPinnedStartCount;

  const initialPinnedEndCount = computedPinnedEndColumns.length;
  let currentPinnedEndCount = initialPinnedEndCount;

  const initialMousePosition: MousePosition = {
    clientX: Math.round(params.initialMousePosition.clientX),
    clientY: Math.round(params.initialMousePosition.clientY),
  };

  const initialProxyPosition: TopLeft = {
    left:
      initialMousePosition.clientX -
      tableRect.left -
      (initialMousePosition.clientX - dragColumnHeaderTargetRect.left) +
      PROXY_OFFSET,
    top:
      initialMousePosition.clientY -
      tableRect.top -
      (initialMousePosition.clientY - dragColumnHeaderTargetRect.top) +
      PROXY_OFFSET,
  };

  const initialScrollPosition = brain.getScrollPosition();

  const initialIndexes = computedVisibleColumns.map(
    (c) => c.computedVisibleIndex,
  );
  let currentIndexes = initialIndexes;

  const dragColumn = computedVisibleColumnsMap.get(dragColumnId)!;
  const dragColumnIndex = dragColumn.computedVisibleIndex;
  const initialDragColumnPinned = dragColumn?.computedPinned;

  let currentDropIndex = dragColumnIndex;
  let currentDragColumnPinned = initialDragColumnPinned;

  const pinnedStartInitialWidth = brain.getFixedStartColsWidth();
  const pinnedEndInitialWidth = brain.getFixedEndColsWidth();

  let currentMousePosition: MousePosition = initialMousePosition;
  let currentDiff = {
    x: 0,
    y: 0,
  };

  let dir: -1 | 1 = 1;
  let diffX = 0;

  function updatePositionAndDiff(mousePosition: MousePosition) {
    const clientX = Math.round(mousePosition.clientX);
    const clientY = Math.round(mousePosition.clientY);

    if (
      clientX === currentMousePosition.clientX &&
      clientY === currentMousePosition.clientY
    ) {
      return;
    }

    currentMousePosition = { clientX, clientY };

    // UPDATE PINNING - BLOCK START
    const pinnedStartWidth = getCurrentPinnedWidth('start');
    const pinnedEndWidth = getCurrentPinnedWidth('end');

    // update when going from `start` to `false`
    if (
      currentDragColumnPinned === 'start' &&
      currentMousePosition.clientX > tableRect.left + pinnedStartWidth
    ) {
      console.log('boom');
      currentDragColumnPinned = false;
      setInfiniteVarOnRoot(
        pinnedStartWidthCSSVar,
        `${pinnedStartWidth - dragColumn.computedWidth}px`,
        infiniteDOMNode,
      );
    }

    // update when going from `false` to `start`
    if (
      pinnedStartWidth &&
      currentDragColumnPinned === false &&
      currentMousePosition.clientX < tableRect.left + pinnedStartWidth
    ) {
      currentDragColumnPinned = 'start';
      setInfiniteVarOnRoot(
        pinnedStartWidthCSSVar,
        `${pinnedStartWidth + dragColumn.computedWidth}px`,
        infiniteDOMNode,
      );
    }

    // update when going from `end` to `false`
    if (
      currentDragColumnPinned === 'end' &&
      currentMousePosition.clientX < tableRect.right - pinnedEndWidth
    ) {
      currentDragColumnPinned = false;
      setInfiniteVarOnRoot(
        pinnedEndWidthCSSVar,
        `${pinnedEndWidth - dragColumn.computedWidth}px`,
        infiniteDOMNode,
      );
    }

    // update when going from `false` to `end`
    if (
      pinnedEndWidth &&
      currentDragColumnPinned === false &&
      currentMousePosition.clientX > tableRect.right - pinnedEndWidth
    ) {
      currentDragColumnPinned = 'end';
      setInfiniteVarOnRoot(
        pinnedEndWidthCSSVar,
        `${pinnedEndWidth + dragColumn.computedWidth}px`,
        infiniteDOMNode,
      );
    }
    // UPDATE PINNING - BLOCK END

    const scrollLeftDiff =
      brain.getScrollPosition().scrollLeft - initialScrollPosition.scrollLeft;

    currentDiff.x =
      currentMousePosition.clientX - initialMousePosition!.clientX;
    currentDiff.y =
      currentMousePosition.clientY - initialMousePosition!.clientY;

    diffX = currentDiff.x + scrollLeftDiff;

    dir = diffX < 0 ? -1 : 1;

    setProxyPosition({
      left: initialProxyPosition.left + currentDiff.x,
      top: initialProxyPosition.top + currentDiff.y,
    });
  }

  function updateDropIndex(
    newDropIndex: number,
    newPinnedStartCount: number,
    newPinnedEndCount: number,
  ) {
    if (newDropIndex === currentDropIndex) {
      return;
    }

    currentDropIndex = newDropIndex;

    const newColumnIndexes = moveXatY(
      initialIndexes,
      dragColumnIndex,
      currentDropIndex > dragColumnIndex
        ? currentDropIndex - 1
        : currentDropIndex,
    );

    let pinnedStartChanged = newPinnedStartCount !== currentPinnedStartCount;
    let pinnedEndChanged = newPinnedEndCount != currentPinnedEndCount;

    let unpinnedChanged = false;

    currentPinnedStartCount = newPinnedStartCount;
    currentPinnedEndCount = newPinnedEndCount;

    const indexesWithTransition = new Set();
    newColumnIndexes.forEach((newIndex, i) => {
      const currentIndex = currentIndexes[i];

      if (newIndex !== currentIndex) {
        indexesWithTransition.add(newIndex);

        // if there was a swap/change in the pinned start columns
        if (i < currentPinnedStartCount) {
          // then mark pinned start as having changed
          pinnedStartChanged = true;
        }
        // if there was a swap/change in the pinned end columns
        else if (i >= newColumnIndexes.length - currentPinnedStartCount) {
          // then mark pinned end as having changed
          pinnedEndChanged = true;
        } else {
          unpinnedChanged = true;
        }
      }
    });

    currentIndexes = newColumnIndexes;

    if (pinnedStartChanged) {
      adjustPinnedStartOffsets();
    }
    if (pinnedEndChanged) {
      adjustPinnedEndOffsets();
    }
    if (unpinnedChanged) {
      adjustUnpinnedOffsets();
    }

    adjustAllOffsets();

    return newColumnIndexes;
  }

  function adjustPinnedStartOffsets() {
    for (let i = 0; i < currentPinnedStartCount; i++) {}
  }
  function adjustPinnedEndOffsets() {
    // the last `currentPinnedEndCount` indexes from `currentIndexes` are pinned to end
    // so we iterate them
    for (
      let i = currentIndexes.length - currentPinnedEndCount;
      i < currentIndexes.length;
      i++
    ) {}
  }
  function adjustUnpinnedOffsets() {
    for (
      let i = currentPinnedStartCount;
      i < currentIndexes.length - currentPinnedEndCount;
      i++
    ) {}
  }

  function adjustAllOffsets() {
    computedVisibleColumns.forEach((col) => {
      const colIndex = col.computedVisibleIndex;

      // TODO apply/clear the transition duration for reordering
      // if (indexesWithTransition.has(colIndex)) {
      restoreInfiniteColumnReorderDuration(colIndex, infiniteDOMNode);
      // } else {
      //   clearInfiniteColumnReorderDuration(colIndex, rootRef.current);
      // }

      const isDragColumn = colIndex === dragColumnIndex;

      let isOutsideCol =
        dir === -1
          ? colIndex < currentDropIndex || colIndex > dragColumnIndex
          : colIndex < dragColumnIndex || colIndex >= currentDropIndex;

      let newPosition: string = '';
      if (dir === -1) {
        newPosition = isDragColumn
          ? // this is the column we're dragging to the left
            // so we place it exactly at the offset of the currentDropIndex
            `var(${columnOffsetAtIndexCSSVar}-${currentDropIndex})`
          : isOutsideCol
          ? // this col should have the initial pos, so we're good
            `var(${columnOffsetAtIndexCSSVar}-${colIndex})`
          : // place it at the default offset + the width of the drag column
            // as these are columns situated between the dragindex and the dropindex
            `calc( var(${columnOffsetAtIndexCSSVar}-${colIndex}) + var(${columnWidthAtIndexCSSVar}-${dragColumnIndex}) )`;

        // newColumnIndexes.push(colCurrentIndex);
      } else {
        newPosition = isOutsideCol
          ? // this is the default value for a column
            `var(${columnOffsetAtIndexCSSVar}-${colIndex})`
          : isDragColumn
          ? // this is the column we're dragging to the right
            `calc( var(${columnOffsetAtIndexCSSVar}-${
              currentDropIndex - 1
            }) + var(${columnWidthAtIndexCSSVar}-${
              currentDropIndex - 1
            }) - var(${columnWidthAtIndexCSSVar}-${dragColumnIndex}) )`
          : `calc( var(${columnOffsetAtIndexCSSVar}-${colIndex}) - var(${columnWidthAtIndexCSSVar}-${dragColumnIndex}) )`;
      }

      // console.log(colIndex, newPosition);
      setInfiniteColumnOffsetWhileReordering(
        colIndex,
        newPosition,
        infiniteDOMNode,
      );
    });
  }

  const pinnedStartColsRight = tableRect.left + getCurrentPinnedWidth('start');
  const pinnedEndColsLeft = tableRect.right - getCurrentPinnedWidth('end');

  const speedScroller = progressiveSpeedScroller({
    scrollOffsetStart: pinnedStartColsRight,
    scrollOffsetEnd: pinnedEndColsLeft,
  });
  updatePositionAndDiff(initialMousePosition);

  return {
    speedScroller,
    stop() {
      speedScroller.stop();
    },
    onMove(mousePosition: MousePosition): ReorderDragResult {
      updatePositionAndDiff(mousePosition);

      speedScroller.scroll({
        mousePosition: currentMousePosition,
        get scrollLeft() {
          return brain.getScrollPosition().scrollLeft;
        },
        set scrollLeft(value) {
          imperativeApi.scrollLeft = value;
        },
      });

      const breakpoints = getBreakPoints(computedVisibleColumns);

      // console.log(breakpoints);

      let currentPos =
        dir === -1
          ? dragColumn.computedOffset + diffX
          : dragColumn.computedOffset + dragColumn.computedWidth + diffX;

      // console.log(
      //   breakpoints.map((b) => b.breakpoint),
      //   currentPos,
      // );
      let idx = binarySearch<ColumnBreakpoint, number>(
        breakpoints,
        currentPos,
        ({ breakpoint }, value) => {
          return breakpoint < value ? -1 : breakpoint > value ? 1 : 0;
        },
      );
      if (idx < 0) {
        idx = ~idx;
      }

      idx = breakpoints[idx]
        ? breakpoints[idx].index
        : breakpoints[breakpoints.length - 1].index + 1;

      if (idx != null && idx !== currentDropIndex) {
        // currentDropIndex = idx;

        if (dir === 1 && currentDropIndex === dragColumnIndex + 1) {
          idx = dragColumnIndex;
        }

        updateDropIndex(
          idx,
          computedPinnedStartColumns.length,
          computedPinnedEndColumns.length,
        );
      }

      return { currentDropIndex, currentDragColumnPinned };
    },
  };
}
