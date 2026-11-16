import * as React from 'react';

import { useCallback, useEffect, useState } from 'react';
import { DraggableItemRecipe, DragListRecipe } from './DragList.css';
import { join } from '../../../../utils/join';
import { useDragDropProvider } from './DragDropProvider';
import { useLatest } from '../../../hooks/useLatest';
import {
  DragInteractionTarget,
  DragInteractionTargetMoveEvent,
} from './DragInteractionTarget';
import { DragManager } from './DragManager';
import {
  acceptDragsFromOtherLists,
  bindInteractionTarget,
  createDefaultProxy,
  defaultDragProxyMove,
  defaultUpdatePosition,
  DRAG_ITEM_ATTRIBUTE,
  DRAG_ITEM_LIST_ATTRIBUTE,
  DRAG_LIST_ATTRIBUTE,
  findDragListElement,
  getDragItemNodes,
  replaceRegisteredInteractionTarget,
  startDragOnPointerDown,
  type DragListProxyState,
  type DragProxyMoveParams,
  type DragProxySetupParams,
  type DragProxySetupResult,
} from './dragListController';

// the framework-neutral part of the drag list is in dragListController.ts
export {
  createDefaultProxy,
  defaultDragProxyMove,
  DRAG_ITEM_ATTRIBUTE,
  DRAG_ITEM_LIST_ATTRIBUTE,
  type DragProxyMoveParams,
  type DragProxySetupParams,
  type DragProxySetupResult,
};

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

function useInteractionTarget(
  domRef: React.RefObject<HTMLElement | null>,
  props: DragListProps,
) {
  const getProps = useLatest(props);
  const [interactionTarget, doSetInteractionTarget] =
    React.useState<DragInteractionTarget | null>(null);

  // The registered target is kept in a ref, not read back from the state:
  // a pointer up can come before the render that follows the pointer down,
  // and the target registered on pointer down still has to be unregistered.
  const registeredTargetRef = React.useRef<DragInteractionTarget | null>(null);

  const setInteractionTarget = useCallback(
    (interactionTarget: DragInteractionTarget | null) => {
      replaceRegisteredInteractionTarget(
        registeredTargetRef,
        interactionTarget,
      );

      doSetInteractionTarget(interactionTarget);
    },
    [],
  );
  const getInteractionTarget = useLatest(interactionTarget);

  useEffect(() => {
    return () => {
      // don't leave a target behind when the list is unmounted
      DragManager.unregisterDragInteractionTarget(registeredTargetRef.current);
      registeredTargetRef.current = null;
    };
  }, []);

  useEffect(() => {
    return acceptDragsFromOtherLists({
      getProps,
      domRef,
      setInteractionTarget,
    });
  }, [getProps]);

  return {
    interactionTarget,
    setInteractionTarget,
    getInteractionTarget,
  };
}

export const DragList = (props: DragListProps) => {
  const domRef = React.useRef<HTMLElement | null>(null);
  const proxyStateRef = React.useRef<DragListProxyState | null>(null);

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
    findDragListElement(domRef, props.dragListId);
  }, [props.dragListId]);

  useEffect(() => {
    if (interactionTarget) {
      return bindInteractionTarget(interactionTarget, {
        dragListId: props.dragListId,
        orientation: props.orientation,
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
        updateDragProxyRenderState: setDragProxyRenderState,
      });
    }

    return undefined;
  }, [interactionTarget, props.dragListId]);

  const dragItemsRef = React.useRef<HTMLElement[]>([]);

  const getDragItems = useCallback(() => {
    return getDragItemNodes(dragItemsRef, domRef, props.dragListId);
  }, [props.dragListId]);

  const onDragItemPointerDown = useCallback(
    (e: React.PointerEvent) => {
      startDragOnPointerDown(e, props, {
        domRef,
        proxyStateRef,
        sourceScrollOffsetRef,
        dragItemsRef,
        setInteractionTarget,
        updateDragProxyRenderState: setDragProxyRenderState,
      });
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
  dragListId?: string;
  children:
    | React.ReactNode
    | ((
        domProps: React.HTMLAttributes<HTMLDivElement>,
        context: DragItemContextValue,
      ) => React.ReactNode);
};

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

  const dragItemListId = props.dragListId ?? dragListId;
  const active =
    dragSourceListId === dragItemListId && dragItemId === `${props.id}`;

  const contextValue = React.useMemo(
    () => ({
      dragItemId: props.id,
      active,
      dragListId: dragItemListId,
      draggingInProgress,
      dragSourceListId,
      dropTargetListId,
    }),
    [
      props.id,
      active,
      dragItemListId,
      draggingInProgress,
      dragSourceListId,
      dropTargetListId,
    ],
  );

  const domProps: React.HTMLAttributes<HTMLDivElement> = {
    // @ts-ignore
    [DRAG_ITEM_ATTRIBUTE]: `${props.id}`,
    [DRAG_ITEM_LIST_ATTRIBUTE]: dragItemListId,
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
