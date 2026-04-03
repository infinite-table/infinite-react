import * as React from 'react';

import {
  type DragInteractionTargetData,
  DragManager,
  DragOperation,
} from './DragManager';
import { useCallback, useEffect, useState } from 'react';
import { DraggableItemRecipe, DragListRecipe } from './DragList.css';
import { join } from '../../../../utils/join';
import { Rectangle } from '../../../../utils/pageGeometry/Rectangle';
import { useDragDropProvider } from './DragDropProvider';
import { useLatest } from '../../../hooks/useLatest';
import {
  DragInteractionTarget,
  DragInteractionTargetMoveEvent,
} from './DragInteractionTarget';
import { getGlobal } from '../../../../utils/getGlobal';
import { selectParent } from '../../../../utils/selectParent';
import { AutoScroller } from './AutoScroller';

type DragListContextValue = {
  dragItemId: string | number | null;
  onDragItemPointerDown: (e: React.PointerEvent) => void;
  draggingInProgress: boolean;
  dragListId: string;
  dragSourceListId: string | null;
  dropTargetListId: string | null;
  status: 'accepted' | 'rejected';
};
const DragListContext = React.createContext<DragListContextValue>({
  dragItemId: null,
  onDragItemPointerDown: () => {},
  draggingInProgress: false,
  dragListId: '',
  status: 'accepted',
  dragSourceListId: null,
  dropTargetListId: null,
});

export const useDragListContext = () => {
  return React.useContext(DragListContext);
};

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

export type DragProxyRenderParams = {
  /**
   * The id of the item being dragged. `null` on the final cleanup call
   * (drop/cancel) — return null to unmount the proxy.
   */
  dragItemId: string | null;
  initialRect: DOMRect;
  dx: number;
  dy: number;
  /** Must be passed to the root element of the rendered proxy. */
  ref: React.RefCallback<HTMLElement>;
};

export type DragListProps = {
  dragListId: string;
  children: (
    domProps: React.HTMLProps<HTMLDivElement>,

    context: DragListContextValue,
  ) => React.ReactNode;
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
   * - `'inline'` (default): the item stays in the DOM flow and moves via CSS transforms.
   * - `'proxy'`: a fixed-position clone is created outside scroll containers so it is
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
   * Render a custom React element as the drag proxy. The function should
   * call createPortal() itself and attach params.ref to the root element.
   * When provided, onDragProxySetup and onDragProxyMove are ignored.
   * The original DOM node is hidden automatically.
   * Called with dragItemId: null on drop/cancel — return null to unmount.
   */
  renderDragProxy?: (params: DragProxyRenderParams) => React.ReactNode;

  /**
   * When true, the space occupied by the dragged item in the source list
   * is preserved (not collapsed) while dragging outside the list.
   */
  preserveDragSpace?: boolean;
};

const defaultUpdatePosition: DragListProps['updatePosition'] = (options) => {
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

function getDraggableItems(domRef: React.RefObject<HTMLElement | null>) {
  const dragItems = domRef.current?.querySelectorAll(DRAG_ITEM_SELECTOR) ?? [];
  if (!dragItems || dragItems.length === 0) {
    // console.log('No draggable items found in', domRef.current);
  }

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
  domRef: React.RefObject<HTMLElement | null>;
  orientation: 'horizontal' | 'vertical';
  dragListId: string;
  initial: boolean;
  acceptDropsFrom?: string[];
  removeOnDropOutside?: boolean;
  shouldAcceptDrop?: (event: DragInteractionTargetMoveEvent) => boolean;
  preserveDragSpace?: boolean;
}): DragInteractionTargetData {
  const { domRef, orientation, dragListId } = params;

  const draggableItems = getDraggableItems(domRef);
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

function useInteractionTarget(
  domRef: React.RefObject<HTMLElement | null>,
  props: DragListProps,
) {
  const getProps = useLatest(props);
  const [interactionTarget, doSetInteractionTarget] =
    React.useState<DragInteractionTarget | null>(null);

  const setInteractionTarget = useCallback(
    (interactionTarget: DragInteractionTarget | null) => {
      if (interactionTarget) {
        DragManager.registerDragInteractionTarget(interactionTarget);
      } else {
        const currentInteractionTarget = getInteractionTarget();
        if (currentInteractionTarget) {
          DragManager.unregisterDragInteractionTarget(currentInteractionTarget);
        }
      }

      doSetInteractionTarget(interactionTarget);
    },
    [],
  );
  const getInteractionTarget = useLatest(interactionTarget);

  useEffect(() => {
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
  }, [getProps]);

  return {
    interactionTarget,
    setInteractionTarget,
    getInteractionTarget,
  };
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

type ProxyState = {
  proxyElement: HTMLElement;
  originalNode: HTMLElement;
  dragItemId: string;
  initialRect: DOMRect;
  cleanup?: (params: { proxyElement: HTMLElement }) => void;
};

function cleanupProxy(proxyStateRef: React.RefObject<ProxyState | null>) {
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

export const DragList = (props: DragListProps) => {
  const domRef = React.useRef<HTMLElement | null>(null);
  const proxyStateRef = React.useRef<ProxyState | null>(null);

  const [dragProxyRenderState, setDragProxyRenderState] = useState<Omit<
    DragProxyRenderParams,
    'ref'
  > | null>(null);
  const sourceScrollOffsetRef = React.useRef({ top: 0, left: 0 });
  const proxyPortalNodeRef = React.useRef<HTMLElement | null>(null);
  const proxyRefCallback = React.useCallback((node: HTMLElement | null) => {
    proxyPortalNodeRef.current = node;
  }, []);

  const { dropTargetListId, dragSourceListId } = useDragDropProvider();

  const { updateDragOperationSourceAndTarget, dragItemId, status } =
    useDragDropProvider();

  const getOnDrop = useLatest(props.onDrop);
  const getOnAcceptDrop = useLatest(props.onAcceptDrop);
  const getOnRemove = useLatest(props.onRemove);
  const getUpdatePosition = useLatest(
    props.updatePosition ?? defaultUpdatePosition,
  );
  const { interactionTarget, setInteractionTarget } = useInteractionTarget(
    domRef,
    props,
  );

  useEffect(() => {
    const dragList = document.querySelector(
      `[${DRAG_LIST_ATTRIBUTE}="${props.dragListId}"]`,
    );
    if (dragList) {
      domRef.current = dragList as HTMLDivElement;
    } else {
      console.warn(
        `DragList with id "${props.dragListId}" not found. You're probably not spreading the domProps to the parent element. Make sure you also include the "className" prop.`,
      );
    }
  }, [props.dragListId]);

  useEffect(() => {
    if (interactionTarget) {
      const dragListId = props.dragListId;

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

        setDragProxyRenderState((prev) => {
          if (!prev) return prev;
          requestAnimationFrame(() => setDragProxyRenderState(null));
          return { ...prev, dragItemId: null };
        });

        const accepted = status === 'accepted';

        if (
          dragListId === dropTargetListId &&
          dragSourceListId !== dragListId
        ) {
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
      // Source list auto-scroll is handled separately in onDragItemPointerDown.
      let targetAutoScroller: AutoScroller | null = null;
      let targetScrollContainer: HTMLElement | null = null;
      let targetScrollHandler: (() => void) | null = null;
      let targetPointermoveHandler: ((e: PointerEvent) => void) | null = null;

      if (!interactionTarget.getData().initial && domRef.current) {
        targetAutoScroller = new AutoScroller({
          orientation: props.orientation,
          onScroll: () => {},
        });
        targetAutoScroller.start(domRef.current);
        targetScrollContainer = targetAutoScroller.getScrollContainer();

        if (targetScrollContainer) {
          let lastScroll =
            props.orientation === 'vertical'
              ? targetScrollContainer.scrollTop
              : targetScrollContainer.scrollLeft;

          targetScrollHandler = () => {
            const current =
              props.orientation === 'vertical'
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
          targetScrollContainer.removeEventListener(
            'scroll',
            targetScrollHandler,
          );
        }
        if (targetPointermoveHandler) {
          getGlobal().removeEventListener(
            'pointermove',
            targetPointermoveHandler,
          );
        }
      };
    }

    return undefined;
  }, [interactionTarget, props.dragListId]);

  const dragItemsRef = React.useRef<HTMLElement[]>([]);

  const getDragItems = useCallback(() => {
    let dragItems: HTMLElement[] = dragItemsRef.current;

    if (!dragItems || dragItems.length === 0) {
      dragItems = Array.from(
        domRef.current?.querySelectorAll(DRAG_ITEM_SELECTOR) ?? [],
      ) as HTMLElement[];

      dragItemsRef.current = dragItems;
    }

    return dragItems;
  }, []);

  const onDragItemPointerDown = useCallback(
    (e: React.PointerEvent) => {
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

      const dragItems = Array.from(
        domRef.current?.querySelectorAll(DRAG_ITEM_SELECTOR) ?? [],
      ) as HTMLElement[];

      dragItemsRef.current = dragItems;

      const interactionTarget = createInteractionTarget({
        domRef,
        orientation: props.orientation,
        dragListId: props.dragListId,
        acceptDropsFrom: props.acceptDropsFrom,
        initial: true,
        preserveDragSpace: props.preserveDragSpace,
      });

      const draggableItems = interactionTarget.getData().draggableItems;

      const dragIndex = draggableItems.findIndex(
        (item) => item.id === dragItemId,
      );
      const dragItem = draggableItems[dragIndex];

      const dragItemNode =
        dragItems[dragIndex].getAttribute(DRAG_ITEM_ATTRIBUTE) ===
        `${dragItemId}`
          ? dragItems[dragIndex]
          : dragItems.find(
              (node) =>
                node.getAttribute(DRAG_ITEM_ATTRIBUTE) === `${dragItemId}`,
            );

      setInteractionTarget(interactionTarget);

      // we don't want to create the drag operation here
      // as we don't want to react to normal "click" events
      // we'll create the drag operation in the pointer move event
      // requestAnimationFrame(() => {
      //   dragOperation = DragManager.startDrag(
      //     {
      //       listId: props.dragListId,
      //       dragItem,
      //       dragIndex,
      //     },
      //     {
      //       left: e.clientX,
      //       top: e.clientY,
      //     },
      //   );
      // });

      const initialCoords = {
        left: e.clientX,
        top: e.clientY,
      };

      let lastPointer = { left: e.clientX, top: e.clientY };
      sourceScrollOffsetRef.current = { top: 0, left: 0 };

      const autoScroller = new AutoScroller({
        orientation: props.orientation,
        onScroll: () => {},
      });

      if (domRef.current) {
        autoScroller.start(domRef.current);
      }

      const scrollContainer = autoScroller.getScrollContainer();

      let lastSourceScroll = scrollContainer
        ? props.orientation === 'vertical'
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
          props.orientation === 'vertical'
            ? scrollContainer.scrollTop
            : scrollContainer.scrollLeft;
        const delta = current - lastSourceScroll;
        lastSourceScroll = current;

        if (delta !== 0) {
          interactionTarget.adjustForScroll(delta);
          if (props.orientation === 'vertical') {
            sourceScrollOffsetRef.current.top += delta;
          } else {
            sourceScrollOffsetRef.current.left += delta;
          }
        }

        fireDragMove();
      };
      scrollContainer?.addEventListener('scroll', onContainerScroll);

      const dragStrategy = props.dragStrategy ?? 'proxy';
      const useProxy = dragStrategy === 'proxy' && !props.renderDragProxy;
      const useRenderProxy =
        dragStrategy === 'proxy' && !!props.renderDragProxy;
      const proxyMove = props.onDragProxyMove ?? defaultDragProxyMove;

      const onPointerMove = (e: PointerEvent) => {
        lastPointer = { left: e.clientX, top: e.clientY };

        if (!dragOperation) {
          dragOperation = DragManager.startDrag(
            {
              listId: props.dragListId,
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

            const setupResult = props.onDragProxySetup?.(setupParams);
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

            setDragProxyRenderState({
              dragItemId: `${dragItemId}`,
              initialRect: rect,
              dx: 0,
              dy: 0,
            });
          }
        }

        const dx = e.clientX - initialCoords.left;
        const dy = e.clientY - initialCoords.top;

        if (useRenderProxy) {
          setDragProxyRenderState((prev) =>
            prev ? { ...prev, dx, dy } : prev,
          );
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

      const onPointerUp = () => {
        autoScroller.stop();
        scrollContainer?.removeEventListener('scroll', onContainerScroll);
        getGlobal().removeEventListener('pointermove', onPointerMove);

        if (useRenderProxy) {
          setDragProxyRenderState((prev) =>
            prev ? { ...prev, dragItemId: null } : prev,
          );
          requestAnimationFrame(() => {
            setDragProxyRenderState(null);
          });
        }

        if (!dragOperation) {
          cleanupProxy(proxyStateRef);
          setInteractionTarget(null);
          return;
        }

        dragOperation!.drop();
        dragOperation = null;
      };

      getGlobal().addEventListener('pointermove', onPointerMove);
      getGlobal().addEventListener('pointerup', onPointerUp, { once: true });
    },
    [
      props.orientation,
      props.dragListId,
      props.acceptDropsFrom,
      props.removeOnDropOutside,
      props.dragStrategy,
      props.renderDragProxy,
      props.onDragProxySetup,
      props.onDragProxyMove,
    ],
  );

  const dragging = !!dragItemId;

  const contextValue = React.useMemo(() => {
    const contextValue: DragListContextValue = {
      dragItemId: dragItemId,
      onDragItemPointerDown,
      dragSourceListId,
      dropTargetListId,
      status,
      dragListId: props.dragListId,
      draggingInProgress: dragging,
    };

    return contextValue;
  }, [
    dragItemId,
    onDragItemPointerDown,
    dragging,
    dragSourceListId,
    dropTargetListId,
    props.dragListId,
  ]);

  const domProps: React.HTMLProps<HTMLDivElement> = {
    className: join(
      'DragList',
      dragging ? 'DragList--dragging' : '',
      DragListRecipe({
        dragging,
      }),
    ),
    // @ts-ignore
    [DRAG_LIST_ATTRIBUTE]: props.dragListId,
  };

  const children =
    typeof props.children === 'function'
      ? props.children(domProps, contextValue)
      : props.children;

  return (
    <DragListContext.Provider value={contextValue}>
      {children}
      {dragProxyRenderState && props.renderDragProxy
        ? props.renderDragProxy({
            ...dragProxyRenderState,
            ref: proxyRefCallback,
          })
        : null}
    </DragListContext.Provider>
  );
};

type DragItemContextValue = {
  dragItemId: string | number;
  dragListId: string | null;
  active: boolean;
  draggingInProgress: boolean;
  dragSourceListId: string | null;
  dropTargetListId: string | null;
};

type DraggableItemProps = {
  id: string | number;
  children:
    | React.ReactNode
    | ((
        domProps: React.HTMLAttributes<HTMLDivElement>,
        context: DragItemContextValue,
      ) => React.ReactNode);
};

const DRAG_LIST_ATTRIBUTE = 'data-drag-list-id';
export const DRAG_ITEM_ATTRIBUTE = 'data-drag-item-id';
const DRAG_ITEM_SELECTOR = `[${DRAG_ITEM_ATTRIBUTE}]`;

const DragItemContext = React.createContext<DragItemContextValue>({
  dragItemId: '',
  dragListId: '',
  active: false,
  draggingInProgress: false,
  dragSourceListId: '',
  dropTargetListId: '',
});

const DraggableItem = (props: DraggableItemProps) => {
  const {
    onDragItemPointerDown,
    draggingInProgress,
    dragListId,
    dragItemId,
    dragSourceListId,
    dropTargetListId,
  } = useDragListContext();

  const active =
    dragSourceListId === dragListId && dragItemId === `${props.id}`;

  const contextValue = React.useMemo(
    () => ({
      dragItemId: props.id,
      active,
      dragListId,
      draggingInProgress,
      dragSourceListId,
      dropTargetListId,
    }),
    [props.id, active, draggingInProgress, dragSourceListId, dropTargetListId],
  );

  const domProps: React.HTMLAttributes<HTMLDivElement> = {
    // @ts-ignore
    'data-drag-item-id': `${props.id}`,
    onPointerDown: onDragItemPointerDown,
    className: join(
      'DraggableItem',
      active ? 'DraggableItem--active' : '',
      DraggableItemRecipe({
        active,
        draggingInProgress,
      }),
    ),
  };

  const children =
    typeof props.children === 'function'
      ? props.children(domProps, contextValue)
      : props.children;

  return (
    <DragItemContext.Provider value={contextValue}>
      {children}
    </DragItemContext.Provider>
  );
};

DragList.DraggableItem = DraggableItem;
