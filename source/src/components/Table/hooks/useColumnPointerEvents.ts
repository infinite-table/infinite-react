import binarySearch from 'binary-search';
import * as React from 'react';

import {
  MutableRefObject,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useTable } from './useTable';
import { moveXatY } from '../utils/moveXatY';

import type { TableComputedColumn } from '../types';

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

const getBreakPoints = <T>(columns: Map<string, TableComputedColumn<T>>) => {
  return Array.from(columns.values()).map((c) => {
    return {
      columnId: c.id,
      breakpoint: c.computedAbsoluteOffset + Math.round(c.computedWidth / 2),
    };
  });
};

export const useColumnPointerEvents = <T>({
  columnId,
  domRef,
  columns,
  computedRemainingSpace,
}: {
  computedRemainingSpace: number;
  columns: Map<string, TableComputedColumn<T>>;
  columnId: string;
  domRef: React.MutableRefObject<HTMLElement | null>;
}) => {
  const [draggingDiff, setDraggingDiff] = useState<TopLeftOrNull>(null);
  const [proxyOffset, setProxyOffset] = useState<TopLeftOrNull>(null);

  const breakpointsRef: MutableRefObject<ColumnBreakpoint[]> = useRef([]);
  const pointerMoveRef: React.MutableRefObject<
    ((e: PointerEvent) => void) | null
  > = useRef(null);
  const didDragRef: React.MutableRefObject<boolean> = useRef(false);
  const initialClientPos: React.MutableRefObject<ClientPosition | null> = useRef(
    null,
  );
  const currentDropIndexRef: React.MutableRefObject<number | null> = useRef(
    null,
  );

  const dragging = draggingDiff != null;

  const { actions, computed } = useTable();

  const { computedColumnOrder } = computed;

  const column = useMemo(() => columns.get(columnId)!, [columnId, columns]);

  const { columnIndex, columnWidth, columnsArray } = useMemo(() => {
    const columnsArray = Array.from(columns.values());
    return {
      columnsArray,
      columnIndex: columnsArray.findIndex((c) => c.id === columnId),
      columnWidth: column.computedWidth,
    };
  }, [columns, columnId, column]);

  let cursorRef: MutableRefObject<React.CSSProperties['cursor']> = useRef(
    'auto',
  );

  const onPointerDown = column.computedDraggable
    ? useCallback(
        (e) => {
          const target = domRef.current!;

          cursorRef.current = target.style.cursor;

          didDragRef.current = false;
          initialClientPos.current = {
            clientX: e.clientX,
            clientY: e.clientY,
          };

          const onPointerMove = (e: PointerEvent) => {
            if (!didDragRef.current) {
              didDragRef.current = true;
              breakpointsRef.current = getBreakPoints(columns);

              setDraggingDiff({ top: 0, left: 0 });
              const rect = (target as HTMLElement).getBoundingClientRect();
              setProxyOffset({
                left: e.clientX - rect.x - 10,
                top: e.clientY - rect.y - 10,
              });
              target.style.cursor = 'grabbing';
            }

            const diffX = e.clientX - initialClientPos.current!.clientX;
            const diffY = e.clientY - initialClientPos.current!.clientY;

            const dir = diffX < 0 ? -1 : 1;

            const columnPinned = column.computedPinned;
            let currentPos =
              dir === -1
                ? column.computedAbsoluteOffset + diffX
                : column.computedAbsoluteOffset + column.computedWidth + diffX;

            const breakpoints = breakpointsRef.current;

            let index = binarySearch<ColumnBreakpoint, number>(
              breakpoints,
              currentPos,
              ({ breakpoint }, value) => {
                return breakpoint < value ? -1 : breakpoint > value ? 1 : 0;
              },
            );

            if (index < 0) {
              index = ~index;
            }

            if (index !== currentDropIndexRef.current) {
              currentDropIndexRef.current = index;
              const shifts = columnsArray.map(() => 0);

              let total = 0;

              if (dir === -1) {
                for (let i = index; i < columnIndex; i++) {
                  let shiftBy = columnWidth;
                  if (
                    columnPinned === 'end' &&
                    columnsArray[i].computedPinned === false &&
                    columnsArray[i].computedLastInCategory &&
                    computedRemainingSpace > 0
                  ) {
                    shiftBy += computedRemainingSpace;
                  }
                  shifts[i] = shiftBy;
                  total -= shiftBy;
                }
              } else {
                for (let i = columnIndex + 1; i < index; i++) {
                  shifts[i] = -columnWidth;
                  total += columnWidth;
                }
              }
              if (index !== columnIndex) {
                shifts[columnIndex] = total;
              }

              actions.setColumnShifts(shifts);
              actions.setDraggingColumnId(column.id);
            }
            setDraggingDiff({ left: diffX, top: diffY });
          };
          pointerMoveRef.current = onPointerMove;
          target.addEventListener('pointermove', onPointerMove);

          target.setPointerCapture(e.pointerId);
        },
        [columns, column, columnIndex, columnsArray, computedRemainingSpace],
      )
    : undefined;

  const onPointerUp = column.computedDraggable
    ? useCallback(
        (e) => {
          const target = domRef.current!;

          target.style.cursor = cursorRef.current!;
          target.releasePointerCapture(e.pointerId);
          target.removeEventListener('pointermove', pointerMoveRef.current!);

          setDraggingDiff(null);
          actions.setColumnShifts(null);
          actions.setDraggingColumnId(null);

          if (!didDragRef.current && column.computedSortable) {
            column.toggleSort();
          }

          const dropIndex = currentDropIndexRef.current;
          if (dropIndex != null && dropIndex !== columnIndex) {
            const newOrder = moveXatY(
              computedColumnOrder,
              columnIndex,
              dropIndex > columnIndex ? dropIndex - 1 : dropIndex,
            );

            actions.setColumnOrder(newOrder);
          }

          breakpointsRef.current = [];
          pointerMoveRef.current = null;
          didDragRef.current = false;
          initialClientPos.current = null;
          currentDropIndexRef.current = null;
        },
        [column, columnIndex, actions, computedColumnOrder],
      )
    : undefined;

  return {
    onPointerUp,
    onPointerDown,
    dragging,
    proxyOffset,
    draggingDiff: draggingDiff ?? { top: 0, left: 0 },
  };
};
