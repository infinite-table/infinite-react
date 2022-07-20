import * as React from 'react';

import { useCallback, useState } from 'react';

import { useInfiniteTable } from './useInfiniteTable';

import {
  clearInfiniteColumnReorderDuration,
  setInfiniteColumnOffsetWhileReordering,
  setInfiniteColumnZIndex,
} from '../utils/infiniteDOMUtils';

import { InfiniteClsShiftingColumns } from '../InfiniteCls.css';
import { InternalVars } from '../theme.css';
import { stripVar } from '../../../utils/stripVar';
import { getColumnZIndex } from './useDOMProps';
import {
  reorderColumnsOnDrag,
  ReorderDragResult,
} from './reorderColumnsOnDrag';
import { shallowEqualObjects } from '../../../utils/shallowEqualObjects';
import { InfiniteTablePropColumnPinning } from '../types';

const columnOffsetAtIndex = stripVar(InternalVars.columnOffsetAtIndex);
const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const baseZIndexForCells = stripVar(InternalVars.baseZIndexForCells);

type TopLeft = {
  left: number;
  top: number;
};
type TopLeftOrNull = TopLeft | null;

const equalPinning = (
  pinning1: null | InfiniteTablePropColumnPinning,
  pinning2: null | InfiniteTablePropColumnPinning,
) => {
  if (!!pinning1 != !!pinning2) {
    return false;
  }

  return shallowEqualObjects(pinning1, pinning2);
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
    getState,
    imperativeApi,
    componentState: { domRef: rootRef, brain, headerBrain },
  } = useInfiniteTable();

  const onPointerDown = useCallback(
    (e) => {
      const {
        computedVisibleColumns,
        computedVisibleColumnsMap,
        computedPinnedStartColumns,
        computedUnpinnedColumns,
        computedPinnedEndColumns,
      } = getComputed();
      const dragColumn = computedVisibleColumnsMap.get(columnId)!;

      const target = domRef.current!;

      const targetRect = target.getBoundingClientRect();
      const tableRect = rootRef.current!.getBoundingClientRect();

      const initialAvailableSize = brain.getAvailableSize();

      const dragColumnIndex = dragColumn.computedVisibleIndex;

      let initialCursor: React.CSSProperties['cursor'] =
        target.style.cursor ?? 'auto';

      let didDragAtLeastOnce = false;

      const dragger = reorderColumnsOnDrag({
        brain,
        columnOffsetAtIndexCSSVar: columnOffsetAtIndex,
        columnWidthAtIndexCSSVar: columnWidthAtIndex,
        computedPinnedEndColumns,
        computedPinnedStartColumns,
        computedUnpinnedColumns,
        computedVisibleColumns,
        computedVisibleColumnsMap,
        dragColumnHeaderTargetRect: targetRect,
        dragColumnId: columnId,
        imperativeApi,
        infiniteDOMNode: rootRef.current!,
        setProxyPosition,
        tableRect,
        initialMousePosition: {
          clientX: e.clientX,
          clientY: e.clientY,
        },
      });

      let reorderDragResult: ReorderDragResult | null = null;

      function persistColumnOrder(reorderDragResult: ReorderDragResult) {
        const { columnPinning, columnOrder } = reorderDragResult;

        if (!equalPinning(getState().columnPinning, columnPinning)) {
          console.log('update pinning');
          componentActions.columnPinning = columnPinning;
        }
        if (JSON.stringify(columnOrder, getComputed().computedColumnOrder)) {
          computedVisibleColumns.forEach((col) => {
            setInfiniteColumnOffsetWhileReordering(
              col.computedVisibleIndex,
              '',
              rootRef.current,
            );
          });

          componentActions.columnOrder = columnOrder;
        }
      }

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

          componentActions.columnReorderDragColumnId = dragColumn.id;

          setInfiniteColumnZIndex(
            dragColumnIndex,
            `calc( var(${baseZIndexForCells}) + 10000 )`,
            rootRef.current,
          );

          rootRef.current?.classList.add(InfiniteClsShiftingColumns);
          target.style.cursor = 'grabbing';
        }

        reorderDragResult = dragger.onMove(e);
      };

      const onPointerUp = (e: PointerEvent) => {
        const target = domRef.current!;
        rootRef.current?.classList.remove(InfiniteClsShiftingColumns);

        dragger.stop();

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

        if (reorderDragResult) {
          persistColumnOrder(reorderDragResult);
        }

        componentActions.columnReorderDragColumnId = false;
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
