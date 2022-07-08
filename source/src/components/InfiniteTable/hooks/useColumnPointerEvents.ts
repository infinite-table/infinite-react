import binarySearch from 'binary-search';
import * as React from 'react';

import { useCallback, useState } from 'react';

import { useInfiniteTable } from './useInfiniteTable';
import { moveXatY } from '../utils/moveXatY';

import type { InfiniteTableComputedColumn } from '../types';
import {
  clearInfiniteColumnReorderDuration,
  restoreInfiniteColumnReorderDuration,
  setInfiniteColumnOffsetWhileReordering,
  setInfiniteColumnZIndex,
} from '../utils/infiniteDOMUtils';

import { InfiniteClsShiftingColumns } from '../InfiniteCls.css';
import { InternalVars } from '../theme.css';
import { stripVar } from '../../../utils/stripVar';
import { getColumnZIndex } from './useDOMProps';
import { ScrollPosition } from '../../types/ScrollPosition';
import { progressiveSpeedScroller } from '../utils/progressiveSpeedScroller';

const columnOffsetAtIndex = stripVar(InternalVars.columnOffsetAtIndex);
const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const baseZIndexForCells = stripVar(InternalVars.baseZIndexForCells);

type ClientPosition = {
  clientX: number;
  clientY: number;
};

type TopLeft = {
  left: number;
  top: number;
};
type TopLeftOrNull = TopLeft | null;

type ColumnBreakpoint = {
  columnId: string;
  index: number;
  breakpoint: number;
};

const PROXY_OFFSET = 10;

const getBreakPoints = <T>(columns: InfiniteTableComputedColumn<T>[]) => {
  return columns
    .map((c) => {
      return {
        columnId: c.id,
        index: c.computedVisibleIndex,
        breakpoint: c.computedOffset + Math.round(c.computedWidth / 2),
      };
    })
    .filter(Boolean);
};

export const useColumnPointerEvents = ({
  columnId,
  domRef,
}: {
  columnId: string;
  domRef: React.MutableRefObject<HTMLElement | null>;
}) => {
  const [proxyPosition, setProxyPosition] = useState<TopLeftOrNull>(null);

  const {
    componentActions,
    computed,
    getComputed,
    imperativeApi,
    componentState: { domRef: rootRef, brain, headerBrain },
  } = useInfiniteTable();

  const onPointerDown = useCallback(
    (e) => {
      const {
        computedVisibleColumns,
        computedVisibleColumnsMap,
        computedPinnedStartColumns,
      } = getComputed();
      const dragColumn = computedVisibleColumnsMap.get(columnId)!;

      const initialBreakpoints: ColumnBreakpoint[] = getBreakPoints(
        computedVisibleColumns,
      );

      const target = domRef.current!;

      const targetRect = target.getBoundingClientRect();
      const tableRect = rootRef.current!.getBoundingClientRect();

      const initialAvailableSize = brain.getAvailableSize();

      const dragColumnIndex = dragColumn.computedVisibleIndex;

      let currentColumnIndexes = computedVisibleColumns.map(
        (c) => c.computedVisibleIndex,
      );
      const initialColumnIndexes = currentColumnIndexes;

      const pinnedStartCurrentWidth =
        brain.getFixedStartColsWidth() -
        (dragColumn.computedPinned === 'start' ? dragColumn.computedWidth : 0);
      const pinnedStartColsRight = tableRect.left + pinnedStartCurrentWidth;

      const pinnedEndCurrentWidth =
        brain.getFixedEndColsWidth() -
        (dragColumn.computedPinned === 'end' ? dragColumn.computedWidth : 0);
      const pinnedEndColsLeft = tableRect.right - pinnedEndCurrentWidth;

      const speedScroller = progressiveSpeedScroller({
        scrollOffsetStart: pinnedStartColsRight,
        scrollOffsetEnd: pinnedEndColsLeft,
      });

      const isColumnVisible = (
        columnIndex: number,
        { scrollLeft }: { scrollLeft: number },
      ) => {
        if (columnIndex === dragColumnIndex) {
          return true;
        }
        const col = computedVisibleColumns[columnIndex];

        if (col.computedPinned) {
          return true;
        }

        return (
          col.computedOffset >= scrollLeft + pinnedStartCurrentWidth &&
          col.computedOffset + col.computedWidth <
            scrollLeft + tableRect.width - pinnedEndCurrentWidth
        );
      };

      const initialClientPos: ClientPosition = {
        clientX: Math.round(e.clientX),
        clientY: Math.round(e.clientY),
      };

      let currentScrollPosition = {
        scrollLeft: 0,
        scrollTop: 0,
      };
      const initialScrollPosition = brain.getScrollPosition();

      const updateScrollPosition = (scrollPosition: ScrollPosition) => {
        currentScrollPosition = scrollPosition;
      };

      updateScrollPosition(initialScrollPosition);

      const removeOnScroll = brain.onScroll((scrollPosition) => {
        currentScrollPosition = scrollPosition;
      });

      const initialProxyPosition = {
        // left: PROXY_OFFSET - initialScrollPosition.scrollLeft,
        // top: PROXY_OFFSET,
        left:
          initialClientPos.clientX -
          tableRect.left -
          (initialClientPos.clientX - targetRect.left) +
          PROXY_OFFSET,
        top:
          initialClientPos.clientY -
          tableRect.top -
          (initialClientPos.clientY - targetRect.top) +
          PROXY_OFFSET,
      };

      let currentClientPos: ClientPosition = initialClientPos!;

      let currentDiff = {
        x: 0,
        y: 0,
      };

      function updateProxyPosition(pos: ClientPosition) {
        const clientX = Math.round(pos.clientX);
        const clientY = Math.round(pos.clientY);

        if (
          clientX === currentClientPos.clientX &&
          clientY === currentClientPos.clientY
        ) {
          return;
        }

        currentClientPos = { clientX, clientY };

        currentDiff.x = currentClientPos.clientX - initialClientPos!.clientX;
        currentDiff.y = currentClientPos.clientY - initialClientPos!.clientY;

        setProxyPosition({
          left: initialProxyPosition.left + currentDiff.x,
          top: initialProxyPosition.top + currentDiff.y,
        });
      }

      updateProxyPosition(initialClientPos);

      let initialCursor: React.CSSProperties['cursor'] =
        target.style.cursor ?? 'auto';

      let didDragAtLeastOnce = false;

      let currentDropIndex: number = dragColumnIndex;

      const onPointerMove = (e: PointerEvent) => {
        if (!didDragAtLeastOnce) {
          didDragAtLeastOnce = true;
          // TODO we can improve this - instead of making all cols visible
          // by increasing the render count
          // we could have a method that says: keep this column rendered (the current column)
          // even if the scrolling changes horizontally
          brain.setRenderCount({
            horizontal: computedVisibleColumns.length,
            vertical: undefined,
          });
          headerBrain.setRenderCount({
            horizontal: computedVisibleColumns.length,
            vertical: undefined,
          });

          // TODO continue here
          // if (column.computedPinned === 'end') {
          //   imperativeApi.scrollLeft = scrollLeftMax;
          // }

          componentActions.columnReorderDragColumnId = dragColumn.id;

          setInfiniteColumnZIndex(
            dragColumnIndex,
            `calc( var(${baseZIndexForCells}) + 10000 )`,
            rootRef.current,
          );

          rootRef.current?.classList.add(InfiniteClsShiftingColumns);
          target.style.cursor = 'grabbing';
        }
        updateProxyPosition(e);

        const scrollLeft = currentScrollPosition.scrollLeft;
        const scrollLeftDiff = scrollLeft - initialScrollPosition.scrollLeft;

        let diffX = currentDiff.x + scrollLeftDiff;

        // if (column.computedPinned === 'end') {
        //   diffX -= scrollLeftMax - currentScrollPosition.scrollLeft;
        // }

        const dir = diffX < 0 ? -1 : 1;

        let currentPos =
          dir === -1
            ? dragColumn.computedOffset + diffX
            : dragColumn.computedOffset + dragColumn.computedWidth + diffX;

        speedScroller.scroll({
          mousePosition: currentClientPos,
          get scrollLeft() {
            return brain.getScrollPosition().scrollLeft;
          },
          set scrollLeft(value) {
            imperativeApi.scrollLeft = value;
          },
        });

        // const breakpoints = initialBreakpoints;
        const breakpoints = initialBreakpoints
          .filter((b) =>
            isColumnVisible(b.index, {
              scrollLeft: currentScrollPosition.scrollLeft,
            }),
          )
          .map((b) => {
            return { ...b, breakpoint: b.breakpoint - scrollLeft };
          });
        // const breakpoints =
        //   column.computedPinned === 'end' || true
        //     ? initialBreakpoints.filter((b) => {
        //         return renderer.isColumnVisible(b.index);
        //       })
        //     : initialBreakpoints;

        let idx = binarySearch<ColumnBreakpoint, number>(
          breakpoints,
          currentPos,
          ({ breakpoint }, value) => {
            return breakpoint < value ? -1 : breakpoint > value ? 1 : 0;
          },
        );

        if (idx < 0) {
          idx = ~idx;
          console.log(
            'found breakpoint',
            breakpoints[idx],
            'at index',
            idx,
            'for currentPos',
            currentPos,
            JSON.parse(JSON.stringify(breakpoints)),
          );
        }
        idx = breakpoints[idx]
          ? breakpoints[idx].index
          : breakpoints[breakpoints.length - 1].index + 1;

        if (idx != null && idx !== currentDropIndex) {
          currentDropIndex = idx;

          if (dir === 1 && currentDropIndex === dragColumnIndex + 1) {
            currentDropIndex = dragColumnIndex;
          }

          const newColumnIndexes = moveXatY(
            initialColumnIndexes,
            dragColumnIndex,
            currentDropIndex > dragColumnIndex
              ? currentDropIndex - 1
              : currentDropIndex,
          );

          // we need to add a transition duration for the indexes that are swaping
          const indexesWithTransition = new Set();
          newColumnIndexes.forEach((newIndex, i) => {
            const currentIndex = currentColumnIndexes[i];

            if (newIndex !== currentIndex) {
              indexesWithTransition.add(newIndex);
            }
          });
          console.log(JSON.stringify(currentColumnIndexes));
          console.log(JSON.stringify(newColumnIndexes));
          console.log('switched', indexesWithTransition);
          console.log('----');
          currentColumnIndexes = newColumnIndexes;

          computedVisibleColumns.forEach((col) => {
            const colIndex = col.computedVisibleIndex;

            // apply/clear the transition duration for reordering
            if (indexesWithTransition.has(colIndex)) {
              restoreInfiniteColumnReorderDuration(colIndex, rootRef.current);
            } else {
              clearInfiniteColumnReorderDuration(colIndex, rootRef.current);
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
                  `var(${columnOffsetAtIndex}-${currentDropIndex})`
                : isOutsideCol
                ? // this col should have the initial pos, so we're good
                  `var(${columnOffsetAtIndex}-${colIndex})`
                : // place it at the default offset + the width of the drag column
                  // as these are columns situated between the dragindex and the dropindex
                  `calc( var(${columnOffsetAtIndex}-${colIndex}) + var(${columnWidthAtIndex}-${dragColumnIndex}) )`;

              // newColumnIndexes.push(colCurrentIndex);
            } else {
              newPosition = isOutsideCol
                ? // this is the default value for a column
                  `var(${columnOffsetAtIndex}-${colIndex})`
                : isDragColumn
                ? // this is the column we're dragging to the right
                  `calc( var(${columnOffsetAtIndex}-${
                    currentDropIndex - 1
                  }) + var(${columnWidthAtIndex}-${
                    currentDropIndex - 1
                  }) - var(${columnWidthAtIndex}-${dragColumnIndex}) )`
                : `calc( var(${columnOffsetAtIndex}-${colIndex}) - var(${columnWidthAtIndex}-${dragColumnIndex}) )`;
            }

            setInfiniteColumnOffsetWhileReordering(
              colIndex,
              newPosition,
              rootRef.current,
            );
          });
        }
      };

      function persistColumnOrder() {
        if (currentDropIndex != null && currentDropIndex !== dragColumnIndex) {
          const newOrder = moveXatY(
            getComputed().computedColumnOrder,
            dragColumnIndex,
            currentDropIndex > dragColumnIndex
              ? currentDropIndex - 1
              : currentDropIndex,
          );

          computedVisibleColumns.forEach((col) => {
            setInfiniteColumnOffsetWhileReordering(
              col.computedVisibleIndex,
              '',
              rootRef.current,
            );
          });

          componentActions.columnOrder = newOrder;
        }
      }

      const onPointerUp = (e: PointerEvent) => {
        const target = domRef.current!;
        rootRef.current?.classList.remove(InfiniteClsShiftingColumns);

        removeOnScroll();
        speedScroller.stop();

        brain.setAvailableSize({
          ...initialAvailableSize,
        });

        computedVisibleColumns.forEach((col) => {
          clearInfiniteColumnReorderDuration(
            col.computedVisibleIndex,
            rootRef.current,
          );
          setInfiniteColumnOffsetWhileReordering(
            col.computedVisibleIndex,
            '',
            rootRef.current,
          );
        });

        setInfiniteColumnZIndex(
          dragColumnIndex,
          getColumnZIndex(dragColumn, {
            pinnedStartColsCount: computedPinnedStartColumns.length,
            visibleColsCount: computedVisibleColumns.length,
          }),
          rootRef.current,
        );

        target.style.cursor = initialCursor as string;
        target.releasePointerCapture(e.pointerId);

        target.removeEventListener('pointermove', onPointerMove);
        target.removeEventListener('pointerup', onPointerUp);

        setProxyPosition(null);

        if (!didDragAtLeastOnce && dragColumn.computedSortable) {
          dragColumn.toggleSort();
        }

        persistColumnOrder();

        componentActions.columnReorderDragColumnId = false;

        // initialBreakpoints.length = 0;
      };

      target.addEventListener('pointermove', onPointerMove);
      target.addEventListener('pointerup', onPointerUp);

      target.setPointerCapture(e.pointerId);
    },
    [columnId],
  );

  return {
    onPointerDown: computed.computedVisibleColumnsMap.get(columnId)
      ?.computedDraggable
      ? onPointerDown
      : () => {},

    proxyPosition,
  };
};
