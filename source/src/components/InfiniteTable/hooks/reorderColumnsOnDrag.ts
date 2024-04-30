import binarySearch from 'binary-search';
import { stripVar } from '../../../utils/stripVar';

import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';
import { InternalVars } from '../internalVars.css';

import { InfiniteTableComputedColumn } from '../types';
import {
  InfiniteTableApi,
  InfiniteTablePropColumnPinning,
} from '../types/InfiniteTableProps';
import {
  clearInfiniteColumnReorderDuration,
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
  columnPinning: InfiniteTablePropColumnPinning;
  columnOrder: string[];
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

  api: InfiniteTableApi<T>;

  setProxyPosition: (position: TopLeftOrNull) => void;
  columnOffsetAtIndexCSSVar: string;
  columnWidthAtIndexCSSVar: string;
};

const PROXY_OFFSET = 10;

const pinnedStartWidthCSSVar = stripVar(InternalVars.pinnedStartWidth);
// const pinnedEndWidthCSSVar = stripVar(InternalVars.pinnedEndWidth);

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
    api: imperativeApi,
  } = params;

  // returns the total width of the pinned start columns
  // we need to take into account that one of them may be the drag column
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
    const breakpoints: ColumnBreakpoint[] = [];

    columns.forEach((c) => {
      const b = {
        columnId: c.id,
        index: c.computedVisibleIndex,
        breakpoint:
          // tableRect.left +
          c.computedOffset + Math.round(c.computedWidth / 2),
      };

      if (isColumnVisible(b)) {
        breakpoints.push(b);
      }
      // if (c.computedPinned === 'start' && c.computedLastInCategory) {
      //   breakpoints.push({
      //     index: c.computedVisibleIndex,
      //     breakpoint: c.computedOffset + c.computedWidth,
      //   });
      // }

      // if (c.computedPinned === 'end' && c.computedFirstInCategory) {
      //   breakpoints.push({
      //     index: c.computedVisibleIndex,
      //     breakpoint: c.computedOffset,
      //   });
      // }
    });

    return breakpoints;
  };

  const initialPinnedStartCount = computedPinnedStartColumns.length;
  let currentPinnedStartCount = initialPinnedStartCount;

  // const initialPinnedEndCount = computedPinnedEndColumns.length;
  // let currentPinnedEndCount = initialPinnedEndCount;

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

    const currentScrollLeft = brain.getScrollPosition().scrollLeft;

    const scrollLeftDiff = currentScrollLeft - initialScrollPosition.scrollLeft;

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

  function updatePinnedStartCount(columnIndexes: number[]) {
    let pinnedStartCount = 0;

    if (!initialDragColumnPinned) {
      columnIndexes.forEach((colIndex, i) => {
        if (computedVisibleColumns[colIndex]?.computedPinned === 'start') {
          pinnedStartCount = i + 1;
        }
      });
    } else if (initialDragColumnPinned === 'start') {
      columnIndexes.forEach((colIndex, i) => {
        if (pinnedStartCount) {
          return;
        }
        if (computedVisibleColumns[colIndex]?.computedPinned !== 'start') {
          pinnedStartCount = i;
        }
      });
    }

    currentPinnedStartCount = pinnedStartCount;

    updatePinningMarker('start', columnIndexes, pinnedStartCount);
  }

  function updatePinningMarker(
    where: 'start', //| 'end' // pinning end marker coming soon
    columnIndexes: number[],
    pinnedCount: number,
  ) {
    if (where === 'start') {
      let width = 0;

      for (let i = 0; i < pinnedCount; i++) {
        const colIndex = columnIndexes[i];
        const col = computedVisibleColumns[colIndex];
        width += col.computedWidth;
      }
      // update pinned start marker to correct offset/width
      setInfiniteVarOnRoot(
        pinnedStartWidthCSSVar,
        `${width}px`,
        infiniteDOMNode,
      );
    }
  }

  function updateDropIndex(newDropIndex: number) {
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

    let pinnedStartCount = 0;
    // let pinnedEndCount = 0;

    currentPinnedStartCount = pinnedStartCount;
    // currentPinnedEndCount = pinnedEndCount;

    const indexesWithTransition = new Set<number>();

    newColumnIndexes.forEach((newIndex, i) => {
      const currentIndex = currentIndexes[i];

      if (newIndex !== currentIndex) {
        indexesWithTransition.add(newIndex);
      }

      updatePinnedStartCount(newColumnIndexes);
    });

    currentIndexes = newColumnIndexes;

    adjustAllOffsets(indexesWithTransition);

    return {
      newColumnIndexes,
      indexesWithTransition,
      pinnedStartCount: currentPinnedStartCount,
    };
  }

  function adjustAllOffsets(indexesWithTransition: Set<number>) {
    computedVisibleColumns.forEach((col) => {
      const colIndex = col.computedVisibleIndex;

      if (indexesWithTransition.has(colIndex)) {
        restoreInfiniteColumnReorderDuration(colIndex, infiniteDOMNode);
      } else {
        clearInfiniteColumnReorderDuration(colIndex, infiniteDOMNode);
      }

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

      let currentPos =
        dir === -1
          ? dragColumn.computedOffset + diffX
          : dragColumn.computedOffset + dragColumn.computedWidth + diffX;

      let idx = binarySearch<{ breakpoint: number }, number>(
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
        if (dir === 1 && currentDropIndex === dragColumnIndex + 1) {
          idx = dragColumnIndex;
        }

        updateDropIndex(idx);
      }

      const columnPinning: InfiniteTablePropColumnPinning = {};

      // will need to adjust pinning end to take into account the count of pinned end cols after the drag
      // but for now, we don't support column reordering when we have pinned end cols
      computedPinnedEndColumns.forEach((col) => {
        columnPinning[col.id] = 'end';
      });

      for (let i = 0; i < currentPinnedStartCount; i++) {
        const colIndex = currentIndexes[i];
        const col = computedVisibleColumns[colIndex];
        columnPinning[col.id] = 'start';
      }

      const columnOrder = currentIndexes.map((colIndex) => {
        return computedVisibleColumns[colIndex].id;
      });
      return {
        columnPinning,
        columnOrder,
      };
    },
  };
}
