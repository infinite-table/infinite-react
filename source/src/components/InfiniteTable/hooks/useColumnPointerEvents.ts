import binarySearch from 'binary-search';
import * as React from 'react';

import { useCallback, useMemo, useState } from 'react';

import { useInfiniteTable } from './useInfiniteTable';
import { moveXatY } from '../utils/moveXatY';

import type { InfiniteTableComputedColumn } from '../types';
import {
  setInfiniteColumnOffsetWhileReordering,
  setInfiniteColumnZIndex,
} from '../utils/infiniteDOMUtils';

import { InfiniteClsShiftingColumns } from '../InfiniteCls.css';
import { InternalVars } from '../theme.css';
import { stripVar } from '../../../utils/stripVar';
import { getColumnZIndex } from './useDOMProps';

const columnOffsetAtIndex = stripVar(InternalVars.columnOffsetAtIndex);
const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);

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
  breakpoint: number;
};

const PROXY_OFFSET = 10;

const getBreakPoints = <T>(
  columns: Map<string, InfiniteTableComputedColumn<T>>,
) => {
  return Array.from(columns.values())
    .map((c) => {
      return {
        columnId: c.id,
        breakpoint: c.computedAbsoluteOffset + Math.round(c.computedWidth / 2),
      };
    })
    .filter(Boolean);
};

export const useColumnPointerEvents = <T>({
  columnId,
  domRef,
  columns,
  computedRemainingSpace,
  pinnedStartColsCount,
  visibleColsCount,
}: {
  pinnedStartColsCount: number;
  visibleColsCount: number;
  computedRemainingSpace: number;
  columns: Map<string, InfiniteTableComputedColumn<T>>;
  columnId: string;
  domRef: React.MutableRefObject<HTMLElement | null>;
}) => {
  const [proxyPosition, setProxyPosition] = useState<TopLeftOrNull>(null);

  const dragging = proxyPosition != null;

  const {
    componentActions,
    computed,
    componentState: { domRef: rootRef, brain },
  } = useInfiniteTable();

  const { computedColumnOrder } = computed;

  const column = useMemo(() => columns.get(columnId)!, [columnId, columns]);

  const { dragColumnIndex, columnsArray } = useMemo(() => {
    const columnsArray = Array.from(columns.values());
    const columnIndex = columnsArray.findIndex((c) => c.id === columnId);
    return {
      columnsArray,
      dragColumnIndex: columnIndex,
      columnWidth: column.computedWidth,
      columnOffsetVar: `var(${columnOffsetAtIndex}-${column.computedVisibleIndex})`,
    };
  }, [columns, columnId, column]);

  const onPointerDown = useCallback(
    (e) => {
      let breakpoints: ColumnBreakpoint[] = [];
      const target = domRef.current!;

      const initialClientPos: ClientPosition = {
        clientX: Math.round(e.clientX),
        clientY: Math.round(e.clientY),
      };

      const initialScrollPosition = brain.getScrollPosition();

      const initialProxyPosition = {
        left: PROXY_OFFSET - initialScrollPosition.scrollLeft,
        top: PROXY_OFFSET,
      };

      let currentClientPos: ClientPosition = initialClientPos!;

      let currentDiff = {
        x: 0,
        y: 0,
      };

      function updateColumnOffsets(pos: ClientPosition) {
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

      updateColumnOffsets(initialClientPos);

      let initialCursor: React.CSSProperties['cursor'] =
        target.style.cursor ?? 'auto';

      let didDragAtLeastOnce = false;

      let currentDropIndex: number = dragColumnIndex;

      const onPointerMove = (e: PointerEvent) => {
        if (!didDragAtLeastOnce) {
          didDragAtLeastOnce = true;
          componentActions.columnReorderInProgress = true;

          breakpoints = getBreakPoints(columns);

          setInfiniteColumnZIndex(dragColumnIndex, 1_000_000, rootRef.current);

          rootRef.current?.classList.add(InfiniteClsShiftingColumns);
          target.style.cursor = 'grabbing';
        }

        // todo fix next - this, when there is horizontal scrolling

        updateColumnOffsets(e);

        const diffX = currentDiff.x;
        const dir = diffX < 0 ? -1 : 1;

        let currentPos =
          dir === -1
            ? column.computedAbsoluteOffset + diffX
            : column.computedAbsoluteOffset + column.computedWidth + diffX;

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

        if (idx !== currentDropIndex) {
          currentDropIndex = idx;
          if (dir === 1 && currentDropIndex === dragColumnIndex + 1) {
            currentDropIndex = dragColumnIndex;
          }

          columnsArray.forEach((col) => {
            const colIndex = col.computedVisibleIndex;

            if (dir === -1) {
              let newPosition =
                colIndex === dragColumnIndex
                  ? `var(${columnOffsetAtIndex}-${currentDropIndex})`
                  : colIndex < currentDropIndex || colIndex > dragColumnIndex
                  ? // this col should have the initial pos, so we're good
                    `var(${columnOffsetAtIndex}-${colIndex})`
                  : `calc( var(${columnOffsetAtIndex}-${colIndex}) + var(${columnWidthAtIndex}-${dragColumnIndex}) )`;

              setInfiniteColumnOffsetWhileReordering(
                colIndex,
                newPosition,
                rootRef.current,
              );
              return;
            }

            if (dir === 1) {
              let newPosition =
                colIndex < dragColumnIndex || colIndex >= currentDropIndex
                  ? `var(${columnOffsetAtIndex}-${colIndex})`
                  : colIndex === dragColumnIndex
                  ? `calc( var(${columnOffsetAtIndex}-${
                      currentDropIndex - 1
                    }) + var(${columnWidthAtIndex}-${
                      currentDropIndex - 1
                    }) - var(${columnWidthAtIndex}-${dragColumnIndex}) )`
                  : `calc( var(${columnOffsetAtIndex}-${colIndex}) - var(${columnWidthAtIndex}-${dragColumnIndex}) )`;

              setInfiniteColumnOffsetWhileReordering(
                colIndex,
                newPosition,
                rootRef.current,
              );
              return;
            }
          });
        }
      };

      const onPointerUp = (e: PointerEvent) => {
        const target = domRef.current!;

        rootRef.current?.classList.remove(InfiniteClsShiftingColumns);

        columnsArray.forEach((col) => {
          setInfiniteColumnOffsetWhileReordering(
            col.computedVisibleIndex,
            '',
            rootRef.current,
          );
        });

        setInfiniteColumnZIndex(
          dragColumnIndex,
          getColumnZIndex(column, {
            pinnedStartColsCount,
            visibleColsCount,
          }),
          rootRef.current,
        );

        target.style.cursor = initialCursor as string;
        target.releasePointerCapture(e.pointerId);

        target.removeEventListener('pointermove', onPointerMove);
        target.removeEventListener('pointerup', onPointerUp);

        setProxyPosition(null);

        if (!didDragAtLeastOnce && column.computedSortable) {
          column.toggleSort();
        }

        if (currentDropIndex != null && currentDropIndex !== dragColumnIndex) {
          const newOrder = moveXatY(
            computedColumnOrder,
            dragColumnIndex,
            currentDropIndex > dragColumnIndex
              ? currentDropIndex - 1
              : currentDropIndex,
          );

          columnsArray.forEach((col) => {
            setInfiniteColumnOffsetWhileReordering(
              col.computedVisibleIndex,
              '',
              rootRef.current,
            );
          });

          componentActions.columnOrder = newOrder;
        }

        componentActions.columnReorderInProgress = false;

        breakpoints = [];
      };

      target.addEventListener('pointermove', onPointerMove);
      target.addEventListener('pointerup', onPointerUp);

      target.setPointerCapture(e.pointerId);
    },
    [
      columns,
      column,
      dragColumnIndex,
      visibleColsCount,
      pinnedStartColsCount,
      columnsArray,
      computedRemainingSpace,
      computedColumnOrder,
    ],
  );

  return {
    onPointerDown: column.computedDraggable ? onPointerDown : () => {},
    dragging,
    proxyPosition,
    // draggingDiff: draggingDiff ?? { top: 0, left: 0 },
  };
};
