import * as React from 'react';

import { useCallback, useState } from 'react';

import { useInfiniteTable } from './useInfiniteTable';

import {
  clearInfiniteColumnReorderDuration,
  setInfiniteColumnOffsetWhileReordering,
  setInfiniteColumnZIndex,
} from '../utils/infiniteDOMUtils';

import { InfiniteClsShiftingColumns } from '../InfiniteCls.css';
import { InternalVars } from '../internalVars.css';
import { stripVar } from '../../../utils/stripVar';
import { getColumnZIndex } from './useDOMProps';
import {
  reorderColumnsOnDrag,
  ReorderDragResult,
} from './reorderColumnsOnDrag';
import { shallowEqualObjects } from '../../../utils/shallowEqualObjects';
import { InfiniteTablePropColumnPinning } from '../types';
import adjustColumnOrderForAllColumns from './adjustColumnOrderForAllColumns';
import { HorizontalLayoutMatrixBrain } from '../../VirtualBrain/HorizontalLayoutMatrixBrain';

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
  const empty1 = !pinning1 || Object.keys(pinning1).length === 0;
  const empty2 = !pinning2 || Object.keys(pinning2).length === 0;

  if (empty1 && empty2) {
    return true;
  }
  if (!!pinning1 != !!pinning2) {
    return false;
  }

  return shallowEqualObjects(pinning1, pinning2);
};

export const useColumnPointerEvents = ({
  columnId,
  domRef,
  horizontalLayoutPageIndex,
}: {
  columnId: string;
  domRef: React.MutableRefObject<HTMLElement | null>;
  horizontalLayoutPageIndex: number | null;
}) => {
  const [proxyPosition, setProxyPosition] = useState<TopLeftOrNull>(null);

  const {
    actions,
    computed,
    getComputed,
    getState,
    api,
    state: { domRef: rootRef },
  } = useInfiniteTable();

  const defaultPointerDown = useCallback((e: React.PointerEvent) => {
    const computedCol = getComputed().computedVisibleColumnsMap.get(columnId);

    if (!computedCol || !computedCol.computedSortable) {
      return;
    }
    const { multiSortBehavior } = getState();

    api.toggleSortingForColumn(columnId, {
      multiSortBehavior:
        multiSortBehavior === 'replace' && (e.ctrlKey || e.metaKey)
          ? 'append'
          : multiSortBehavior,
    });
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      //@ts-ignore
      if (e.target?.tagName === 'INPUT') {
        // early exit, so that (for example) checkbox selection works in the column header when clicking the checkbox
        return;
      }

      const { brain, draggableColumnsRestrictTo } = getState();
      const {
        computedVisibleColumns,
        computedVisibleColumnsMap,
        computedPinnedStartColumns,
        computedUnpinnedColumns,
        computedPinnedEndColumns,
      } = getComputed();

      const dragColumn = computedVisibleColumnsMap.get(columnId)!;

      if (!dragColumn.computedDraggable) {
        defaultPointerDown(e);
        return;
      }

      const target = domRef.current!;

      const targetRect = target.getBoundingClientRect();
      const tableRect = rootRef.current!.getBoundingClientRect();

      const initialAvailableSize = brain.getAvailableSize();

      const dragColumnIndex = dragColumn.computedVisibleIndex;
      const dragColumnIndexInHorizontalLayout = brain.getVirtualColIndex(
        dragColumn.computedVisibleIndex,
        {
          pageIndex: horizontalLayoutPageIndex || 0,
        },
      );
      const pageWidth = brain.isHorizontalLayoutBrain
        ? (brain as HorizontalLayoutMatrixBrain).getPageWidth()
        : null;

      let initialCursor: React.CSSProperties['cursor'] =
        target.style.cursor ?? 'auto';

      let didDragAtLeastOnce = false;

      const dragger = reorderColumnsOnDrag({
        brain,
        horizontalLayoutPageIndex,
        pageWidth,
        draggableColumnsRestrictTo,
        computedPinnedEndColumns,
        computedPinnedStartColumns,
        computedUnpinnedColumns,
        computedVisibleColumns,
        computedVisibleColumnsMap,
        dragColumnHeaderTargetRect: targetRect,
        dragColumnId: columnId,
        api,
        infiniteDOMNode: rootRef.current!,
        setProxyPosition,
        tableRect,
        initialMousePosition: {
          clientX: e.clientX,
          clientY: e.clientY,
        },
      });

      let reorderDragResult: ReorderDragResult | null = null;

      let discardAlwaysRenderedColumn: VoidFunction | undefined;
      let restoreRenderRange: VoidFunction | undefined;

      function persistColumnOrder(reorderDragResult: ReorderDragResult) {
        const { columnPinning, columnOrder } = reorderDragResult;

        if (!equalPinning(getState().columnPinning, columnPinning)) {
          actions.columnPinning = columnPinning;
        }
        const currentComputedColumnOrder = getComputed().computedColumnOrder;

        if (JSON.stringify(columnOrder, currentComputedColumnOrder)) {
          computedVisibleColumns.forEach((col) => {
            setInfiniteColumnOffsetWhileReordering(
              col.computedVisibleIndex,
              '',
              rootRef.current,
            );
          });

          // componentActions.columnOrder = columnOrder;
          // we can't simply do the above line
          // as it would discard non visible columns from the column order
          // as the `columnOrder` variable only takes into account visible columns
          // so we have to adjust it to account for all columns
          actions.columnOrder = adjustColumnOrderForAllColumns({
            newColumnOrder: columnOrder,
            visibleColumnOrder: getComputed().computedVisibleColumns.map(
              (c) => c.id,
            ),
            existingColumnOrder: currentComputedColumnOrder,
            dragColumnId: columnId,
          });
        }
      }

      const onPointerMove = (e: PointerEvent) => {
        const { headerBrain, brain } = getState();
        if (!didDragAtLeastOnce) {
          didDragAtLeastOnce = true;
          // TODO we can improve this - instead of making all cols visible
          // by increasing the render count
          // we could have a method that says: keep this column rendered (the current column)
          // even if the scrolling changes horizontally

          const discardForBody = brain.keepColumnRendered(
            dragColumnIndexInHorizontalLayout,
          );
          const discardForHeader = headerBrain.keepColumnRendered(
            dragColumnIndexInHorizontalLayout,
          );

          if (brain.isHorizontalLayoutBrain) {
            const extendBy = true;
            const restoreBodyRange = brain.extendRenderRange({
              left: extendBy,
              right: extendBy,
            });
            const restoreHeaderRange = headerBrain.extendRenderRange({
              left: extendBy,
              right: extendBy,
            });
            restoreRenderRange = () => {
              restoreBodyRange();
              restoreHeaderRange();
            };
          }

          discardAlwaysRenderedColumn = () => {
            discardForBody();
            discardForHeader();
          };

          actions.columnReorderDragColumnId = dragColumn.id;

          if (horizontalLayoutPageIndex != null) {
            actions.columnReorderInPageIndex = horizontalLayoutPageIndex;
          }

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
        const { multiSortBehavior } = getState();
        const target = domRef.current!;
        rootRef.current?.classList.remove(InfiniteClsShiftingColumns);

        dragger.stop();

        brain.update({
          ...initialAvailableSize,
        });
        discardAlwaysRenderedColumn?.();
        restoreRenderRange?.();

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

        const dragColumnSortable =
          api.getColumnApi(dragColumn.id)?.isSortable() ?? false;

        if (!didDragAtLeastOnce && dragColumnSortable) {
          api.toggleSortingForColumn(dragColumn.id, {
            multiSortBehavior:
              multiSortBehavior === 'replace' && (e.ctrlKey || e.metaKey)
                ? 'append'
                : multiSortBehavior,
          });
        }

        if (reorderDragResult) {
          persistColumnOrder(reorderDragResult);
        }

        actions.columnReorderDragColumnId = false;
        if (horizontalLayoutPageIndex != null) {
          actions.columnReorderInPageIndex = null;
        }
      };

      target.addEventListener('pointermove', onPointerMove);
      target.addEventListener('pointerup', onPointerUp);

      target.setPointerCapture(e.pointerId);
    },
    [columnId, horizontalLayoutPageIndex],
  );

  return {
    onPointerDown: computed.computedVisibleColumnsMap.get(columnId)
      ?.computedDraggable
      ? onPointerDown
      : defaultPointerDown,

    proxyPosition,
  };
};
