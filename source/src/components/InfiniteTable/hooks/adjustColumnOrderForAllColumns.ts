import { moveXatY } from '../utils/moveXatY';

export default function adjustColumnOrderForAllColumns(options: {
  newColumnOrder: string[];
  visibleColumnOrder: string[];
  existingColumnOrder: string[];
  dragColumnId: string;
}) {
  const {
    newColumnOrder,
    visibleColumnOrder,
    existingColumnOrder,
    dragColumnId: dragColumnId,
  } = options;

  if (visibleColumnOrder.length !== newColumnOrder.length) {
    console.warn(
      'new column order cannot contain less columns than the visible column order',
    );
    return newColumnOrder;
  }
  // const newIndexes = newColumnOrder.reduce(getIndexes, {});
  // const allIndexes = allColumnIds.reduce(getIndexes, {});

  const dragIndex = visibleColumnOrder.indexOf(dragColumnId);
  const dropIndex = newColumnOrder.indexOf(dragColumnId);

  if (dragIndex === dropIndex) {
    return existingColumnOrder;
  }
  if (dropIndex > dragIndex) {
    // it's moved to the right

    // in the new column order, get the item that is before the dropped column id
    // and then find the index of that column in the existing column order
    // and move the movedColumnId after that index
    const indexInNewOrder = newColumnOrder.indexOf(dragColumnId);
    const prevColIdInNewOrder = newColumnOrder[indexInNewOrder - 1];

    const prevColIndexInExiting =
      existingColumnOrder.indexOf(prevColIdInNewOrder);
    const indexInExisting = existingColumnOrder.indexOf(dragColumnId);

    return moveXatY(
      existingColumnOrder,
      indexInExisting,
      prevColIndexInExiting,
    );
  } else {
    // it's moved to the left

    // in the new column order, get the item that is after the dropped column id
    // and then find the index of that column in the existing column order
    // and move the movedColumnId before that index

    const indexInNewOrder = newColumnOrder.indexOf(dragColumnId);
    const nextColIdInNewOrder = newColumnOrder[indexInNewOrder + 1];

    const nextColIndexInExiting =
      existingColumnOrder.indexOf(nextColIdInNewOrder);
    const indexInExisting = existingColumnOrder.indexOf(dragColumnId);

    return moveXatY(
      existingColumnOrder,
      indexInExisting,
      nextColIndexInExiting,
    );
  }
  return newColumnOrder;
}
