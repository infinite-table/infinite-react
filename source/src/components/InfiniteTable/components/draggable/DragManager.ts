import { PointCoords } from '../../../../utils/pageGeometry/Point';
import { Rectangle } from '../../../../utils/pageGeometry/Rectangle';
import { shallowEqualObjects } from '../../../../utils/shallowEqualObjects';
import { EventEmitter } from '../../../utils/EventEmitter';
import {
  handleInsideOperation,
  handleOutsideOperation,
} from './dragOperationHandlers';

import {
  DraggableItem,
  DragInteractionTarget,
  DragInteractionTargetData,
  DragInteractionTargetMoveEvent,
} from './DragInteractionTarget';

export type DragOperationHandlerResult = {
  event: DragInteractionTargetMoveEvent;
  error: string | null;
  success: boolean;
};

type DragManagerDragStartEvent = {
  dragSourceListId: string;
  dropTargetListId: string | null;
  dragIndex: number;
  dragItem: DraggableItem;
};

export type DragManagerDragMoveEvent = {
  dragSourceListId: string;
  dropTargetListId: string | null;
  dragItem: DraggableItem;
  dragIndex: number;
  dropIndex: number;
  items: DraggableItem[];
  status: 'accepted' | 'rejected';
};

type DragManagerEvents = {
  register: (dragInteractionTarget: DragInteractionTarget) => void;
  unregister: (dragInteractionTarget: DragInteractionTarget) => void;
  'drag-start': (params: DragManagerDragStartEvent) => void;
  'drag-move': (params: DragManagerDragMoveEvent) => void;
  'drag-drop': (params: DragManagerDragMoveEvent) => void;
};
export class DragManager {
  // public static dragInteractionTargets: DragInteractionTarget[] = [];
  public static dragInteractionTargetsMap: Map<string, DragInteractionTarget> =
    new Map();

  public static startDrag(
    dragSource: ActiveDragSource | ActiveDragSourceData,
    startPoint: PointCoords,
  ) {
    const activeDragSource = !(dragSource instanceof ActiveDragSource)
      ? new ActiveDragSource(dragSource)
      : dragSource;

    const dragOperation = new DragOperation({
      activeDragSource,
      startPoint,
    });

    dragOperation.on('start', DragManager.onDragStart);
    dragOperation.on('move', DragManager.onDragMove);
    dragOperation.on('drop', DragManager.onDragDrop);

    dragOperation.start();

    return dragOperation;
  }

  private static emitter = new EventEmitter<DragManagerEvents>();
  private static emit<E extends keyof DragManagerEvents>(
    event: E,
    ...params: Parameters<DragManagerEvents[E]>
  ) {
    DragManager.emitter.emit(event, ...params);
  }

  public static on<E extends keyof DragManagerEvents>(
    event: E,
    callback: DragManagerEvents[E],
  ) {
    return DragManager.emitter.on(event, callback);
  }

  public static registerDragInteractionTarget(
    dragInteractionTarget: DragInteractionTarget,
  ) {
    if (
      DragManager.dragInteractionTargetsMap.has(dragInteractionTarget.listId)
    ) {
      console.warn(
        `DragInteractionTarget with listId ${dragInteractionTarget.listId} already registered`,
      );
      return;
    }

    DragManager.dragInteractionTargetsMap.set(
      dragInteractionTarget.listId,
      dragInteractionTarget,
    );

    DragManager.emit('register', dragInteractionTarget);

    return () => {
      DragManager.unregisterDragInteractionTarget(dragInteractionTarget);
    };
  }

  public static unregisterAll() {
    DragManager.dragInteractionTargetsMap.forEach((interactionTarget) => {
      DragManager.unregisterDragInteractionTarget(interactionTarget);
    });
  }

  public static unregisterDragInteractionTarget(
    dragInteractionTarget: DragInteractionTarget | null | undefined,
  ) {
    if (!dragInteractionTarget) {
      return;
    }

    if (
      !DragManager.dragInteractionTargetsMap.has(dragInteractionTarget.listId)
    ) {
      console.warn(
        `DragInteractionTarget with listId ${dragInteractionTarget.listId} not found`,
      );
      return;
    }

    DragManager.dragInteractionTargetsMap.delete(dragInteractionTarget.listId);
    dragInteractionTarget.unregister();
    DragManager.emit('unregister', dragInteractionTarget);
  }

  private static onDragStart(dragOperation: DragOperation) {
    const { dragItem, dragIndex } = dragOperation.activeDragSource;
    const dragSourceListId = dragOperation.activeDragSource.listId;

    const sourceInteractionTarget =
      DragManager.dragInteractionTargetsMap.get(dragSourceListId);
    const acceptDropsFrom = sourceInteractionTarget?.getData().acceptDropsFrom;
    const acceptsSelfDrops =
      !acceptDropsFrom || acceptDropsFrom.includes(dragSourceListId);

    const dropTargetListId = acceptsSelfDrops ? dragSourceListId : null;

    DragManager.dragInteractionTargetsMap.forEach((interactionTarget) => {
      const interactionTargetData = interactionTarget.getData();

      interactionTarget.start({
        dragIndex:
          interactionTargetData.listId === dragSourceListId ? dragIndex : -1,
        dragItem,
        dragSourceListId,
        dropTargetListId,
      });
    });

    DragManager.emitter.emit('drag-start', {
      dragSourceListId,
      dropTargetListId,
      dragItem,
      dragIndex,
    });
  }

  private static withDragMove(
    dragOperation: DragOperation,
    callback: (
      interactionTarget: DragInteractionTarget,
      result: DragOperationHandlerResult,
    ) => void,
  ) {
    const { activeDragSource } = dragOperation;
    const { listId: dragSourceListId } = activeDragSource;

    const targets: DragInteractionTarget[] = [];

    let includeSelf = true;

    // let's process the drag source first
    const sourceInteractionTarget =
      DragManager.dragInteractionTargetsMap.get(dragSourceListId);

    if (sourceInteractionTarget) {
      includeSelf = sourceInteractionTarget.acceptsSelfDrops();
      if (includeSelf) {
        targets.push(
          DragManager.dragInteractionTargetsMap.get(dragSourceListId)!,
        );
      }
    }

    DragManager.dragInteractionTargetsMap.forEach((interactionTarget) => {
      if (interactionTarget.listId === dragSourceListId) {
        return;
      }

      targets.push(interactionTarget);
    });

    // handle the inside operation
    for (const interactionTarget of targets) {
      const result = handleInsideOperation(dragOperation, interactionTarget);

      if (!result) {
        continue;
      }

      // it can only be inside one interaction target
      callback(interactionTarget, result);
      // so we can break
      // we can also remove this target from the targets array
      // because we don't need to process it when we're outside
      targets.splice(targets.indexOf(interactionTarget), 1);
      break;
    }

    if (!includeSelf) {
      // include it for outside
      // insert it at the beginning
      targets.unshift(sourceInteractionTarget!);
    }

    // handle the outside operation
    for (const interactionTarget of targets) {
      const result = handleOutsideOperation(dragOperation, interactionTarget);

      if (!result) {
        continue;
      }

      callback(interactionTarget, result);
    }
  }

  private static onDragMove(dragOperation: DragOperation) {
    const { activeDragSource } = dragOperation;
    const { listId: dragSourceListId, dragItem } = activeDragSource;

    let insideTargetEvent: DragInteractionTargetMoveEvent | null = null;
    DragManager.withDragMove(dragOperation, (interactionTarget, { event }) => {
      interactionTarget.move(event);

      if (!event.outside) {
        insideTargetEvent = event;
      }
    });

    const event: DragInteractionTargetMoveEvent | null =
      insideTargetEvent! ?? null;

    const dropTargetListId = event?.dropTargetListId ?? null;

    DragManager.emit('drag-move', {
      dragSourceListId,
      dropTargetListId,
      items: event?.items ?? [],
      dragItem,
      status: event?.status ?? 'accepted',
      dragIndex: event?.dragIndex ?? -1,
      dropIndex: event?.dropIndex ?? -1,
    });
  }

  private static onDragDrop(dragOperation: DragOperation) {
    const { activeDragSource } = dragOperation;
    const { listId: dragSourceListId, dragItem } = activeDragSource;

    let insideTargetEvent: DragInteractionTargetMoveEvent | null = null;

    DragManager.withDragMove(dragOperation, (interactionTarget, { event }) => {
      interactionTarget.drop(event);

      if (!event.outside) {
        insideTargetEvent = event;
      }
    });

    const event: DragInteractionTargetMoveEvent | null =
      insideTargetEvent! ?? null;

    DragManager.emit('drag-drop', {
      dragSourceListId,
      dropTargetListId: event?.dropTargetListId ?? null,
      items: event?.items ?? [],
      dragItem,
      status: event?.status ?? 'accepted',
      dragIndex: event?.dragIndex ?? -1,
      dropIndex: event?.dropIndex ?? -1,
    });

    DragManager.unregisterAll();
  }
}

type ActiveDragSourceData = {
  listId: string;
  dragItem: DraggableItem;
  dragIndex: number;
};

export class ActiveDragSource {
  private data!: ActiveDragSourceData;
  public dragRectangle!: Rectangle;

  public static clone(source: ActiveDragSource) {
    const data = source.getData();
    const result = new ActiveDragSource(data);
    return result;
  }

  constructor(data: ActiveDragSourceData) {
    this.setData(data);
  }

  public get listId() {
    return this.data.listId;
  }

  public get dragIndex() {
    return this.data.dragIndex ?? -1;
  }

  public get dragItem() {
    return this.data.dragItem;
  }

  setData(data: ActiveDragSourceData) {
    if (shallowEqualObjects(this.data, data)) {
      return;
    }

    this.data = data;
    this.dragRectangle = new Rectangle(this.data.dragItem.rect);
  }

  private getData() {
    return this.data;
  }

  static shift(source: ActiveDragSource, offset: PointCoords) {
    const newDragSource = ActiveDragSource.clone(source);
    const dragRectangle = Rectangle.from(newDragSource.dragRectangle);
    dragRectangle.shift(offset);

    newDragSource.dragRectangle = dragRectangle;

    return newDragSource;
  }
}

type DragOperationEvents = {
  start: (
    operation: DragOperation,
    params: {
      dragSourceListId: string;
      dragItemId: string;
      startPoint: PointCoords;
    },
  ) => void;
  move: (operation: DragOperation) => void;
  drop: (operation: DragOperation) => void;
};

type DragOperationOptions = {
  startPoint: PointCoords;

  activeDragSource: ActiveDragSource;

  constrainRectangle?: Rectangle;
  removeOnDropOutside?: boolean;

  listeners?: Partial<DragOperationEvents>;
};

export class DragOperation extends EventEmitter<DragOperationEvents> {
  startPoint: PointCoords;

  public phase: 'start' | 'move' | 'drop' = 'start';

  private initialDragSource: ActiveDragSource;
  public activeDragSource: ActiveDragSource;
  private currentOffset: PointCoords = {
    top: 0,
    left: 0,
  };

  constructor(options: DragOperationOptions) {
    super(options.listeners);

    this.initialDragSource = ActiveDragSource.clone(options.activeDragSource);
    this.activeDragSource = this.initialDragSource;

    this.startPoint = {
      top: Math.round(options.startPoint.top),
      left: Math.round(options.startPoint.left),
    };
  }

  public get offset() {
    return this.currentOffset;
  }

  start() {
    const { listId, dragItem } = this.activeDragSource;
    const params = {
      dragSourceListId: listId,
      dragItemId: dragItem.id,
      startPoint: this.startPoint,
    };

    this.emit('start', this, params);

    return params;
  }

  drop() {
    this.phase = 'drop';
    this.emit('drop', this);
  }

  move(point: PointCoords) {
    if (this.phase !== 'start' && this.phase !== 'move') {
      return;
    }

    this.phase = 'move';
    const offset = {
      top: Math.round(point.top - this.startPoint.top),
      left: Math.round(point.left - this.startPoint.left),
    };

    this.activeDragSource = ActiveDragSource.shift(
      this.initialDragSource,
      offset,
    );

    this.currentOffset = offset;

    this.emit('move', this);
  }
}

// @ts-ignore
globalThis.DragManager = DragManager;
export { type DragInteractionTargetData };
