export const moveXatY = <T>(
  arr: T[],
  dragIndex: number,
  dropIndex: number,
): T[] => {
  arr = [...arr];
  if (
    dragIndex === dropIndex ||
    arr[dragIndex] === undefined ||
    arr[dropIndex] === undefined
  ) {
    return arr;
  }
  const dragItem = arr[dragIndex];

  if (dropIndex < dragIndex) {
    arr.splice(dragIndex, 1);
    arr.splice(dropIndex, 0, dragItem);
  } else {
    arr.splice(dragIndex, 1);
    arr.splice(dropIndex, 0, dragItem);
  }

  return arr;
};
