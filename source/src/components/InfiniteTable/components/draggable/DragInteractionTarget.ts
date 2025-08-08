import { PointCoords } from '../../../../utils/pageGeometry/Point';
import { Rectangle } from '../../../../utils/pageGeometry/Rectangle';
import { shallowEqualObjects } from '../../../../utils/shallowEqualObjects';
import { EventEmitter } from '../../../utils/EventEmitter';
import { moveXatY } from '../../utils/moveXatY';

type DragInteractionTargetOrientation = 'horizontal' | 'vertical';

export type DragInteractionTargetData = {
  orientation: DragInteractionTargetOrientation;
  draggableItems: DraggableItem[];
  listRectangle: Rectangle;
  listId: string;
  acceptDropsFrom?: string[];
};
export type DraggableItem = {
  id: string;
  rect: DOMRectReadOnly;
};

export type DragInteractionTargetStartEvent = {
  dragIndex: number;
  dragItem: DraggableItem;
  dragSourceListId: string;
  dropTargetListId: string | null;
};
export type DragInteractionTargetDropEvent = {
  dragIndex: number;
  dragItem: DraggableItem;
  items: DraggableItem[];
  outside: boolean;
  dropIndex: number;
  dragSourceListId: string;
  dropTargetListId: string | null;
  sortedIndexes: number[];
};
export type DragInteractionTargetMoveEvent = {
  offset: PointCoords;
  dropIndex: number;
  dragIndex: number;
  dragItem: DraggableItem;
  items: DraggableItem[];
  outside: boolean;
  dragSourceListId: string;
  dropTargetListId: string | null;
  dragRect: DOMRectReadOnly;
  offsetsForItems: PointCoords[];
};
type DragInteractionTargetEvents = {
  move: (params: DragInteractionTargetMoveEvent) => void;
  drop: (params: DragInteractionTargetDropEvent) => void;
  start: (params: DragInteractionTargetStartEvent) => void;
};

export function areModelsEqual(
  model1: DragInteractionTargetData,
  model2: DragInteractionTargetData,
) {
  return shallowEqualObjects(model1, model2);
}

export class DragInteractionTarget extends EventEmitter<DragInteractionTargetEvents> {
  private data!: DragInteractionTargetData;

  /**
   * When the active drag source is outside the drag interaction target,
   * the drag index will be set to -1.
   *
   * Otherwise, when this drag interaction target contains
   * the active drag source, the drag index will be set to the index of the draggable item
   * that is being dragged.
   */
  protected dragIndex: number = -1;

  public breakpoints: number[] = [];

  constructor(data: DragInteractionTargetData) {
    super();
    this.setData(data);
  }

  get listId() {
    return this.data.listId;
  }

  activeDragSourcePosition: 'inside' | 'outside' = 'outside';

  setData(data: DragInteractionTargetData) {
    if (areModelsEqual(this.data, data)) {
      return false;
    }

    this.data = data;

    return true;
  }

  getData() {
    return this.data;
  }

  isEqual(model: DragInteractionTarget) {
    return areModelsEqual(this.data, model.getData());
  }

  acceptsSelfDrops() {
    return (
      !this.data.acceptDropsFrom ||
      this.data.acceptDropsFrom.includes(this.data.listId)
    );
  }

  move(params: DragInteractionTargetMoveEvent) {
    this.emit('move', params);
  }

  start(params: DragInteractionTargetStartEvent) {
    const sameDragSource = params.dragSourceListId === this.data.listId;

    const { draggableItems } = this.data;
    const len = draggableItems.length;
    this.breakpoints = draggableItems.map((item, index) => {
      // if we're in the same list,
      // use breakpoints that are the center of the item

      // or of we're the last item of another list - to give
      // the dragger an option to drop the item at the end of the list
      // because we need to have an area for intersecting the current
      // rect of the drag list
      if (sameDragSource || index === len - 1) {
        return this.data.orientation === 'horizontal'
          ? item.rect.left + item.rect.width / 2
          : item.rect.top + item.rect.height / 2;
      }

      // when dragging to another list, we need to use
      // the bottom/right of the item to compute the breakpoint
      return this.data.orientation === 'horizontal'
        ? item.rect.right
        : item.rect.bottom;
    });

    this.activeDragSourcePosition = sameDragSource ? 'inside' : 'outside';
    this.emit('start', params);
  }

  drop(params: DragInteractionTargetMoveEvent) {
    const {
      dropIndex,
      dragIndex,
      items,
      dragSourceListId,
      dropTargetListId,
      dragItem,
      outside,
    } = params;

    const initials = Array.from({ length: items.length }, (_, index) => index);

    let sortedIndexes: number[] = [];
    if (dropIndex === -1) {
      sortedIndexes = initials.filter((index) => index !== dragIndex);
    } else {
      sortedIndexes = moveXatY(
        initials,
        dragIndex,
        dropIndex > dragIndex ? dropIndex - 1 : dropIndex,
      );
    }

    const result: DragInteractionTargetDropEvent = {
      dragIndex,
      dropIndex,
      dragItem,
      items,
      dragSourceListId,
      dropTargetListId,
      sortedIndexes,
      outside,
    };

    this.emit('drop', result);
  }
}
