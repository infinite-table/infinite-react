/**
 * Angular sibling of DragDropProvider.tsx (Vue: DragDropProvider.vue.ts).
 *
 * It knows the drag that is in progress on the page - its source list, the
 * list it is over, the dragged item and whether the drop would be accepted -
 * and gives that to the drag lists inside it and to
 * `injectDragDropProvider()`.
 *
 * An attribute directive, on an element of yours or on an `ng-container`:
 *
 * ```html
 * <div infiniteDragDropProvider #dnd="infiniteDragDropProvider">
 *   <div infiniteDragList="left" orientation="vertical" (dropped)="onDrop($event)">...</div>
 *   {{ dnd.context().dropTargetListId }}
 * </div>
 * ```
 */
import {
  DestroyRef,
  Directive,
  InjectionToken,
  Signal,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

import { DragManager } from './DragManager';

import type {
  DragDropSourceAndTarget,
  DragDropProviderContextValue,
} from './dragDropTypes';

export type { DragDropSourceAndTarget, DragDropProviderContextValue };

const NO_DRAG: DragDropSourceAndTarget = {
  dragSourceListId: null,
  dropTargetListId: null,
  dragItemId: '',
  status: 'accepted',
};

export const INFINITE_DRAG_DROP_PROVIDER = new InjectionToken<
  Signal<DragDropProviderContextValue>
>('INFINITE_DRAG_DROP_PROVIDER');

// what injectDragDropProvider gives when there is no provider
const DEFAULT_CONTEXT: Signal<DragDropProviderContextValue> = signal({
  ...NO_DRAG,
  updateDragOperationSourceAndTarget: () => {},
  getCurrentDragSourceAndTarget: () => ({ ...NO_DRAG }),
}).asReadonly();

/**
 * In an injection context: the state of the drag in progress, from the
 * closest DragDropProvider, as a signal - read it in a template, a computed
 * or an effect to follow the drag.
 */
export function injectDragDropProvider(): Signal<DragDropProviderContextValue> {
  return (
    inject(INFINITE_DRAG_DROP_PROVIDER, { optional: true }) ?? DEFAULT_CONTEXT
  );
}

@Directive({
  selector: '[infiniteDragDropProvider]',
  exportAs: 'infiniteDragDropProvider',
  providers: [
    {
      provide: INFINITE_DRAG_DROP_PROVIDER,
      useFactory: () => inject(DragDropProvider).context,
    },
  ],
})
export class DragDropProvider {
  private state: DragDropSourceAndTarget = NO_DRAG;

  private readonly getCurrentDragSourceAndTarget =
    (): DragDropSourceAndTarget => ({
      dragSourceListId: this.state.dragSourceListId,
      dropTargetListId: this.state.dropTargetListId,
      dragItemId: this.state.dragItemId,
      status: this.state.status,
    });

  private readonly updateDragOperationSourceAndTarget = (
    params: DragDropSourceAndTarget,
  ) => {
    this.setState(
      params.dragSourceListId,
      params.dropTargetListId,
      params.dragItemId,
      params.status,
    );
  };

  private readonly contextSignal = signal<DragDropProviderContextValue>({
    ...NO_DRAG,
    updateDragOperationSourceAndTarget: this.updateDragOperationSourceAndTarget,
    getCurrentDragSourceAndTarget: this.getCurrentDragSourceAndTarget,
  });

  /**
   * The state of the drag in progress (tracked).
   */
  readonly context = this.contextSignal.asReadonly();

  constructor() {
    let stopListening: (() => void) | null = null;

    // no drag can start before the lists are rendered
    afterNextRender(() => {
      const removeDragStart = DragManager.on('drag-start', (params) => {
        this.setState(
          params.dragSourceListId,
          params.dropTargetListId,
          params.dragItem.id,
          'accepted',
        );
      });

      const removeDragMove = DragManager.on('drag-move', (params) => {
        this.setState(
          params.dragSourceListId,
          params.dropTargetListId,
          params.dragItem.id,
          params.status,
        );
      });

      const removeDragDrop = DragManager.on('drag-drop', () => {
        this.setState(null, null, '', 'accepted');
      });

      stopListening = () => {
        removeDragStart();
        removeDragMove();
        removeDragDrop();
      };
    });

    inject(DestroyRef).onDestroy(() => {
      stopListening?.();
      stopListening = null;
    });
  }

  private setState(
    dragSourceListId: string | null,
    dropTargetListId: string | null,
    dragItemId: string,
    status: DragDropSourceAndTarget['status'],
  ) {
    const state = this.state;
    // this is called on every pointer move of a drag: nothing is allocated
    // and nothing is rendered again unless something has changed
    if (
      state.dragSourceListId === dragSourceListId &&
      state.dropTargetListId === dropTargetListId &&
      state.dragItemId === dragItemId &&
      state.status === status
    ) {
      return;
    }

    this.state = { dragSourceListId, dropTargetListId, dragItemId, status };

    this.contextSignal.set({
      dragSourceListId,
      dropTargetListId,
      dragItemId,
      status,
      updateDragOperationSourceAndTarget:
        this.updateDragOperationSourceAndTarget,
      getCurrentDragSourceAndTarget: this.getCurrentDragSourceAndTarget,
    });
  }
}
