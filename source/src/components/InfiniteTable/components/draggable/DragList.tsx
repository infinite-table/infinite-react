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
import { DragInteractionTarget } from './DragInteractionTarget';
import { getGlobal } from '../../../../utils/getGlobal';

type DragListContextValue = {
  dragItemId: string | number | null;
  onDragItemPointerDown: (e: React.PointerEvent) => void;
  draggingInProgress: boolean;
  dragListId: string;
  dragSourceListId: string | null;
  dropTargetListId: string | null;
};
const DragListContext = React.createContext<DragListContextValue>({
  dragItemId: null,
  onDragItemPointerDown: () => {},
  draggingInProgress: false,
  dragListId: '',
  dragSourceListId: null,
  dropTargetListId: null,
});

const useDragListContext = () => {
  return React.useContext(DragListContext);
};

type DragListProps = {
  dragListId: string;
  children: (
    domProps: React.HTMLProps<HTMLDivElement>,

    context: DragListContextValue,
  ) => React.ReactNode;
  orientation: 'horizontal' | 'vertical';
  acceptDropsFrom?: string[];
  removeOnDropOutside?: boolean;
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
    console.log('No draggable items found in', domRef.current);
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
  acceptDropsFrom?: string[];
  removeOnDropOutside?: boolean;
}): DragInteractionTargetData {
  const { domRef, orientation, dragListId } = params;

  const options: DragInteractionTargetData = {
    draggableItems: getDraggableItems(domRef),
    orientation,
    listId: dragListId,
    listRectangle: Rectangle.from(domRef.current!.getBoundingClientRect()),
    acceptDropsFrom: params.acceptDropsFrom,
  };

  return options;
}

function createInteractionTarget(
  params: Parameters<typeof getInteractionTargetData>[0],
) {
  const target = new DragInteractionTarget(getInteractionTargetData(params));

  return target;
}

export const DragList = (props: DragListProps) => {
  const domRef = React.useRef<HTMLElement>(null);

  const { dropTargetListId, dragSourceListId } = useDragDropProvider();

  const { updateDragOperationSourceAndTarget, dragItemId } =
    useDragDropProvider();

  const getOnDrop = useLatest(props.onDrop);
  const getOnAcceptDrop = useLatest(props.onAcceptDrop);
  const getOnRemove = useLatest(props.onRemove);
  const getUpdatePosition = useLatest(
    props.updatePosition ?? defaultUpdatePosition,
  );

  const [interactionTarget, doSetInteractionTarget] =
    React.useState<DragInteractionTarget | null>(null);
  const interactionTargetRef = React.useRef<DragInteractionTarget | null>(null);

  const setInteractionTarget = useCallback(
    (interactionTarget: DragInteractionTarget | null) => {
      interactionTargetRef.current = interactionTarget;

      if (interactionTarget) {
        DragManager.registerDragInteractionTarget(interactionTarget);
      }

      doSetInteractionTarget(interactionTarget);
    },
    [],
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
    const dragListId = props.dragListId;

    if (props.acceptDropsFrom && !interactionTarget) {
      const remove = DragManager.on('register', (interactionTarget) => {
        if (interactionTargetRef.current === interactionTarget) {
          // debugger;
          return;
        }

        const interactionTargetData = interactionTarget.getData();
        if (interactionTargetData.listId !== dragListId) {
          // a drag has started in another drag list

          if (props.acceptDropsFrom?.includes(interactionTargetData.listId)) {
            // we need to create the interaction target for this current list
            // so it can listen to the drag operation

            interactionTarget = createInteractionTarget({
              domRef,
              orientation: props.orientation,
              dragListId,
              acceptDropsFrom: props.acceptDropsFrom,
            });

            setInteractionTarget(interactionTarget);
          }
        }
      });

      return () => {
        remove();
      };
    }
  }, [
    interactionTarget,
    props.acceptDropsFrom,
    props.dragListId,
    props.orientation,
  ]);

  useEffect(() => {
    const removeUnregister = DragManager.on(
      'unregister',
      (interactionTarget) => {
        if (interactionTarget === interactionTargetRef.current) {
          setInteractionTarget(null);
        }
      },
    );

    return removeUnregister;
  }, []);

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
          });
        },
      );

      const removeOnDragMove = interactionTarget.on(
        'move',
        ({ offsetsForItems, items }) => {
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

        if (
          dragListId === dropTargetListId &&
          dragSourceListId !== dragListId
        ) {
          if (onAcceptDrop) {
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

        DragManager.unregisterDragInteractionTarget(interactionTarget);
        setInteractionTarget(null);
      });

      return () => {
        removeOnDragStart();
        removeOnDragMove();
        removeOnDragDrop();
      };
    }
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
      const dragItemId = `${target.dataset.dragItem}`;

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
      });

      const draggableItems = interactionTarget.getData().draggableItems;

      const dragIndex = draggableItems.findIndex(
        (item) => item.id === dragItemId,
      );
      const dragItem = draggableItems[dragIndex];

      setInteractionTarget(interactionTarget);

      requestAnimationFrame(() => {
        dragOperation = DragManager.startDrag(
          {
            listId: props.dragListId,
            dragItem,
            dragIndex,
          },
          {
            left: e.clientX,
            top: e.clientY,
          },
        );
      });

      const onPointerMove = (e: PointerEvent) => {
        if (!dragOperation) {
          return;
        }

        dragOperation!.move({
          left: e.clientX,
          top: e.clientY,
        });
      };

      const onPointerUp = () => {
        if (!dragOperation) {
          return;
        }

        dragOperation!.drop();
        dragOperation = null;

        getGlobal().removeEventListener('pointermove', onPointerMove);
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
const DRAG_ITEM_ATTRIBUTE = 'data-drag-item';
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
    'data-drag-item': `${props.id}`,
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
