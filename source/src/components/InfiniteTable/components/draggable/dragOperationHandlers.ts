import binarySearch from 'binary-search';
import { DragOperation, DragOperationHandlerResult } from './DragManager';
import { Point } from '../../../../utils/pageGeometry/Point';
import {
  DragInteractionTarget,
  DragInteractionTargetMoveEvent,
} from './DragInteractionTarget';

export const handleInsideOperation = (
  operation: DragOperation,
  interactionTarget: DragInteractionTarget,
): DragOperationHandlerResult | null => {
  const { offset, activeDragSource } = operation;
  const {
    orientation,
    draggableItems,
    listId,
    listRectangle: constrainRectangle,
  } = interactionTarget.getData();

  const {
    dragItem,
    listId: dragSourceListId,
    dragIndex,

    dragRectangle,
  } = activeDragSource;

  const sourceSameAsTarget = dragSourceListId === listId;

  const center = Point.from(dragRectangle.getCenter());

  if (!constrainRectangle.containsPoint(center)) {
    return null;
  }

  interactionTarget.activeDragSourcePosition = 'inside';

  const direction = sourceSameAsTarget
    ? orientation === 'horizontal'
      ? offset.left > 0
        ? 1
        : -1
      : offset.top > 0
      ? 1
      : -1
    : 1;
  const dragRect = dragRectangle.toDOMRect();

  const breakpoints = interactionTarget.breakpoints;

  const dragItemBreakpoint = Math.round(
    direction === 1
      ? orientation === 'horizontal'
        ? dragRect.right - (sourceSameAsTarget ? 0 : dragRect.width / 2)
        : dragRect.bottom - (sourceSameAsTarget ? 0 : dragRect.height / 2)
      : orientation === 'horizontal'
      ? dragRect.left + (sourceSameAsTarget ? 0 : dragRect.width / 2)
      : dragRect.top + (sourceSameAsTarget ? 0 : dragRect.height / 2),
  );

  let dropIndex = binarySearch(breakpoints, dragItemBreakpoint, (a, b) => {
    return a - b;
  });

  if (dropIndex < 0) {
    dropIndex = ~dropIndex;
  }

  if (direction === 1 && dropIndex === dragIndex + 1 && sourceSameAsTarget) {
    dropIndex--;
  }

  const startIndex = Math.min(dragIndex, dropIndex);
  const endIndex = Math.max(dragIndex, dropIndex);

  const offsetsForItems = sourceSameAsTarget
    ? draggableItems.map((_item, index) => {
        if (index === dragIndex && sourceSameAsTarget) {
          return offset;
        }

        if (index < startIndex || index >= endIndex) {
          return { left: 0, top: 0 };
        }

        const dir = dropIndex <= index ? 1 : -1;

        return orientation === 'horizontal'
          ? { left: Math.round(dir * dragRect.width), top: 0 }
          : { left: 0, top: Math.round(dir * dragRect.height) };
      })
    : draggableItems.map((_item, index) => {
        const dir = dropIndex <= index ? 1 : 0;

        return orientation === 'horizontal'
          ? { left: Math.round(dir * dragRect.width), top: 0 }
          : { left: 0, top: Math.round(dir * dragRect.height) };
      });

  const result: DragInteractionTargetMoveEvent = {
    offset,
    dropIndex,
    dragSourceListId,
    dropTargetListId: listId,
    dragIndex,
    outside: false,
    items: draggableItems,
    dragItem,
    offsetsForItems,
    dragRect,
    status: 'accepted',
  };

  if (!interactionTarget.acceptsDrop(result)) {
    result.status = 'rejected';
    return {
      event: result,
      error: 'rejected by interaction target',
      success: false,
    };
  }

  return { event: result, error: null, success: true };
};
export const handleOutsideOperation = (
  operation: DragOperation,
  interactionTarget: DragInteractionTarget,
): DragOperationHandlerResult | null => {
  const { offset, activeDragSource } = operation;
  const { orientation, listId, listRectangle, draggableItems } =
    interactionTarget.getData();

  const {
    dragRectangle,
    dragItem,
    listId: dragSourceListId,
  } = activeDragSource;

  const center = Point.from(dragRectangle.getCenter());

  const sourceSameAsTarget = dragSourceListId === listId;

  const inside = listRectangle.containsPoint(center);
  // we return if we're inside
  if (inside) {
    // we're inside the list rectangle

    // however, if we have the same source, and it doesn't accept self drops
    // we need to keep going
    const shouldContinue =
      sourceSameAsTarget && !interactionTarget.acceptsSelfDrops();

    if (!shouldContinue) {
      return null;
    }
  }

  // if the active drag source is outside of the current interaction target
  // and it was also outside of the current interaction target in the previous move
  // then we don't need to update anything

  // but we only do this if this interaction target is not the source of the drag operation
  // since the source of the drag operation will need to update the offset of the dragging item
  if (
    interactionTarget.activeDragSourcePosition === 'outside' &&
    !sourceSameAsTarget
  ) {
    return null;
  }

  interactionTarget.activeDragSourcePosition = 'outside';

  const dragIndex = sourceSameAsTarget ? activeDragSource.dragIndex : -1;
  const dragRect = dragRectangle.toDOMRect();

  const result: DragInteractionTargetMoveEvent = {
    offset,
    dropIndex: -1,
    dragIndex,
    dragItem,
    outside: !inside,
    items: draggableItems,
    dragSourceListId,
    dropTargetListId: listId,
    offsetsForItems: sourceSameAsTarget
      ? draggableItems.map((_item, index) => {
          if (_item.id === dragItem.id) {
            return offset;
          }
          if (inside) {
            return { left: 0, top: 0 };
          }

          if (index > dragIndex) {
            return orientation === 'horizontal'
              ? { left: -dragItem.rect.width, top: 0 }
              : { left: 0, top: -dragItem.rect.height };
          }

          return { left: 0, top: 0 };
        })
      : draggableItems.map((_item) => {
          return { left: 0, top: 0 };
        }),
    dragRect,
    status: 'accepted',
  };

  if (!interactionTarget.acceptsDrop(result)) {
    result.status = 'rejected';
    return {
      event: result,
      error: 'rejected by interaction target',
      success: false,
    };
  }

  return { event: result, error: null, success: true };
};
