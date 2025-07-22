import * as React from 'react';

import { Dragger, DragOperation } from './Dragger';
import { useCallback } from 'react';
import { DraggableItemRecipe, DragListRecipe } from './DragList.css';
import { join } from '../../../../utils/join';

type DragContextValue = {
  draggingId: string | number | null;
  onDragItemPointerDown: (e: React.PointerEvent) => void;
  isDragging: (id: string | number | undefined) => boolean;
};
const DragContext = React.createContext<DragContextValue>({
  draggingId: null,
  isDragging: () => false,
  onDragItemPointerDown: () => {},
});

const useDragContext = () => {
  return React.useContext(DragContext);
};

type DragListProps = {
  dragListId?: string;
  children: (
    domProps: React.HTMLProps<HTMLDivElement>,

    context: DragContextValue,
  ) => React.ReactNode;
  orientation: 'horizontal' | 'vertical';
  acceptDropsFrom?: string[];
  onDrop: (
    sortedIndexes: number[],
    options: {
      dragIndex: number;
      dropIndex: number;
      dragItemId: string;
      dropItemId: string;
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

export const DragList = (props: DragListProps) => {
  const domRef = React.useRef<HTMLDivElement>(null);

  const [state, setState] = React.useState<{
    draggingId: string | number | null;
  }>({
    draggingId: null,
  });

  const onDropRef = React.useRef<typeof props.onDrop | null>(null);
  onDropRef.current = props.onDrop;

  const updatePositionRef = React.useRef<typeof props.updatePosition | null>(
    null,
  );
  updatePositionRef.current = props.updatePosition ?? defaultUpdatePosition;

  const { draggingId } = state;

  const onDragItemPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.currentTarget as HTMLElement;
      const id = `${target.dataset.dragItem}`;

      let dragOperation: DragOperation | null = null;

      const dragItems = domRef.current?.querySelectorAll(DRAG_ITEM_SELECTOR);
      if (dragItems && id != null) {
        const dragger = Dragger.init(props.orientation);

        dragOperation = dragger
          .withDraggableItems(
            Array.from(dragItems).map((item) => {
              const id = getDraggableItemId(item as HTMLElement);
              const rect = item.getBoundingClientRect();

              return {
                id,
                rect,
              };
            }),
          )
          .startDrag({
            left: e.clientX,
            top: e.clientY,
          });

        setState({
          draggingId: id,
        });
      }

      const onPointerMove = (e: PointerEvent) => {
        const { offsetsForItems, items } = dragOperation!.move({
          left: e.clientX,
          top: e.clientY,
        });

        items.forEach((item, index) => {
          const offset = offsetsForItems[index];

          updatePositionRef.current!({
            id: item.id,
            node: dragItems![index] as HTMLElement,
            offset,
          });
        });
        return;
      };

      const onPointerUp = () => {
        const { sortedIndexes, items, dragIndex, dropIndex } =
          dragOperation!.drop();
        items.forEach((item, index) => {
          updatePositionRef.current!({
            id: item.id,
            node: dragItems![index] as HTMLElement,
            offset: null,
          });
        });

        onDropRef.current!(sortedIndexes, {
          dragIndex,
          dropIndex,
          dragItemId: items[dragIndex].id,
          dropItemId: items[dropIndex]?.id,
        });

        setState({
          draggingId: null,
        });
        window.removeEventListener('pointermove', onPointerMove);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp, { once: true });
    },
    [props.orientation],
  );

  const isDragging = (id: string | number | undefined) => {
    return id === undefined ? draggingId != null : `${id}` === draggingId;
  };

  const dragging = !!draggingId;

  const contextValue = React.useMemo(
    () => ({
      draggingId,
      onDragItemPointerDown,
      isDragging,
    }),
    [draggingId, onDragItemPointerDown, isDragging],
  );

  const domProps: React.HTMLProps<HTMLDivElement> = {
    ref: domRef,
    className: join(
      'DragList',
      dragging ? 'DragList--dragging' : '',
      DragListRecipe({
        dragging,
      }),
    ),
  };

  const children =
    typeof props.children === 'function'
      ? props.children(domProps, contextValue)
      : props.children;

  return <DragContext value={contextValue}>{children}</DragContext>;
};

type DraggableItemContextValue = {
  draggableItemId: string | number;
  active: boolean;
  draggingInProgress: boolean;
};

type DraggableItemProps = {
  id: string | number;
  children:
    | React.ReactNode
    | ((
        domProps: React.HTMLAttributes<HTMLDivElement>,
        context: DraggableItemContextValue,
      ) => React.ReactNode);
};

const DRAG_ITEM_ATTRIBUTE = 'data-drag-item';
const DRAG_ITEM_SELECTOR = `[${DRAG_ITEM_ATTRIBUTE}]`;

const DraggableItemContext = React.createContext<DraggableItemContextValue>({
  draggableItemId: '',
  active: false,
  draggingInProgress: false,
});

export const DraggableItem = (props: DraggableItemProps) => {
  const { isDragging, onDragItemPointerDown } = useDragContext();

  const active = isDragging(props.id);
  const draggingInProgress = isDragging(undefined);

  const contextValue = React.useMemo(
    () => ({
      draggableItemId: props.id,
      active,
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
    <DraggableItemContext.Provider value={contextValue}>
      {children}
    </DraggableItemContext.Provider>
  );
};
