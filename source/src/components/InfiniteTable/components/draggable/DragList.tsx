import * as React from 'react';

import { Dragger, DragOperation } from './Dragger';
import { useCallback, useEffect } from 'react';
import { DraggableItemRecipe, DragListRecipe } from './DragList.css';
import { join } from '../../../../utils/join';

type DragContextValue = {
  draggingId: string | number | null;
  onDragItemPointerDown: (e: React.PointerEvent) => void;
  isDragging: (id: string | number) => boolean;
  draggingInProgress: boolean;
  dragListId: string;
  dropTargetListId: string | null;
  dragSourceListId: string | null;
  draggingOutside: boolean;
};
const DragContext = React.createContext<DragContextValue>({
  draggingId: null,
  isDragging: () => false,
  onDragItemPointerDown: () => {},
  draggingInProgress: false,
  dragListId: '',
  dropTargetListId: '',
  dragSourceListId: '',
  draggingOutside: false,
});

const useDragContext = () => {
  return React.useContext(DragContext);
};

type DragListProps = {
  dragListId: string;
  children: (
    domProps: React.HTMLProps<HTMLDivElement>,

    context: DragContextValue,
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
    dragListId: string;
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
    console.log('no drag items found in', domRef.current);
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

function getDraggableOptions(params: {
  domRef: React.RefObject<HTMLElement | null>;
  orientation: 'horizontal' | 'vertical';
  dragListId: string;
  acceptDropsFrom?: string[];
  removeOnDropOutside?: boolean;
}) {
  const {
    domRef,
    orientation,
    dragListId,
    acceptDropsFrom,
    removeOnDropOutside,
  } = params;

  const options = {
    draggableItems: getDraggableItems(domRef),
    orientation,
    dragListId,
    acceptDropsFrom,
    removeOnDropOutside,
    constrainRect:
      removeOnDropOutside || acceptDropsFrom?.length
        ? domRef.current?.getBoundingClientRect()
        : undefined,
  };

  return options;
}

function createDragger(params: Parameters<typeof getDraggableOptions>[0]) {
  return Dragger.init(getDraggableOptions(params));
}

export const DragList = (props: DragListProps) => {
  const domRef = React.useRef<HTMLElement>(null);

  const [state, setState] = React.useState<{
    dragItemId: string | number | null;
    dragSourceListId: string | null;
    dropTargetListId: string | null;
  }>({
    dragItemId: null,
    dragSourceListId: null,
    dropTargetListId: null,
  });

  // const { updateDragOperationSourceAndTarget } = useDragDropProvider();

  // useEffect(() => {
  //   debugger;
  //   updateDragOperationSourceAndTarget({
  //     dragSourceListId: props.dragListId,
  //     dropTargetListId: null,
  //   });
  // }, [props.dragListId]);

  const outsideRef = React.useRef<boolean>(false);

  const onDropRef = React.useRef<typeof props.onDrop | null>(null);
  onDropRef.current = props.onDrop;

  const onAcceptDropRef = React.useRef<typeof props.onAcceptDrop | null>(null);
  onAcceptDropRef.current = props.onAcceptDrop;

  const onRemoveRef = React.useRef<typeof props.onRemove | null>(null);
  onRemoveRef.current = props.onRemove;

  const updatePositionRef = React.useRef<typeof props.updatePosition | null>(
    null,
  );
  updatePositionRef.current = props.updatePosition ?? defaultUpdatePosition;

  const [dragger, setDragger] = React.useState<Dragger | null>(null);

  const dragItemId = state.dragItemId;

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

    if (props.acceptDropsFrom && !dragger) {
      let dragger: Dragger | null = null;
      const remove = Dragger.on('start', (params) => {
        if (params.dragSourceListId !== dragListId) {
          // a drag has started in another drag list
          if (props.acceptDropsFrom?.includes(params.dragSourceListId)) {
            // we need to create the dragger for this current list
            // so it can listen to the drag operation

            dragger = createDragger({
              domRef,
              orientation: props.orientation,
              dragListId: props.dragListId,
              acceptDropsFrom: props.acceptDropsFrom,
              removeOnDropOutside: props.removeOnDropOutside,
            });

            console.log('setting dragger for', props.dragListId);
            setDragger(dragger);

            dragger.once('start', (params) => {
              console.log('starting dragger for', props.dragListId);
              setState({
                dragItemId: params.dragItemId,
                dragSourceListId: params.dragSourceListId,
                dropTargetListId: null,
              });
            });
          }
        }
      });

      return () => {
        remove();
      };
    }
  }, [
    dragger,
    props.acceptDropsFrom,
    props.dragListId,
    props.orientation,
    props.removeOnDropOutside,
  ]);

  useEffect(() => {
    if (dragger) {
      console.log('adding drag move and drop');
      const removeOnDragMove = dragger.on(
        'move',
        ({ offsetsForItems, items, isOutside }) => {
          const dragItems = getDragItems();

          items.forEach((item, index) => {
            const offset = offsetsForItems[index];

            updatePositionRef.current!({
              id: item.id,
              node: dragItems![index] as HTMLElement,
              offset,
            });
          });

          if (isOutside !== outsideRef.current) {
            outsideRef.current = isOutside;

            setState((state) => {
              return {
                ...state,
                dropTargetListId: isOutside ? null : props.dragListId,
              };
            });
          }
        },
      );

      const removeOnDragDrop = dragger.on(
        'drop',
        ({ sortedIndexes, items, dragIndex, dropIndex }) => {
          const dragItems = getDragItems();

          items.forEach((item, index) => {
            updatePositionRef.current!({
              id: item.id,
              node: dragItems![index] as HTMLElement,
              offset: null,
            });
          });

          const callbackFn =
            dropIndex === -1 ? onRemoveRef.current : onDropRef.current;

          if (callbackFn) {
            callbackFn?.(sortedIndexes, {
              dragIndex,
              dropIndex,
              dragItemId: items[dragIndex].id,
              dropItemId: items[dropIndex]?.id,
            });
          }

          setState({
            dragItemId: null,
            dragSourceListId: null,
            dropTargetListId: null,
          });

          console.log('dropped!');

          dragger.destroy();
        },
      );

      return () => {
        console.log('removing drag move and drop');
        removeOnDragMove();
        removeOnDragDrop();
      };
    }
  }, [dragger]);

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

      const dragger = createDragger({
        domRef,
        orientation: props.orientation,
        dragListId: props.dragListId,
        acceptDropsFrom: props.acceptDropsFrom,
        removeOnDropOutside: props.removeOnDropOutside,
      });

      setDragger(dragger);
      console.log('created dragger on pointer down', dragger);

      dragOperation = dragger.startDrag({
        left: e.clientX,
        top: e.clientY,
      });

      setState({
        dragItemId,
        dragSourceListId: props.dragListId,
        dropTargetListId: props.dragListId,
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

        window.removeEventListener('pointermove', onPointerMove);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp, { once: true });
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
    const contextValue: DragContextValue = {
      draggingId: dragItemId,
      onDragItemPointerDown,
      isDragging,

      dragListId: props.dragListId,
      dragSourceListId: state.dragSourceListId,
      dropTargetListId: state.dropTargetListId,
      draggingInProgress: dragging,
      draggingOutside:
        dragging &&
        state.dragSourceListId === props.dragListId &&
        state.dropTargetListId !== props.dragListId,
    };

    return contextValue;
  }, [
    dragItemId,
    onDragItemPointerDown,
    isDragging,
    dragging,
    state.dropTargetListId,
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

  return <DragContext value={contextValue}>{children}</DragContext>;
};

type DragItemContextValue = {
  dragItemId: string | number;
  dragListId: string | null;
  active: boolean;
  draggingInProgress: boolean;
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
});

export const DraggableItem = (props: DraggableItemProps) => {
  const {
    isDragging,
    onDragItemPointerDown,
    draggingInProgress,
    dragSourceListId: dragListId,
  } = useDragContext();

  const active = isDragging(props.id);

  const contextValue = React.useMemo(
    () => ({
      dragItemId: props.id,
      active,
      dragListId,
      draggingInProgress,
    }),
    [props.id, active, draggingInProgress],
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
