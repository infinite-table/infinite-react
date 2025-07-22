import binarySearch from 'binary-search';
import { PointCoords } from '../../../../utils/pageGeometry/Point';
import { Rectangle } from '../../../../utils/pageGeometry/Rectangle';
import { moveXatY } from '../../utils/moveXatY';

type DraggerOrientation = 'horizontal' | 'vertical';

type DraggableItem = {
  id: string;
  rect: DOMRectReadOnly;
};

export class Dragger {
  static init(orientation: DraggerOrientation) {
    const dragger = new Dragger(orientation);
    return dragger;
  }

  private constructor(orientation: DraggerOrientation) {
    this.orientation = orientation;
  }

  private orientation: DraggerOrientation;

  withDraggableItems(items: DraggableItem[]) {
    const { orientation } = this;

    return {
      startDrag(point: PointCoords) {
        return new DragOperation({
          startPoint: point,
          orientation,
          draggableItems: items,
        });
      },
    };
  }
}

export class DragOperation {
  startPoint: PointCoords;

  private orientation: DraggerOrientation;
  private draggableItems: DraggableItem[];
  private breakpoints: number[];
  private dragIndex: number;
  private dropIndex: number = -1;

  private dragItem: DraggableItem;
  constructor(options: {
    startPoint: PointCoords;

    orientation: DraggerOrientation;
    draggableItems: DraggableItem[];
  }) {
    this.startPoint = {
      top: Math.round(options.startPoint.top),
      left: Math.round(options.startPoint.left),
    };
    this.orientation = options.orientation;
    this.draggableItems = options.draggableItems;
    this.dragIndex = this.draggableItems.findIndex((item) =>
      new Rectangle(item.rect).containsPoint(this.startPoint),
    );

    this.dragItem = this.draggableItems[this.dragIndex];

    this.breakpoints = this.draggableItems.map((item) => {
      return this.orientation === 'horizontal'
        ? item.rect.left + item.rect.width / 2
        : item.rect.top + item.rect.height / 2;
    });
  }

  drop() {
    const { dragIndex, dropIndex, draggableItems } = this;

    this.draggableItems = [];
    this.breakpoints = [];

    const initials = Array.from(
      { length: draggableItems.length },
      (_, index) => index,
    );

    const sortedIndexes = moveXatY(
      initials,
      dragIndex,
      dropIndex > dragIndex ? dropIndex - 1 : dropIndex,
    );

    const sortedItems = sortedIndexes.map((index) => draggableItems[index]);

    return {
      dragIndex,
      dropIndex,
      sortedIndexes,
      sortedItems,
      items: draggableItems,
    };
  }

  move(point: PointCoords) {
    const offsetPoint = {
      top: Math.round(point.top - this.startPoint.top),
      left: Math.round(point.left - this.startPoint.left),
    };

    const { orientation } = this;
    const direction =
      orientation === 'horizontal'
        ? offsetPoint.left > 0
          ? 1
          : -1
        : offsetPoint.top > 0
        ? 1
        : -1;

    const currentPosition =
      orientation === 'horizontal' ? offsetPoint.left : offsetPoint.top;

    const dragItemBreakpoint =
      currentPosition +
      Math.round(
        direction === 1
          ? orientation === 'horizontal'
            ? this.dragItem.rect.right
            : this.dragItem.rect.bottom
          : orientation === 'horizontal'
          ? this.dragItem.rect.left
          : this.dragItem.rect.top,
      );

    let dropIndex = binarySearch(
      this.breakpoints,
      dragItemBreakpoint,
      (a, b) => {
        return a - b;
      },
    );

    if (dropIndex < 0) {
      dropIndex = ~dropIndex;
    }

    if (direction === 1 && dropIndex === this.dragIndex + 1) {
      dropIndex--;
    }

    const startIndex = Math.min(this.dragIndex, dropIndex);
    const endIndex = Math.max(this.dragIndex, dropIndex);

    const offsetsForItems = this.draggableItems.map((item, index) => {
      if (index === this.dragIndex) {
        return offsetPoint;
      }

      if (index < startIndex || index >= endIndex) {
        return { left: 0, top: 0 };
      }

      const dir = dropIndex <= index ? 1 : -1;

      return orientation === 'horizontal'
        ? { left: Math.round(dir * this.dragItem.rect.width), top: 0 }
        : { left: 0, top: Math.round(dir * this.dragItem.rect.height) };
    });

    this.dropIndex = dropIndex;

    return {
      dropIndex,
      dragIndex: this.dragIndex,
      items: this.draggableItems,
      offsetsForItems,
    };
  }
}
