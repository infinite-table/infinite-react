/**
 * Vue sibling of DragDropProvider.tsx.
 *
 * It knows the drag that is in progress on the page - its source list, the
 * list it is over, the dragged item and whether the drop would be accepted -
 * and gives that to the drag lists inside it and to `useDragDropProvider()`.
 */
import {
  defineComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
} from 'vue';
import type { InjectionKey, ShallowRef, SlotsType, VNodeChild } from 'vue';

import { DragManager } from './DragManager';

export type DragDropSourceAndTarget = {
  dragSourceListId: string | null;
  dropTargetListId: string | null;
  dragItemId: string;
  status: 'accepted' | 'rejected';
};

export type DragDropProviderContextValue = DragDropSourceAndTarget & {
  updateDragOperationSourceAndTarget: (params: DragDropSourceAndTarget) => void;
  getCurrentDragSourceAndTarget: () => DragDropSourceAndTarget;
};

const NO_DRAG: DragDropSourceAndTarget = {
  dragSourceListId: null,
  dropTargetListId: null,
  dragItemId: '',
  status: 'accepted',
};

const DragDropProviderInjectionKey: InjectionKey<
  ShallowRef<DragDropProviderContextValue>
> = Symbol('DragDropProvider');

// what useDragDropProvider gives when there is no provider
const DEFAULT_CONTEXT = shallowRef<DragDropProviderContextValue>({
  ...NO_DRAG,
  updateDragOperationSourceAndTarget: () => {},
  getCurrentDragSourceAndTarget: () => ({ ...NO_DRAG }),
});

/**
 * The state of the drag in progress, from the closest DragDropProvider.
 *
 * Returns a ref: read `.value` in a render function or a computed, so they
 * follow the drag.
 */
export const useDragDropProvider =
  (): ShallowRef<DragDropProviderContextValue> => {
    return inject(DragDropProviderInjectionKey, DEFAULT_CONTEXT);
  };

export const DragDropProvider = defineComponent({
  name: 'DragDropProvider',
  slots: Object as SlotsType<{
    default?: (context: DragDropProviderContextValue) => VNodeChild;
  }>,
  setup(_props, { slots }) {
    let state: DragDropSourceAndTarget = NO_DRAG;

    const getCurrentDragSourceAndTarget = (): DragDropSourceAndTarget => ({
      dragSourceListId: state.dragSourceListId,
      dropTargetListId: state.dropTargetListId,
      dragItemId: state.dragItemId,
      status: state.status,
    });

    const setState = (
      dragSourceListId: string | null,
      dropTargetListId: string | null,
      dragItemId: string,
      status: DragDropSourceAndTarget['status'],
    ) => {
      // this is called on every pointer move of a drag: nothing is allocated
      // and nothing is re-rendered unless something has changed
      if (
        state.dragSourceListId === dragSourceListId &&
        state.dropTargetListId === dropTargetListId &&
        state.dragItemId === dragItemId &&
        state.status === status
      ) {
        return;
      }

      state = { dragSourceListId, dropTargetListId, dragItemId, status };

      contextRef.value = {
        dragSourceListId,
        dropTargetListId,
        dragItemId,
        status,
        updateDragOperationSourceAndTarget,
        getCurrentDragSourceAndTarget,
      };
    };

    const updateDragOperationSourceAndTarget = (
      params: DragDropSourceAndTarget,
    ) => {
      setState(
        params.dragSourceListId,
        params.dropTargetListId,
        params.dragItemId,
        params.status,
      );
    };

    const contextRef = shallowRef<DragDropProviderContextValue>({
      ...NO_DRAG,
      updateDragOperationSourceAndTarget,
      getCurrentDragSourceAndTarget,
    });

    provide(DragDropProviderInjectionKey, contextRef);

    let stopListening: (() => void) | null = null;

    onMounted(() => {
      const removeDragStart = DragManager.on('drag-start', (params) => {
        setState(
          params.dragSourceListId,
          params.dropTargetListId,
          params.dragItem.id,
          'accepted',
        );
      });

      const removeDragMove = DragManager.on('drag-move', (params) => {
        setState(
          params.dragSourceListId,
          params.dropTargetListId,
          params.dragItem.id,
          params.status,
        );
      });

      const removeDragDrop = DragManager.on('drag-drop', () => {
        setState(null, null, '', 'accepted');
      });

      stopListening = () => {
        removeDragStart();
        removeDragMove();
        removeDragDrop();
      };
    });

    onBeforeUnmount(() => {
      stopListening?.();
      stopListening = null;
    });

    // The slot gets the context as its props. They are read from the ref
    // when the slot uses them, so a slot that does not use them (the common
    // case: the provider only wraps the lists) is not rendered again
    // when the state of the drag changes.
    const slotProps: DragDropProviderContextValue = {
      get dragSourceListId() {
        return contextRef.value.dragSourceListId;
      },
      get dropTargetListId() {
        return contextRef.value.dropTargetListId;
      },
      get dragItemId() {
        return contextRef.value.dragItemId;
      },
      get status() {
        return contextRef.value.status;
      },
      updateDragOperationSourceAndTarget,
      getCurrentDragSourceAndTarget,
    };

    return () => slots.default?.(slotProps);
  },
});
