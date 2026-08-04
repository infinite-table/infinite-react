/**
 * Vue sibling of useColumnPointerEvents.ts - the pointerdown handler for
 * header cells that powers drag-to-reorder (and falls back to
 * toggle-sorting on plain clicks).
 *
 * The actual drag logic is the shared reorderColumnsOnDrag.ts; this module
 * only adapts the wiring: Vue refs instead of useState for the proxy
 * position, nextTick() instead of flushSync before clearing the transient
 * reorder CSS vars.
 */
import { nextTick } from 'vue';
import type { Ref } from 'vue';

import { Rectangle } from '../../../utils/pageGeometry/Rectangle';
import { shallowEqualObjects } from '../../../utils/shallowEqualObjects';
import { stripVar } from '../../../utils/stripVar';
import { isTargetInput } from '../../../utils/isTargetInput';
import { HorizontalLayoutMatrixBrain } from '../../VirtualBrain/HorizontalLayoutMatrixBrain';

import { InfiniteClsShiftingColumns } from '../InfiniteCls.css';
import { InternalVars } from '../internalVars.css';
import { getBodyNode } from '../components/InfiniteTableBody/bodyClassName';
import { getHeaderWrapperNodes } from '../components/InfiniteTableHeader/headerClassName';
import type { DragDropSourceAndTarget } from '../components/draggable/DragDropProvider';
import {
  clearInfiniteColumnReorderDuration,
  setInfiniteColumnOffsetWhileReordering,
  setInfiniteColumnVisibility,
  setInfiniteColumnZIndex,
} from '../utils/infiniteDOMUtils';
import { getColumnZIndex } from '../utils/getInfiniteCSSVars';
import adjustColumnOrderForAllColumns from './adjustColumnOrderForAllColumns';
import {
  reorderColumnsOnDrag,
  ReorderDragResult,
} from './reorderColumnsOnDrag';

import type { InfiniteTablePropColumnPinning } from '../types';
import type { InfiniteTableStableContextValue } from '../types/InfiniteTableContextValue';

type ColumnPointerEventsContext<T> = Pick<
  InfiniteTableStableContextValue<T>,
  'getState' | 'getComputed' | 'actions' | 'api'
>;

const baseZIndexForCells = stripVar(InternalVars.baseZIndexForCells);

type TopLeft = {
  left: number;
  top: number;
};
export type ProxyPositionRef = Ref<TopLeft | null>;

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

// there's no DragDropProvider (grouping toolbar) in the Vue port yet, so
// this returns the same default the React context has without a provider
const getCurrentDragSourceAndTarget = (): DragDropSourceAndTarget => ({
  dragSourceListId: null,
  dropTargetListId: null,
  dragItemId: '',
  status: 'accepted',
});

export function createColumnPointerDownHandler<T>(options: {
  columnId: string;
  context: ColumnPointerEventsContext<T>;
  domRef: { current: HTMLElement | null };
  getHorizontalLayoutPageIndex: () => number | null;
  allowColumnHideOnDrag: boolean;
  proxyPosition: ProxyPositionRef;
  dragColumnOutside: Ref<boolean>;
}) {
  const {
    columnId,
    context,
    domRef,
    getHorizontalLayoutPageIndex,
    allowColumnHideOnDrag,
    proxyPosition,
    dragColumnOutside,
  } = options;
  const { getState, getComputed, actions, api } = context;

  const defaultPointerDown = (e: PointerEvent) => {
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
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.target && isTargetInput(e.target)) {
      // early exit, so that (for example) checkbox selection works in the
      // column header when clicking the checkbox
      return;
    }

    const horizontalLayoutPageIndex = getHorizontalLayoutPageIndex();
    const rootRef = getState().domRef;

    const { brain, draggableColumnsRestrictTo } = getState();
    const {
      computedVisibleColumns,
      computedVisibleColumnsMap,
      computedPinnedStartColumns,
      computedUnpinnedColumns,
      computedPinnedEndColumns,
    } = getComputed();

    const dragColumn = computedVisibleColumnsMap.get(columnId)!;

    if (!dragColumn || !dragColumn.computedDraggable) {
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

    let initialCursor: string = target.style.cursor ?? 'auto';

    let didDragAtLeastOnce = false;

    const root = rootRef.current!;
    const bodyNode = Rectangle.from(getBodyNode(root)!.getBoundingClientRect());
    const headerWrapperNodes = getHeaderWrapperNodes(root).map((node) =>
      Rectangle.from(node.getBoundingClientRect()),
    );
    const acceptDropToReorderRect = bodyNode.getMinimumBoundingRectangle(
      ...headerWrapperNodes,
    );

    const dragger = reorderColumnsOnDrag({
      brain,
      horizontalLayoutPageIndex,
      allowColumnHideOnDrag,
      pageWidth,
      draggableColumnsRestrictTo,
      computedPinnedEndColumns,
      computedPinnedStartColumns,
      computedUnpinnedColumns,
      computedVisibleColumns,
      computedVisibleColumnsMap,
      dragColumnHeaderTargetRect: targetRect,
      dragColumnId: columnId,
      getCurrentDragSourceAndTarget,
      api,
      infiniteDOMNode: rootRef.current!,
      setProxyPosition: (position) => {
        proxyPosition.value = position;
      },
      setDragColumnOutside: (outside) => {
        dragColumnOutside.value = outside;
      },
      tableRect,
      acceptDropToReorderRect,
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

      // we can't simply assign `columnOrder`, as it would discard non
      // visible columns from the column order (the `columnOrder` variable
      // only takes into account visible columns), so we have to adjust it
      // to account for all columns
      actions.columnOrder = adjustColumnOrderForAllColumns({
        newColumnOrder: columnOrder,
        visibleColumnOrder: getComputed().computedVisibleColumns.map(
          (c) => c.id,
        ),
        existingColumnOrder: currentComputedColumnOrder,
        dragColumnId: columnId,
      });
    }

    const onPointerMove = (e: PointerEvent) => {
      const { headerBrain, brain } = getState();
      if (!didDragAtLeastOnce) {
        didDragAtLeastOnce = true;

        const discardForBody = brain.keepColumnRendered(
          dragColumnIndexInHorizontalLayout,
        );
        const discardForHeader = headerBrain.keepColumnRendered(
          dragColumnIndexInHorizontalLayout,
        );

        if (brain.isHorizontalLayoutBrain) {
          const extendBy = true;
          const restoreBodyRange = brain.extendRenderRange({
            start: extendBy,
            end: extendBy,
            direction: 'horizontal',
          });
          const restoreHeaderRange = headerBrain.extendRenderRange({
            start: extendBy,
            end: extendBy,
            direction: 'horizontal',
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
      const pointerId = e.pointerId;
      requestAnimationFrame(async () => {
        const { multiSortBehavior } = getState();
        const target = domRef.current!;
        const rootNode = rootRef.current;
        rootNode?.classList.remove(InfiniteClsShiftingColumns);

        dragger.stop();

        brain.update({
          ...initialAvailableSize,
        });
        discardAlwaysRenderedColumn?.();
        restoreRenderRange?.();

        target.style.cursor = initialCursor as string;
        target.releasePointerCapture(pointerId);

        target.removeEventListener('pointermove', onPointerMove);
        target.removeEventListener('pointerup', onPointerUp);

        proxyPosition.value = null;

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
        } else if (didDragAtLeastOnce) {
          if (allowColumnHideOnDrag) {
            // the column was dropped outside, so we need to hide it
            api.setVisibilityForColumn(dragColumn.id, false);
          }
        }
        actions.columnReorderDragColumnId = false;
        if (horizontalLayoutPageIndex != null) {
          actions.columnReorderInPageIndex = null;
        }

        // React uses flushSync so the state commit happens before the
        // drag-only CSS vars are cleared - in Vue we wait for the render
        // triggered by the actions above to flush
        await nextTick();

        computedVisibleColumns.forEach((col) => {
          clearInfiniteColumnReorderDuration(
            col.computedVisibleIndex,
            rootNode,
          );
          setInfiniteColumnVisibility(col.computedVisibleIndex, '', rootNode);
          setInfiniteColumnOffsetWhileReordering(
            col.computedVisibleIndex,
            '',
            rootNode,
          );
        });

        setInfiniteColumnZIndex(
          dragColumnIndex,
          getColumnZIndex(dragColumn, {
            pinnedStartColsCount: computedPinnedStartColumns.length,
            visibleColsCount: computedVisibleColumns.length,
          }),
          rootNode,
        );
      });
    };

    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerup', onPointerUp);

    target.setPointerCapture(e.pointerId);
  };

  return {
    onPointerDown: (e: PointerEvent) => {
      const computedCol = getComputed().computedVisibleColumnsMap.get(columnId);
      if (computedCol?.computedDraggable) {
        onPointerDown(e);
      } else {
        if (!(e.target && isTargetInput(e.target))) {
          defaultPointerDown(e);
        }
      }
    },
  };
}
