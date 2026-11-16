/**
 * The framework-neutral part of DragList: what a drag list does with the
 * DOM, the pointer and the DragManager.
 *
 * Each framework has its own DragList (DragList.tsx, DragList.vue.ts), which
 * owns the state, the context and the scheduling, and calls the functions
 * in here for everything else - so the behaviour of a drag is the same in
 * every framework.
 */
import { type DragInteractionTargetData, DragManager } from './DragManager';
import type { DragOperation } from './DragManager';
import { Rectangle } from '../../../../utils/pageGeometry/Rectangle';
import {
  DragInteractionTarget,
  DragInteractionTargetMoveEvent,
} from './DragInteractionTarget';
import { getGlobal } from '../../../../utils/getGlobal';
import { selectParent } from '../../../../utils/selectParent';
import { AutoScroller } from './AutoScroller';
import type { DragDropSourceAndTarget } from './DragDropProvider';

export const DRAG_LIST_ATTRIBUTE = 'data-drag-list-id';
export const DRAG_ITEM_ATTRIBUTE = 'data-drag-item-id';
export const DRAG_ITEM_LIST_ATTRIBUTE = 'data-drag-item-list-id';
export const DRAG_ITEM_SELECTOR = `[${DRAG_ITEM_ATTRIBUTE}]`;

export type DragProxySetupParams = {
  dragItemNode: HTMLElement;
  dragItemId: string;
  initialRect: DOMRect;
  initialCoords: { left: number; top: number };
  /**
   * Lazy getter. On first access it creates the default proxy: clones the
   * drag item node, applies fixed-position styles, and appends it to
   * document.body. Subsequent accesses return the same element.
   */
  readonly proxyElement: HTMLElement;
};

export type DragProxySetupResult = {
  /** If omitted, the default proxy (from params.proxyElement) is used. */
  proxyElement?: HTMLElement;
  /** Called on drop/cancel with a reference to the proxy element. */
  cleanup?: (params: { proxyElement: HTMLElement }) => void;
};

export type DragProxyMoveParams = {
  proxyElement: HTMLElement;
  dx: number;
  dy: number;
};

/**
 * What a `renderDragProxy` function is called with, without the `ref`,
 * which is specific to each framework.
 */
export type DragProxyRenderState = {
  /**
   * The id of the item being dragged. `null` on the final cleanup call
   * (drop/cancel) — return null to unmount the proxy.
   */
  dragItemId: string | null;
  initialRect: DOMRect;
  dx: number;
  dy: number;
};

/**
 * The props of a DragList that don't depend on the framework.
 *
 * NOTE: DragListProps of the React build (DragList.tsx) declares these
 * again, as that's a published type - keep the two in sync.
 */
export type DragListBaseProps = {
  dragListId: string;
  orientation: 'horizontal' | 'vertical';
  acceptDropsFrom?: string[];
  removeOnDropOutside?: boolean;
  shouldAcceptDrop?: (event: DragInteractionTargetMoveEvent) => boolean;
  onRemove?: (
    sortedIndexes: number[],
    options: {
      dragIndex: number;
      dragItemId: string;
    },
  ) => void;
  onAcceptDrop?: (options: {
    dragItemId: string;
    dragSourceListId: string;
    dropTargetListId: string;
    dragIndex: number;
    dropIndex: number;
    dropItemId?: string;
  }) => void;
  onDrop: (
    sortedIndexes: number[],
    options: {
      dragIndex: number;
      dropIndex: number;
      dragItemId: string;
      dropItemId?: string;
    },
  ) => void;

  updatePosition?: (options: {
    id: string;
    node: HTMLElement;
    offset: null | { left: number; top: number };
  }) => void;

  /**
   * Controls how the dragged item is rendered during a drag operation.
   *
   * - `'inline'`: the item stays in the DOM flow and moves via CSS transforms.
   * - `'proxy'`: (default) a fixed-position clone is created outside scroll containers so it is
   *   never clipped by overflow. The original item is visually hidden during the drag.
   */
  dragStrategy?: 'inline' | 'proxy';

  /**
   * Called once on the first pointer move to create the drag proxy.
   * Access params.proxyElement to get (and lazily create) the default proxy,
   * or build your own and return it.
   * If the returned object omits proxyElement, the default is used.
   * Only called when dragStrategy is 'proxy' and renderDragProxy is not provided.
   */
  onDragProxySetup?: (
    params: DragProxySetupParams,
  ) => DragProxySetupResult | void;

  /**
   * Called on every pointer move to reposition the proxy.
   * The default implementation sets transform: translate3d(dx, dy, 0).
   * Only called when dragStrategy is 'proxy' and renderDragProxy is not provided.
   */
  onDragProxyMove?: (params: DragProxyMoveParams) => void;

  /**
   * When true, the space occupied by the dragged item in the source list
   * is preserved (not collapsed) while dragging outside the list.
   */
  preserveDragSpace?: boolean;
};

/**
 * A mutable value that lives as long as the drag list.
 */
type Ref<T> = { current: T };

export type DragListProxyState = {
  proxyElement: HTMLElement;
  originalNode: HTMLElement;
  dragItemId: string;
  initialRect: DOMRect;
  cleanup?: (params: { proxyElement: HTMLElement }) => void;
};

/**
 * Sets the state of the proxy rendered by `renderDragProxy`, from the
 * previous one.
 */
export type UpdateDragProxyRenderState = (
  update: (
    previous: DragProxyRenderState | null,
  ) => DragProxyRenderState | null,
) => void;

const RETURN_NULL = () => null;

export const defaultUpdatePosition: NonNullable<
  DragListBaseProps['updatePosition']
> = (options) => {
  const { node, offset } = options;
  if (!offset) {
    node.style.transform = 'none';
    return;
  }

  node.style.transform = `translate3d(${offset.left}px, ${offset.top}px, 0px)`;
};

const getDraggableItemId = (node: HTMLElement) => {
  return `${node.getAttribute(DRAG_ITEM_ATTRIBUTE)}`;
};

export function getDraggableItemNodes(
  domRef: Ref<HTMLElement | null>,
  dragListId: string,
) {
  const dragItems = domRef.current?.querySelectorAll(DRAG_ITEM_SELECTOR) ?? [];

  const result = Array.from(dragItems).filter(
    (item) => item.getAttribute(DRAG_ITEM_LIST_ATTRIBUTE) === `${dragListId}`,
  ) as HTMLElement[];
  return result;
}

function getDraggableItems(
  domRef: Ref<HTMLElement | null>,
  dragListId: string,
) {
  const dragItems = getDraggableItemNodes(domRef, dragListId);

  const draggableItems = Array.from(dragItems).map((item) => {
    const id = getDraggableItemId(item as HTMLElement);
    const rect = item.getBoundingClientRect();

    return {
      id,
      rect,
    };
  });

  return draggableItems;
}

function getInteractionTargetData(params: {
  domRef: Ref<HTMLElement | null>;
  orientation: 'horizontal' | 'vertical';
  dragListId: string;
  initial: boolean;
  acceptDropsFrom?: string[];
  removeOnDropOutside?: boolean;
  shouldAcceptDrop?: (event: DragInteractionTargetMoveEvent) => boolean;
  preserveDragSpace?: boolean;
}): DragInteractionTargetData {
  const { domRef, orientation, dragListId } = params;

  const draggableItems = getDraggableItems(domRef, dragListId);
  const domRect = domRef.current!.getBoundingClientRect();

  // Expand the list rectangle to encompass all draggable items,
  // including those scrolled out of view. This is necessary because
  // during drag+scroll the pointer position is adjusted by scroll offset,
  // and the containment check must still pass for those virtual positions.
  let top = domRect.top;
  let left = domRect.left;
  let bottom = domRect.bottom;
  let right = domRect.right;

  for (const item of draggableItems) {
    const r = item.rect;
    if (r.top < top) top = r.top;
    if (r.left < left) left = r.left;
    if (r.bottom > bottom) bottom = r.bottom;
    if (r.right > right) right = r.right;
  }

  const listRectangle = Rectangle.from({
    top,
    left,
    width: right - left,
    height: bottom - top,
  });

  const options: DragInteractionTargetData = {
    draggableItems,
    orientation,
    listId: dragListId,
    listRectangle,
    acceptDropsFrom: params.acceptDropsFrom,
    shouldAcceptDrop: params.shouldAcceptDrop,
    initial: params.initial,
    preserveDragSpace: params.preserveDragSpace,
  };

  return options;
}

function createInteractionTarget(
  params: Parameters<typeof getInteractionTargetData>[0],
) {
  const target = new DragInteractionTarget(getInteractionTargetData(params));

  return target;
}

/**
 * Finds the element of the list - the one the `domProps` were spread on.
 */
export function findDragListElement(
  domRef: Ref<HTMLElement | null>,
  dragListId: string,
) {
  const dragList = document.querySelector(
    `[${DRAG_LIST_ATTRIBUTE}="${dragListId}"]`,
  );
  if (dragList) {
    domRef.current = dragList as HTMLDivElement;
  } else {
    console.warn(
      `DragList with id "${dragListId}" not found. You're probably not spreading the domProps to the parent element. Make sure you also include the "className" prop.`,
    );
  }
}

/**
 * Makes `interactionTarget` the target this list has registered with the
 * DragManager, and unregisters the one it had before.
 *
 * The registered target is kept in a ref: a pointer up can come before the
 * framework has rendered what followed the pointer down, and the target
 * registered on pointer down still has to be unregistered.
 */
export function replaceRegisteredInteractionTarget(
  registeredTargetRef: Ref<DragInteractionTarget | null>,
  interactionTarget: DragInteractionTarget | null,
) {
  const registeredTarget = registeredTargetRef.current;

  if (registeredTarget && registeredTarget !== interactionTarget) {
    DragManager.unregisterDragInteractionTarget(registeredTarget);
  }
  registeredTargetRef.current = interactionTarget;

  if (interactionTarget) {
    DragManager.registerDragInteractionTarget(interactionTarget);
  }
}

/**
 * When a drag starts in another list, and this list accepts drops from it,
 * this list gets an interaction target as well, for as long as the drag lasts.
 *
 * Returns the function that stops listening.
 */
export function acceptDragsFromOtherLists(options: {
  getProps: () => Pick<
    DragListBaseProps,
    'dragListId' | 'acceptDropsFrom' | 'orientation' | 'shouldAcceptDrop'
  >;
  domRef: Ref<HTMLElement | null>;
  setInteractionTarget: (
    interactionTarget: DragInteractionTarget | null,
  ) => void;
}) {
  const { getProps, domRef, setInteractionTarget } = options;

  return DragManager.on('register', (interactionTarget) => {
    const { dragListId, acceptDropsFrom, orientation, shouldAcceptDrop } =
      getProps();

    const interactionTargetData = interactionTarget.getData();

    if (!interactionTargetData.initial) {
      return;
    }

    if (interactionTargetData.listId === dragListId) {
      return;
    }

    // a drag has started in another drag list
    if (acceptDropsFrom?.includes(interactionTargetData.listId)) {
      // we need to create the interaction target for this current list
      // so it can listen to the drag operation

      const newInteractionTarget = createInteractionTarget({
        domRef,
        orientation,
        dragListId,
        initial: false,
        acceptDropsFrom,
        shouldAcceptDrop,
      });

      interactionTarget.once('unregister', () => {
        setInteractionTarget(null);
      });

      setInteractionTarget(newInteractionTarget);
    }
  });
}

/**
 * Creates the default proxy element: clones the node, applies fixed-position
 * styles, and appends it to document.body.
 */
export function createDefaultProxy(
  dragItemNode: HTMLElement,
  initialRect: DOMRect,
): HTMLElement {
  const proxy = dragItemNode.cloneNode(true) as HTMLElement;
  proxy.removeAttribute(DRAG_ITEM_ATTRIBUTE);
  proxy.style.position = 'fixed';
  proxy.style.top = `${initialRect.top}px`;
  proxy.style.left = `${initialRect.left}px`;
  proxy.style.width = `${initialRect.width}px`;
  proxy.style.height = `${initialRect.height}px`;
  proxy.style.zIndex = '999999';
  proxy.style.pointerEvents = 'none';
  proxy.style.margin = '0';
  proxy.style.boxSizing = 'border-box';
  proxy.style.transform = 'none';
  document.body.appendChild(proxy);
  return proxy;
}

export function defaultDragProxyMove({
  proxyElement,
  dx,
  dy,
}: DragProxyMoveParams) {
  proxyElement.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
}

function cleanupProxy(proxyStateRef: Ref<DragListProxyState | null>) {
  const state = proxyStateRef.current;
  if (!state) return;

  if (state.cleanup) {
    state.cleanup({ proxyElement: state.proxyElement });
  } else {
    state.proxyElement.remove();
  }
  state.originalNode.style.visibility = '';
  proxyStateRef.current = null;
}

/**
 * The item nodes of the list, as they were when the current drag started.
 */
export function getDragItemNodes(
  dragItemsRef: Ref<HTMLElement[]>,
  domRef: Ref<HTMLElement | null>,
  dragListId: string,
) {
  let dragItems: HTMLElement[] = dragItemsRef.current;

  if (!dragItems || dragItems.length === 0) {
    dragItems = getDraggableItemNodes(domRef, dragListId);

    dragItemsRef.current = dragItems;
  }

  return dragItems;
}

/**
 * Makes the list follow the drag its interaction target takes part in:
 * it moves the items on `move`, and on `drop` it puts everything back and
 * calls `onAcceptDrop`, `onRemove` or `onDrop`.
 *
 * For a list that is only a target of the drag, it also scrolls the list
 * when the pointer is near its edge.
 *
 * Returns the function that undoes all of the above.
 */
export function bindInteractionTarget(
  interactionTarget: DragInteractionTarget,
  options: {
    dragListId: string;
    orientation: 'horizontal' | 'vertical';

    domRef: Ref<HTMLElement | null>;
    proxyStateRef: Ref<DragListProxyState | null>;
    sourceScrollOffsetRef: Ref<{ top: number; left: number }>;
    dragItemsRef: Ref<HTMLElement[]>;
    getDragItems: () => HTMLElement[];

    // the callbacks are read when they are called, to always have the latest
    getOnDrop: () => DragListBaseProps['onDrop'];
    getOnAcceptDrop: () => DragListBaseProps['onAcceptDrop'];
    getOnRemove: () => DragListBaseProps['onRemove'];
    getUpdatePosition: () => NonNullable<DragListBaseProps['updatePosition']>;

    updateDragOperationSourceAndTarget: (
      params: DragDropSourceAndTarget,
    ) => void;
    updateDragProxyRenderState: UpdateDragProxyRenderState;
  },
) {
  const {
    dragListId,
    orientation,
    domRef,
    proxyStateRef,
    sourceScrollOffsetRef,
    dragItemsRef,
    getDragItems,
    getOnDrop,
    getOnAcceptDrop,
    getOnRemove,
    getUpdatePosition,
    updateDragOperationSourceAndTarget,
    updateDragProxyRenderState,
  } = options;

  const removeOnDragStart = interactionTarget.on(
    'start',
    ({ dragItem, dragSourceListId, dropTargetListId }) => {
      updateDragOperationSourceAndTarget({
        dragSourceListId,
        dropTargetListId,
        dragItemId: dragItem.id,
        status: 'accepted',
      });
    },
  );

  const removeOnDragMove = interactionTarget.on(
    'move',
    ({ offsetsForItems, items, status, dragItem }) => {
      if (status === 'rejected') {
        return;
      }

      const dragItems = getDragItems();

      const updatePosition = getUpdatePosition();
      const proxyState = proxyStateRef.current;

      items.forEach((item, index) => {
        let offset = offsetsForItems[index];
        const node = dragItems![index] as HTMLElement;

        if (!node) {
          return;
        }

        if (proxyState && item.id === proxyState.dragItemId) {
          return;
        }

        if (!proxyState && item.id === dragItem.id) {
          const scrollOffset = sourceScrollOffsetRef.current;
          offset = {
            left: offset.left + scrollOffset.left,
            top: offset.top + scrollOffset.top,
          };
        }

        updatePosition({
          id: item.id,
          node,
          offset,
        });
      });
    },
  );

  const removeOnDragDrop = interactionTarget.on('drop', (params) => {
    const {
      sortedIndexes,
      dragIndex,
      dropIndex,
      dragItem,
      items,
      dragSourceListId,
      dropTargetListId,
      outside,
      status,
    } = params;

    const dragItems = getDragItems();

    dragItemsRef.current = [];

    const onAcceptDrop = getOnAcceptDrop();
    const onRemove = getOnRemove();
    const onDrop = getOnDrop();
    const updatePosition = getUpdatePosition();

    items.forEach((item, index) => {
      const node = dragItems![index] as HTMLElement;
      if (!node) {
        return;
      }

      updatePosition({
        id: item.id,
        node,
        offset: null,
      });
    });

    cleanupProxy(proxyStateRef);

    updateDragProxyRenderState((prev) => {
      if (!prev) return prev;
      requestAnimationFrame(() => updateDragProxyRenderState(RETURN_NULL));
      return { ...prev, dragItemId: null };
    });

    const accepted = status === 'accepted';

    if (dragListId === dropTargetListId && dragSourceListId !== dragListId) {
      if (onAcceptDrop && accepted) {
        onAcceptDrop({
          dragItemId: dragItem.id,
          dragSourceListId,
          dropTargetListId,
          dragIndex,
          dropIndex,
          dropItemId: items[dropIndex]?.id,
        });
      }
    }

    let callbackFn: typeof onRemove | typeof onDrop | null = null;

    if (
      dropIndex === -1 &&
      dragSourceListId === dragListId &&
      dropTargetListId === dragListId &&
      outside
    ) {
      // removing from the list
      callbackFn = onRemove;
    }
    if (
      dropIndex !== -1 &&
      dropTargetListId === dragListId &&
      dragSourceListId === dragListId
    ) {
      // reordering the list
      callbackFn = onDrop;
    }

    if (callbackFn) {
      callbackFn?.(sortedIndexes, {
        dragIndex,
        dropIndex,
        dragItemId: items[dragIndex].id,
        dropItemId: items[dropIndex]?.id,
      });
    }
  });

  // For target lists (non-initial), set up auto-scrolling so that
  // dragging near the target's scroll container edge scrolls it.
  // Source list auto-scroll is handled separately in startDragOnPointerDown.
  let targetAutoScroller: AutoScroller | null = null;
  let targetScrollContainer: HTMLElement | null = null;
  let targetScrollHandler: (() => void) | null = null;
  let targetPointermoveHandler: ((e: PointerEvent) => void) | null = null;

  if (!interactionTarget.getData().initial && domRef.current) {
    targetAutoScroller = new AutoScroller({
      orientation,
      onScroll: () => {},
    });
    targetAutoScroller.start(domRef.current);
    targetScrollContainer = targetAutoScroller.getScrollContainer();

    if (targetScrollContainer) {
      let lastScroll =
        orientation === 'vertical'
          ? targetScrollContainer.scrollTop
          : targetScrollContainer.scrollLeft;

      targetScrollHandler = () => {
        const current =
          orientation === 'vertical'
            ? targetScrollContainer!.scrollTop
            : targetScrollContainer!.scrollLeft;
        const delta = current - lastScroll;
        lastScroll = current;

        if (delta !== 0) {
          interactionTarget.adjustForScroll(delta);
          DragManager.retriggerMove();
        }
      };

      targetScrollContainer.addEventListener('scroll', targetScrollHandler);
    }

    targetPointermoveHandler = (e: PointerEvent) => {
      targetAutoScroller!.updatePointer({
        left: e.clientX,
        top: e.clientY,
      });
    };
    getGlobal().addEventListener('pointermove', targetPointermoveHandler);
  }

  return () => {
    removeOnDragStart();
    removeOnDragMove();
    removeOnDragDrop();

    if (targetAutoScroller) {
      targetAutoScroller.stop();
    }
    if (targetScrollContainer && targetScrollHandler) {
      targetScrollContainer.removeEventListener('scroll', targetScrollHandler);
    }
    if (targetPointermoveHandler) {
      getGlobal().removeEventListener('pointermove', targetPointermoveHandler);
    }
  };
}

/**
 * The pointer event of each framework has at least this.
 */
type DragItemPointerDownEvent = {
  currentTarget: EventTarget | null;
  clientX: number;
  clientY: number;
};

/**
 * Called on pointer down on a drag item (or on its drag handle).
 *
 * Registers the list as the source of a possible drag and listens to the
 * pointer: the drag only starts on the first pointer move, so a click is
 * not a drag. It ends on pointer up, with a drop, or on pointer cancel,
 * without one.
 *
 * `props` are the props of the list as they are on pointer down - they are
 * all read here, before the first pointer move.
 */
export function startDragOnPointerDown(
  e: DragItemPointerDownEvent,
  props: Pick<
    DragListBaseProps,
    | 'dragListId'
    | 'orientation'
    | 'acceptDropsFrom'
    | 'preserveDragSpace'
    | 'dragStrategy'
    | 'onDragProxySetup'
    | 'onDragProxyMove'
  > & {
    /**
     * Framework-specific; only whether there is one matters here.
     */
    renderDragProxy?: unknown;
  },
  options: {
    domRef: Ref<HTMLElement | null>;
    proxyStateRef: Ref<DragListProxyState | null>;
    sourceScrollOffsetRef: Ref<{ top: number; left: number }>;
    dragItemsRef: Ref<HTMLElement[]>;

    setInteractionTarget: (
      interactionTarget: DragInteractionTarget | null,
    ) => void;
    updateDragProxyRenderState: UpdateDragProxyRenderState;
  },
) {
  const {
    dragListId,
    orientation,
    acceptDropsFrom,
    preserveDragSpace,
    onDragProxySetup,
  } = props;
  const {
    domRef,
    proxyStateRef,
    sourceScrollOffsetRef,
    dragItemsRef,
    setInteractionTarget,
    updateDragProxyRenderState,
  } = options;

  const dragStrategy = props.dragStrategy ?? 'proxy';
  const useProxy = dragStrategy === 'proxy' && !props.renderDragProxy;
  const useRenderProxy = dragStrategy === 'proxy' && !!props.renderDragProxy;
  const proxyMove = props.onDragProxyMove ?? defaultDragProxyMove;

  const target = e.currentTarget as HTMLElement;
  let dragItemId = target.getAttribute(DRAG_ITEM_ATTRIBUTE);

  if (dragItemId == null) {
    const parentDragItem = selectParent(target, DRAG_ITEM_SELECTOR);
    if (parentDragItem) {
      dragItemId = parentDragItem.getAttribute(DRAG_ITEM_ATTRIBUTE);
    }
  }

  if (dragItemId == null) {
    console.warn(
      `Could not find drag item id for element`,
      target,
      `Make sure you have a parent element with a ${DRAG_ITEM_ATTRIBUTE} attribute`,
    );
    return;
  }

  dragItemId = `${dragItemId}`;

  let dragOperation: DragOperation | null = null;

  const dragItems = getDraggableItemNodes(domRef, dragListId);

  dragItemsRef.current = dragItems;

  const interactionTarget = createInteractionTarget({
    domRef,
    orientation,
    dragListId,
    acceptDropsFrom,
    initial: true,
    preserveDragSpace,
  });

  const draggableItems = interactionTarget.getData().draggableItems;

  const dragIndex = draggableItems.findIndex((item) => item.id === dragItemId);

  if (dragIndex === -1) {
    return;
  }

  const dragItem = draggableItems[dragIndex];

  const dragItemNode =
    dragItems[dragIndex]?.getAttribute(DRAG_ITEM_ATTRIBUTE) === `${dragItemId}`
      ? dragItems[dragIndex]
      : dragItems.find(
          (node) => node.getAttribute(DRAG_ITEM_ATTRIBUTE) === `${dragItemId}`,
        );

  setInteractionTarget(interactionTarget);

  // we don't want to create the drag operation here
  // as we don't want to react to normal "click" events
  // we'll create the drag operation in the pointer move event

  const initialCoords = {
    left: e.clientX,
    top: e.clientY,
  };

  let lastPointer = { left: e.clientX, top: e.clientY };
  sourceScrollOffsetRef.current = { top: 0, left: 0 };

  const autoScroller = new AutoScroller({
    orientation,
    onScroll: () => {},
  });

  if (domRef.current) {
    autoScroller.start(domRef.current);
  }

  const scrollContainer = autoScroller.getScrollContainer();

  let lastSourceScroll = scrollContainer
    ? orientation === 'vertical'
      ? scrollContainer.scrollTop
      : scrollContainer.scrollLeft
    : 0;

  function fireDragMove() {
    if (!dragOperation) return;
    dragOperation.move({
      left: lastPointer.left,
      top: lastPointer.top,
    });
  }

  const onContainerScroll = () => {
    if (!scrollContainer) return;
    const current =
      orientation === 'vertical'
        ? scrollContainer.scrollTop
        : scrollContainer.scrollLeft;
    const delta = current - lastSourceScroll;
    lastSourceScroll = current;

    if (delta !== 0) {
      interactionTarget.adjustForScroll(delta);
      if (orientation === 'vertical') {
        sourceScrollOffsetRef.current.top += delta;
      } else {
        sourceScrollOffsetRef.current.left += delta;
      }
    }

    fireDragMove();
  };
  scrollContainer?.addEventListener('scroll', onContainerScroll);

  const onPointerMove = (e: PointerEvent) => {
    lastPointer = { left: e.clientX, top: e.clientY };

    if (!dragOperation) {
      dragOperation = DragManager.startDrag(
        {
          listId: dragListId,
          dragItem,
          dragIndex,
        },
        initialCoords,
      );

      if (dragItemNode && useProxy) {
        const rect = dragItemNode.getBoundingClientRect();

        let cachedProxy: HTMLElement | null = null;
        const setupParams: DragProxySetupParams = {
          dragItemNode,
          dragItemId: `${dragItemId}`,
          initialRect: rect,
          initialCoords,
          get proxyElement() {
            if (!cachedProxy) {
              cachedProxy = createDefaultProxy(dragItemNode, rect);
            }
            return cachedProxy;
          },
        };

        const setupResult = onDragProxySetup?.(setupParams);
        const proxyElement =
          setupResult?.proxyElement ?? setupParams.proxyElement;

        dragItemNode.style.visibility = 'hidden';
        proxyStateRef.current = {
          proxyElement,
          originalNode: dragItemNode,
          dragItemId: `${dragItemId}`,
          initialRect: rect,
          cleanup: setupResult?.cleanup,
        };
      }

      if (dragItemNode && useRenderProxy) {
        const rect = dragItemNode.getBoundingClientRect();
        dragItemNode.style.visibility = 'hidden';

        proxyStateRef.current = {
          proxyElement: dragItemNode,
          originalNode: dragItemNode,
          dragItemId: `${dragItemId}`,
          initialRect: rect,
          // Portal handles its own DOM; only restore visibility.
          cleanup: () => {},
        };

        const initialRenderState: DragProxyRenderState = {
          dragItemId: `${dragItemId}`,
          initialRect: rect,
          dx: 0,
          dy: 0,
        };
        updateDragProxyRenderState(() => initialRenderState);
      }
    }

    const dx = e.clientX - initialCoords.left;
    const dy = e.clientY - initialCoords.top;

    if (useRenderProxy) {
      updateDragProxyRenderState((prev) => (prev ? { ...prev, dx, dy } : prev));
    } else {
      const proxyState = proxyStateRef.current;
      if (proxyState) {
        proxyMove({ proxyElement: proxyState.proxyElement, dx, dy });
      }
    }

    autoScroller.updatePointer({
      left: e.clientX,
      top: e.clientY,
    });

    fireDragMove();
  };

  // While the pointer is down, the browser must not start a drag of its own:
  // a press on selected text (or on an image or a link) would start one,
  // and the browser then cancels the pointer.
  const preventNativeDrag = (e: Event) => {
    e.preventDefault();
  };

  const endDrag = (cancelled: boolean) => {
    autoScroller.stop();
    scrollContainer?.removeEventListener('scroll', onContainerScroll);

    win.removeEventListener('pointermove', onPointerMove);
    win.removeEventListener('pointerup', onPointerUp);
    win.removeEventListener('pointercancel', onPointerCancel);
    win.removeEventListener('dragstart', preventNativeDrag, true);

    if (useRenderProxy) {
      updateDragProxyRenderState((prev) =>
        prev ? { ...prev, dragItemId: null } : prev,
      );
      requestAnimationFrame(() => {
        updateDragProxyRenderState(RETURN_NULL);
      });
    }

    if (!dragOperation) {
      cleanupProxy(proxyStateRef);
      setInteractionTarget(null);
      return;
    }

    if (cancelled) {
      dragOperation.cancel();
    } else {
      dragOperation.drop();
    }
    dragOperation = null;
  };

  const onPointerUp = () => endDrag(false);
  const onPointerCancel = () => endDrag(true);

  const win = getGlobal();
  win.addEventListener('pointermove', onPointerMove);
  win.addEventListener('pointerup', onPointerUp);
  win.addEventListener('pointercancel', onPointerCancel);
  win.addEventListener('dragstart', preventNativeDrag, true);
}
