import * as React from 'react';

import {
  type DragInteractionTargetData,
  DragManager,
  DragOperation,
} from './DragManager';
import { useCallback, useEffect } from 'react';
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
}): DragInteractionTargetData {
  const { domRef, orientation, dragListId } = params;

  const listRectangle = Rectangle.from(domRef.current!.getBoundingClientRect());

  const options: DragInteractionTargetData = {
    draggableItems: getDraggableItems(domRef),
    orientation,
    listId: dragListId,
    listRectangle,
    acceptDropsFrom: params.acceptDropsFrom,
    shouldAcceptDrop: params.shouldAcceptDrop,
    initial: params.initial,
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

export const DragList = (props: DragListProps) => {
  const domRef = React.useRef<HTMLElement>(null);

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
        ({ offsetsForItems, items, status }) => {
          if (status === 'rejected') {
            return;
          }

          const dragItems = getDragItems();

          const updatePosition = getUpdatePosition();

          items.forEach((item, index) => {
            const offset = offsetsForItems[index];
            const node = dragItems![index] as HTMLElement;

            if (!node) {
              return;
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

      return () => {
        removeOnDragStart();
        removeOnDragMove();
        removeOnDragDrop();
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
      });

      const draggableItems = interactionTarget.getData().draggableItems;

      const dragIndex = draggableItems.findIndex(
        (item) => item.id === dragItemId,
      );
      const dragItem = draggableItems[dragIndex];

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

      const onPointerMove = (e: PointerEvent) => {
        if (!dragOperation) {
          dragOperation = DragManager.startDrag(
            {
              listId: props.dragListId,
              dragItem,
              dragIndex,
            },
            initialCoords,
          );
          // return;
        }

        dragOperation!.move({
          left: e.clientX,
          top: e.clientY,
        });
      };

      const onPointerUp = () => {
        getGlobal().removeEventListener('pointermove', onPointerMove);
        if (!dragOperation) {
          // we didn't have an pointer move
          // so we need to discard the interaction target
          // as we won't have a drop event triggered
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
    ],
  );

  const isDragging = (id: string | number | undefined) => {
    return id === undefined ? dragItemId != null : `${id}` === dragItemId;
  };

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
    isDragging,
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

  return <DragListContext value={contextValue}>{children}</DragListContext>;
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
