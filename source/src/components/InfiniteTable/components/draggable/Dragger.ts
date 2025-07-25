import binarySearch from 'binary-search';
import { Point, PointCoords } from '../../../../utils/pageGeometry/Point';
import { Rectangle } from '../../../../utils/pageGeometry/Rectangle';
import { moveXatY } from '../../utils/moveXatY';
import { shallowEqualObjects } from '../../../../utils/shallowEqualObjects';
import { EventEmitter } from '../../../utils/EventEmitter';

type DraggerOrientation = 'horizontal' | 'vertical';

type DraggableItem = {
  id: string;
  rect: DOMRectReadOnly;
};

type DraggerOptions = {
  orientation: DraggerOrientation;
  removeOnDropOutside?: boolean;
  acceptDropsFrom?: string[];
  constrainRect?: DOMRectReadOnly;
  dragListId: string;
  draggableItems: DraggableItem[];
};

const draggers: Dragger[] = [];

globalThis.globalDraggers = draggers;

type DraggerStaticEvents = {
  start: (params: { dragSourceListId: string; dragItemId: string }) => void;
  move: (params: ReturnType<DragOperation['move']>) => void;
  drop: (params: ReturnType<DragOperation['drop']>) => void;
};

type DraggerEvents = {
  enter: () => void;
  leave: () => void;
} & DraggerStaticEvents;

export class Dragger extends EventEmitter<DraggerEvents> {
  static init(options: DraggerOptions) {
    const dragger = new Dragger(options);
    return dragger;
  }

  private constructor(options: DraggerOptions) {
    super();

    this.orientation = options.orientation;
    this.acceptDropsFrom = options.acceptDropsFrom;
    this.dragListId = options.dragListId;
    this.removeOnDropOutside = options.removeOnDropOutside ?? false;
    this.constrainRect = options.constrainRect;
    this.draggableItems = options.draggableItems;

    draggers.push(this);
  }

  update(options: Partial<DraggerOptions>) {
    Object.assign(this, options);

    return this;
  }

  destroy() {
    draggers.splice(draggers.indexOf(this), 1);
    this.clearAll();
    this.destroyed = true;
  }

  private destroyed: boolean = false;
  private constrainRect?: DOMRectReadOnly;
  private removeOnDropOutside: boolean;
  private orientation: DraggerOrientation;
  private acceptDropsFrom?: string[];
  private dragListId: string;
  private draggableItems: DraggableItem[];

  private watchers: Dragger[] = [];

  private static emitter = new EventEmitter<DraggerStaticEvents>();

  public static on(
    event: keyof DraggerStaticEvents,
    callback: (params: any) => void,
  ) {
    return Dragger.emitter.on(event, callback);
  }

  public static off(
    event: keyof DraggerStaticEvents,
    callback: (params: any) => void,
  ) {
    return Dragger.emitter.off(event, callback);
  }

  private static onDragStartOperation(
    params: ReturnType<DragOperation['start']>,
  ) {
    Dragger.emitter.emit('start', params);

    const thisDragger = draggers.find(
      (dragger) => params.dragSourceListId === dragger.dragListId,
    );

    if (thisDragger) {
      thisDragger.watchers = draggers.filter((dragger) => {
        return (
          dragger !== thisDragger &&
          dragger.acceptDropsFrom?.includes(thisDragger.dragListId)
        );
      });
      thisDragger.emit('start', params);
    }
  }

  private static onDragMoveOperation(
    initialModel: DragOperationModel,
    params: ReturnType<DragOperation['move']>,
    dragOperation: DragOperation,
  ) {
    Dragger.emitter.emit('move', params);

    const thisDragger = draggers.find(
      (dragger) => params.dragSourceListId === dragger.dragListId,
    );

    // console.log('onDragMoveOperation', thisDragger, params);

    if (thisDragger) {
      const currentModel = dragOperation.getModel();

      const watchers = thisDragger.watchers;

      if (params.isOutside && watchers.length > 0) {
        const { dragRectangle } = params;

        // console.log('watchers', watchers);
        for (const dragger of watchers) {
          if (dragger.constrainRect) {
            const rectangle = Rectangle.from(dragger.constrainRect);
            if (rectangle.intersects(dragRectangle)) {
              // the dragged item intersects the dragger rect
              // so let's try to accept it

              const initialModel = dragOperation.getModel();
              const model: DragOperationModel = {
                draggableItems: dragger.draggableItems,
                dragSourceListId: params.dragSourceListId,
                dropTargetListId: dragger.dragListId,
                dragItem: params.dragItem,
              };
              // @ts-ignore
              dragOperation.removeOnDropOutside = false;
              dragOperation.setModel(model);

              if (currentModel.dropTargetListId !== dragger.dragListId) {
                dragger.emit('start', {
                  dragSourceListId: params.dragSourceListId,
                  dragItemId: params.dragItem.id,
                });
              }

              debugger;
              dragOperation.move(params.point, params.offsetPoint);
              dragOperation.setModel(initialModel);
              return;
            }
          }
        }
      }

      if (dragOperation.getModel() !== initialModel) {
        dragOperation.setModel(initialModel);
      }

      Dragger.emitter.emit('move', params);

      thisDragger.emit('move', params);
    }
  }

  private static onDragDropOperation(
    params: ReturnType<DragOperation['drop']>,
  ) {
    Dragger.emitter.emit('drop', params);

    const thisDragger = draggers.find(
      (dragger) => params.dragSourceListId === dragger.dragListId,
    );
    if (thisDragger) {
      thisDragger.emit('drop', params);
      thisDragger.watchers = [];
    }
  }

  startDrag(startPoint: PointCoords) {
    const dragItemIndex = this.draggableItems.findIndex((item) =>
      new Rectangle(item.rect).containsPoint(startPoint),
    );
    const dragItem = this.draggableItems[dragItemIndex];

    const initialModel: DragOperationModel = {
      draggableItems: this.draggableItems,
      dragSourceListId: this.dragListId,
      dropTargetListId: this.dragListId,
      dragItem,
    };
    const operation = new DragOperation({
      startPoint,
      model: initialModel,

      orientation: this.orientation,
      constrainRectangle: this.constrainRect
        ? new Rectangle(this.constrainRect)
        : undefined,
      removeOnDropOutside: this.removeOnDropOutside ?? false,

      listeners: {
        start: Dragger.onDragStartOperation,
        move: Dragger.onDragMoveOperation.bind(null, initialModel),
        drop: Dragger.onDragDropOperation,
      },
    });

    return operation;
  }
}

type DragOperationOptions = {
  startPoint: PointCoords;

  orientation: DraggerOrientation;

  model: DragOperationModel;

  constrainRectangle?: Rectangle;
  removeOnDropOutside?: boolean;

  listeners?: Partial<DragOperationEvents>;
};

type DragOperationModel = {
  draggableItems: DraggableItem[];
  dragSourceListId: string;
  dropTargetListId: string | null;
  dragItem: DraggableItem;
};

type DragOperationEvents = {
  start: (
    params: { dragSourceListId: string; dragItemId: string },
    operation: DragOperation,
  ) => void;
  move: (
    params: ReturnType<DragOperation['move']>,
    operation: DragOperation,
  ) => void;
  drop: (
    params: ReturnType<DragOperation['drop']>,
    operation: DragOperation,
  ) => void;
};

type DragOperationWatcher = {
  model: DragOperationModel;
  constrainRectangle: Rectangle;
};

export class DragOperation extends EventEmitter<DragOperationEvents> {
  startPoint: PointCoords;

  private orientation: DraggerOrientation;

  private breakpoints: number[] = [];
  private dragIndex: number = -1;
  private dropIndex: number = -1;
  private dragRectangle!: Rectangle;
  private constrainRectangle?: Rectangle;
  private removeOnDropOutside: boolean;

  private model!: DragOperationModel;

  private isOutside: boolean = false;

  private options: DragOperationOptions;

  public dragWatchers: DragOperationWatcher[] = [];

  constructor(options: DragOperationOptions) {
    super(options.listeners);

    this.options = options;

    this.startPoint = {
      top: Math.round(options.startPoint.top),
      left: Math.round(options.startPoint.left),
    };
    this.orientation = options.orientation;

    this.constrainRectangle = options.constrainRectangle;
    this.removeOnDropOutside = options.removeOnDropOutside ?? false;

    this.setModel(options.model);

    this.start();
  }

  areModelsEqual(model1: DragOperationModel, model2: DragOperationModel) {
    return shallowEqualObjects(model1, model2);
  }

  setModel(model: DragOperationModel) {
    if (this.areModelsEqual(this.model, model)) {
      return false;
    }

    this.model = model;

    this.dragRectangle = new Rectangle(this.model.dragItem.rect);

    this.dragIndex = this.model.draggableItems.findIndex(
      (item) => item.id === this.model.dragItem.id,
    );

    this.breakpoints = this.model.draggableItems.map((item) => {
      return this.orientation === 'horizontal'
        ? item.rect.left + item.rect.width / 2
        : item.rect.top + item.rect.height / 2;
    });

    return true;
  }

  getModel() {
    return this.model;
  }

  getData() {
    return {
      dragSourceListId: this.model.dragSourceListId,
      dragItemId: this.model.dragItem.id,
      dropTargetListId: this.model.dropTargetListId,
    };
  }

  start() {
    const params = {
      dragSourceListId: this.model.dragSourceListId,
      dragItemId: this.model.dragItem.id,
    };

    this.emit('start', params, this);

    return params;
  }

  drop() {
    const { dragIndex, dropIndex, model } = this;
    const draggableItems = model.draggableItems;

    const initials = Array.from(
      { length: draggableItems.length },
      (_, index) => index,
    );

    let sortedItems: DraggableItem[] = [];

    let sortedIndexes: number[] = [];

    if (this.isOutside) {
      sortedIndexes = initials.filter((index) => index !== dragIndex);
    } else {
      sortedIndexes = moveXatY(
        initials,
        dragIndex,
        dropIndex > dragIndex ? dropIndex - 1 : dropIndex,
      );
    }
    sortedItems = sortedIndexes.map((index) => draggableItems[index]);

    const result = {
      dragIndex,
      dropIndex,
      sortedIndexes,
      sortedItems,
      items: draggableItems,
      dragSourceListId: model.dragSourceListId,
      dropTargetListId: model.dropTargetListId,
    };

    this.emit('drop', result, this);

    return result;
  }

  move(point: PointCoords, offsetPoint?: PointCoords) {
    offsetPoint = offsetPoint ?? {
      top: Math.round(point.top - this.startPoint.top),
      left: Math.round(point.left - this.startPoint.left),
    };

    const dragRectangle = Rectangle.from(this.dragRectangle);
    dragRectangle.shift(offsetPoint);

    if (this.constrainRectangle) {
      const center = Point.from(dragRectangle.getCenter());

      if (!this.constrainRectangle.containsPoint(center)) {
        this.isOutside = true;
        const dragItem = this.model.dragItem;

        this.model.dropTargetListId = null;
        const result = {
          point,
          offsetPoint,
          dropIndex: -1,
          dragIndex: this.dragIndex,
          dragItem,
          items: this.model.draggableItems,
          isOutside: true,
          dragSourceListId: this.model.dragSourceListId,
          dropTargetListId: this.model.dropTargetListId,
          offsetsForItems: this.model.draggableItems.map((_item, index) => {
            if (_item === dragItem) {
              return offsetPoint;
            }

            if (index > this.dragIndex) {
              return this.orientation === 'horizontal'
                ? { left: -dragItem.rect.width, top: 0 }
                : { left: 0, top: -dragItem.rect.height };
            }

            return { left: 0, top: 0 };
          }),
          dragRectangle,
        };

        this.emit('move', result, this);

        return result;
      }
    }

    // this.model.dropTargetListId = this.model.dragSourceListId;

    this.isOutside = false;

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
            ? this.model.dragItem.rect.right
            : this.model.dragItem.rect.bottom
          : orientation === 'horizontal'
          ? this.model.dragItem.rect.left
          : this.model.dragItem.rect.top,
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

    const offsetsForItems = this.model.draggableItems.map((_item, index) => {
      if (index === this.dragIndex) {
        return offsetPoint;
      }

      if (index < startIndex || index >= endIndex) {
        return { left: 0, top: 0 };
      }

      const dir = dropIndex <= index ? 1 : -1;

      return orientation === 'horizontal'
        ? { left: Math.round(dir * this.model.dragItem.rect.width), top: 0 }
        : { left: 0, top: Math.round(dir * this.model.dragItem.rect.height) };
    });

    this.dropIndex = dropIndex;

    // console.log('dropIndex', dropIndex, 'target', this.model.dropTargetListId);

    const result = {
      point,
      offsetPoint,
      dropIndex,
      dragSourceListId: this.model.dragSourceListId,
      dropTargetListId: this.model.dropTargetListId,
      dragIndex: this.dragIndex,
      items: this.model.draggableItems,
      dragItem: this.model.dragItem,
      offsetsForItems,
      dragRectangle,
      isOutside: false,
    };

    this.emit('move', result, this);

    return result;
  }
}
