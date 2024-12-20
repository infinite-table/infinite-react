import binarySearch from 'binary-search';
import { stripVar } from '../../../utils/stripVar';
import { NonUndefined } from '../../types/NonUndefined';

import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';
import { InternalVars } from '../internalVars.css';

import { InfiniteTableComputedColumn } from '../types';
import {
  InfiniteTableApi,
  InfiniteTablePropColumnPinning,
  InfiniteTableProps,
} from '../types/InfiniteTableProps';
import { CSSCalc } from '../utils/CSSCalc';
import {
  clearInfiniteColumnReorderDuration,
  InternalVarUtils,
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
  columnIndex: number;
  offsetX: number;
};

type GetBreakPointsOptions<T> = {
  dragColumn: InfiniteTableComputedColumn<T>;
  restrictToParentGroup: boolean;
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
  horizontalLayoutPageIndex: number | null;
  pageWidth: number | null;

  draggableColumnsRestrictTo: NonUndefined<
    InfiniteTableProps<T>['draggableColumnsRestrictTo']
  >;

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
};

const PROXY_OFFSET = 10;

const pinnedStartWidthCSSVar = stripVar(InternalVars.pinnedStartWidth);
// const pinnedEndWidthCSSVar = stripVar(InternalVars.pinnedEndWidth);

export function reorderColumnsOnDrag<T>(params: ReorderParams<T>) {
  const {
    computedVisibleColumns,
    computedVisibleColumnsMap,
    computedPinnedEndColumns,
    computedPinnedStartColumns,
    dragColumnId,
    infiniteDOMNode,
    brain,
    dragColumnHeaderTargetRect,
    draggableColumnsRestrictTo,
    tableRect,
    setProxyPosition,
    api: imperativeApi,
    horizontalLayoutPageIndex,
    pageWidth,
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
    if (b.columnIndex === dragColumnIndex) {
      return true;
    }
    if (horizontalLayoutPageIndex != null) {
      // for horizontal layout, consider all columns visible for now
      return true;
    }
    const col = computedVisibleColumns[b.columnIndex];

    if (col.computedPinned) {
      return true;
    }

    const scrollLeft = brain.getScrollPosition().scrollLeft;
    const colOffset =
      col.computedOffset +
      (horizontalLayoutPageIndex != null && pageWidth != null
        ? pageWidth * horizontalLayoutPageIndex
        : 0);

    const visible =
      colOffset >= scrollLeft + getCurrentPinnedWidth('start') &&
      colOffset + col.computedWidth <=
        scrollLeft + tableRect.width - getCurrentPinnedWidth('end');

    return visible;
  }

  const getBreakPoints = <T>(
    columns: InfiniteTableComputedColumn<T>[],
    options: GetBreakPointsOptions<T>,
  ) => {
    const { restrictToParentGroup, dragColumn } = options;

    let breakpoints: ColumnBreakpoint[] = [];

    columns.forEach((c) => {
      if (c.computedVisibleIndex === dragColumnIndex) {
        // the current column is the drag column,
        // and we don't need a breakpoint for it
        // the breakpoints of all the other columns will be enough
        return;
      }

      const b: ColumnBreakpoint = {
        columnId: c.id,
        columnIndex: c.computedVisibleIndex,
        offsetX: c.computedOffset + Math.round(c.computedWidth / 2),
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

    if (restrictToParentGroup) {
      const dragColIndex = dragColumn.computedVisibleIndex;

      // TODO this can be improved

      function checkAllowedColumnsInDirection(
        colIndex: number,
        dir: 1 | -1,
        disallowedTargets: Set<string>,
      ) {
        const col = columns[colIndex];
        if (!col) {
          return;
        }

        if (col.columnGroup !== dragColumn.columnGroup) {
          disallowedTargets.add(col.id);
        }
        checkAllowedColumnsInDirection(colIndex + dir, dir, disallowedTargets);
      }

      const disallowedTargets = new Set<string>();
      checkAllowedColumnsInDirection(dragColIndex - 1, -1, disallowedTargets);
      checkAllowedColumnsInDirection(dragColIndex + 1, 1, disallowedTargets);

      breakpoints = breakpoints.filter((b) => {
        return !disallowedTargets.has(b.columnId);
      });
    }

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
    if (newDropIndex == null || newDropIndex === currentDropIndex) {
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
            InternalVarUtils.columnOffsets.get(currentDropIndex)
          : isOutsideCol
          ? // this col should have the initial pos, so we're good
            InternalVarUtils.columnOffsets.get(colIndex)
          : // place it at the default offset + the width of the drag column
            // as these are columns situated between the dragindex and the dropindex
            CSSCalc.add(
              InternalVarUtils.columnOffsets.get(colIndex),
              InternalVarUtils.columnWidths.get(dragColumnIndex),
            ).done();

        // newColumnIndexes.push(colCurrentIndex);
      } else {
        newPosition = isOutsideCol
          ? // this is the default value for a column
            InternalVarUtils.columnOffsets.get(colIndex)
          : isDragColumn
          ? // this is the column we're dragging to the right
            CSSCalc.add(
              InternalVarUtils.columnOffsets.get(currentDropIndex - 1),
              InternalVarUtils.columnWidths.get(currentDropIndex - 1),
            )
              .minus(InternalVarUtils.columnWidths.get(dragColumnIndex))
              .done()
          : CSSCalc.minus(
              InternalVarUtils.columnOffsets.get(colIndex),
              InternalVarUtils.columnWidths.get(dragColumnIndex),
            ).done();
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

      const breakpoints = getBreakPoints(computedVisibleColumns, {
        dragColumn,
        restrictToParentGroup: draggableColumnsRestrictTo === 'group',
      });

      let currentPos =
        dir === -1
          ? dragColumn.computedOffset + diffX
          : dragColumn.computedOffset + dragColumn.computedWidth + diffX;

      let idx = binarySearch<{ offsetX: number }, number>(
        breakpoints,
        currentPos,
        ({ offsetX }, value) => {
          return offsetX < value ? -1 : offsetX > value ? 1 : 0;
        },
      );
      if (idx < 0) {
        idx = ~idx;
      }

      if (!breakpoints.length) {
        if (computedVisibleColumns.length > 1) {
          console.error('No breakpoints available, something is wrong!');
        }
        idx = 0;
      } else {
        idx = breakpoints[idx]
          ? breakpoints[idx].columnIndex
          : breakpoints[breakpoints.length - 1].columnIndex + 1;
      }
      // the drag column has 2 valid positionswhen it doesn't change the order - either before itself or after itself
      // which is basically the same position, but let's normalise to only have one of them
      if (idx === dragColumnIndex + 1) {
        idx = dragColumnIndex;
      }

      updateDropIndex(idx);

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
