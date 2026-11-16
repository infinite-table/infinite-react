/**
 * Vue sibling of DragList.tsx.
 *
 * What a drag does (the pointer, the DOM, the DragManager) is shared with
 * the React build: it is in dragListController.ts. This file has what is
 * specific to Vue: the component, its slots and its context.
 *
 * Differences from the React component, all of them the Vue idiom:
 * - the children are the default slot, which gets `{ domProps, context }`;
 * - `domProps` has `class` and `onPointerdown`, as `h()` and `v-bind` take;
 * - `useDragListContext()` returns a ref.
 */
import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  toRaw,
  watch,
} from 'vue';
import type {
  ComponentPublicInstance,
  ComputedRef,
  InjectionKey,
  PropType,
  SlotsType,
  VNodeChild,
} from 'vue';

import { DraggableItemRecipe, DragListRecipe } from './DragList.css';
import { join } from '../../../../utils/join';
// with the explicit suffix, so the React type-check of this file
// (which resolves './DragDropProvider' to the React one) agrees
import { useDragDropProvider } from './DragDropProvider.vue';
import type { DragInteractionTarget } from './DragInteractionTarget';
import { DragManager } from './DragManager';
import {
  acceptDragsFromOtherLists,
  bindInteractionTarget,
  createDefaultProxy,
  defaultDragProxyMove,
  defaultUpdatePosition,
  DRAG_ITEM_ATTRIBUTE,
  DRAG_ITEM_LIST_ATTRIBUTE,
  DRAG_LIST_ATTRIBUTE,
  findDragListElement,
  getDragItemNodes,
  replaceRegisteredInteractionTarget,
  startDragOnPointerDown,
  type DragListBaseProps,
  type DragListProxyState,
  type DragProxyMoveParams,
  type DragProxyRenderState,
  type DragProxySetupParams,
  type DragProxySetupResult,
  type UpdateDragProxyRenderState,
} from './dragListController';

// the framework-neutral part of the drag list is in dragListController.ts
export {
  createDefaultProxy,
  defaultDragProxyMove,
  DRAG_ITEM_ATTRIBUTE,
  DRAG_ITEM_LIST_ATTRIBUTE,
  type DragProxyMoveParams,
  type DragProxySetupParams,
  type DragProxySetupResult,
};

type DragListContextValue = {
  dragItemId: string | number | null;
  onDragItemPointerDown: (e: PointerEvent) => void;
  draggingInProgress: boolean;
  dragListId: string;
  dragSourceListId: string | null;
  dropTargetListId: string | null;
  status: 'accepted' | 'rejected';
};

const DragListInjectionKey: InjectionKey<ComputedRef<DragListContextValue>> =
  Symbol('DragList');

// what useDragListContext gives outside a drag list
const DEFAULT_LIST_CONTEXT = computed<DragListContextValue>(() => ({
  dragItemId: null,
  onDragItemPointerDown: () => {},
  draggingInProgress: false,
  dragListId: '',
  status: 'accepted',
  dragSourceListId: null,
  dropTargetListId: null,
}));

/**
 * The context of the closest DragList.
 *
 * Returns a ref: read `.value` in a render function or a computed, so they
 * follow the drag.
 */
export const useDragListContext = (): ComputedRef<DragListContextValue> => {
  return inject(DragListInjectionKey, DEFAULT_LIST_CONTEXT);
};

export type DragProxyRenderParams = DragProxyRenderState & {
  /** Must be passed as the `ref` of the root element of the rendered proxy. */
  ref: (node: Element | ComponentPublicInstance | null) => void;
};

export type DragListProps = DragListBaseProps & {
  /**
   * Render a custom vnode as the drag proxy. The function should render in
   * a `Teleport` itself and attach params.ref to the root element.
   * When provided, onDragProxySetup and onDragProxyMove are ignored.
   * The original DOM node is hidden automatically.
   * Called with dragItemId: null on drop/cancel — return null to unmount.
   */
  renderDragProxy?: (params: DragProxyRenderParams) => VNodeChild;
};

/**
 * To be bound on the element of the list, eg with `v-bind`.
 */
type DragListDomProps = {
  class: string;
  [DRAG_LIST_ATTRIBUTE]: string;
};

type DragItemContextValue = {
  dragItemId: string | number;
  dragListId: string | null;
  active: boolean;
  draggingInProgress: boolean;
  dragSourceListId: string | null;
  dropTargetListId: string | null;
};

/**
 * To be bound on the element of the item, eg with `v-bind`. For a drag
 * handle, take `onPointerdown` out and put it on the handle.
 */
type DraggableItemDomProps = {
  class: string;
  [DRAG_ITEM_ATTRIBUTE]: string;
  [DRAG_ITEM_LIST_ATTRIBUTE]: string;
  onPointerdown: (e: PointerEvent) => void;
};

const DraggableItem = defineComponent({
  name: 'DraggableItem',
  props: {
    id: { type: [String, Number] as PropType<string | number>, required: true },
    dragListId: { type: String, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (params: {
      domProps: DraggableItemDomProps;
      context: DragItemContextValue;
    }) => VNodeChild;
  }>,
  setup(props, { slots }) {
    const listContext = useDragListContext();

    // Each of these is its own computed, so the item is only rendered again
    // when one of them has a new value - not for every change of the
    // list context (eg the pointer going over another list).
    const dragItemListId = computed(
      () => props.dragListId ?? listContext.value.dragListId,
    );
    const active = computed(() => {
      const { dragSourceListId, dragItemId } = listContext.value;

      return (
        dragSourceListId === dragItemListId.value &&
        dragItemId === `${props.id}`
      );
    });
    const draggingInProgress = computed(
      () => listContext.value.draggingInProgress,
    );
    const onPointerdown = computed(
      () => listContext.value.onDragItemPointerDown,
    );

    const domProps = computed<DraggableItemDomProps>(() => ({
      [DRAG_ITEM_ATTRIBUTE]: `${props.id}`,
      [DRAG_ITEM_LIST_ATTRIBUTE]: dragItemListId.value,
      onPointerdown: onPointerdown.value,
      class: join(
        'DraggableItem',
        active.value ? 'DraggableItem--active' : '',
        DraggableItemRecipe({
          active: active.value,
          draggingInProgress: draggingInProgress.value,
        }),
      ),
    }));

    const context = computed<DragItemContextValue>(() => ({
      dragItemId: props.id,
      active: active.value,
      dragListId: dragItemListId.value,
      draggingInProgress: draggingInProgress.value,
      dragSourceListId: listContext.value.dragSourceListId,
      dropTargetListId: listContext.value.dropTargetListId,
    }));

    // read when the slot uses them - see the same thing in DragList
    const slotProps = {
      get domProps() {
        return domProps.value;
      },
      get context() {
        return context.value;
      },
    };

    return () => slots.default?.(slotProps);
  },
});

const DragListComponent = defineComponent({
  name: 'DragList',
  props: {
    dragListId: { type: String, required: true },
    orientation: {
      type: String as PropType<DragListProps['orientation']>,
      required: true,
    },
    acceptDropsFrom: {
      type: Array as PropType<string[]>,
      default: undefined,
    },
    removeOnDropOutside: { type: Boolean, default: undefined },
    shouldAcceptDrop: {
      type: Function as PropType<DragListProps['shouldAcceptDrop']>,
      default: undefined,
    },
    onRemove: {
      type: Function as PropType<DragListProps['onRemove']>,
      default: undefined,
    },
    onAcceptDrop: {
      type: Function as PropType<DragListProps['onAcceptDrop']>,
      default: undefined,
    },
    onDrop: {
      type: Function as PropType<DragListProps['onDrop']>,
      required: true,
    },
    updatePosition: {
      type: Function as PropType<DragListProps['updatePosition']>,
      default: undefined,
    },
    dragStrategy: {
      type: String as PropType<DragListProps['dragStrategy']>,
      default: undefined,
    },
    onDragProxySetup: {
      type: Function as PropType<DragListProps['onDragProxySetup']>,
      default: undefined,
    },
    onDragProxyMove: {
      type: Function as PropType<DragListProps['onDragProxyMove']>,
      default: undefined,
    },
    renderDragProxy: {
      type: Function as PropType<DragListProps['renderDragProxy']>,
      default: undefined,
    },
    preserveDragSpace: { type: Boolean, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (params: {
      domProps: DragListDomProps;
      context: DragListContextValue;
    }) => VNodeChild;
  }>,
  setup(props, { slots }) {
    // The props object without the reactive proxy. Vue updates it in place,
    // so it always has the current props. The handlers of a drag read their
    // props from it: they run outside rendering, on pointer and scroll
    // events, where going through the proxy would only add work.
    const rawProps = toRaw(props) as DragListProps;

    // these live as long as the list, and are not reactive
    const domRef: { current: HTMLElement | null } = { current: null };
    const proxyStateRef: { current: DragListProxyState | null } = {
      current: null,
    };
    const sourceScrollOffsetRef = { current: { top: 0, left: 0 } };
    const dragItemsRef: { current: HTMLElement[] } = { current: [] };
    const registeredTargetRef: { current: DragInteractionTarget | null } = {
      current: null,
    };

    const dragDropProvider = useDragDropProvider();

    // only used with renderDragProxy
    const dragProxyRenderState = shallowRef<DragProxyRenderState | null>(null);
    const updateDragProxyRenderState: UpdateDragProxyRenderState = (update) => {
      dragProxyRenderState.value = update(dragProxyRenderState.value);
    };
    const proxyNodeRef: { current: Element | null } = { current: null };
    const proxyRefCallback: DragProxyRenderParams['ref'] = (node) => {
      proxyNodeRef.current = node instanceof Element ? node : null;
    };

    const interactionTarget = shallowRef<DragInteractionTarget | null>(null);

    const setInteractionTarget = (target: DragInteractionTarget | null) => {
      replaceRegisteredInteractionTarget(registeredTargetRef, target);

      interactionTarget.value = target;
    };

    const getDragItems = () =>
      getDragItemNodes(dragItemsRef, domRef, rawProps.dragListId);

    // The list has to follow its interaction target from the moment it has
    // one, so this is a sync watcher: the target is set on pointer down (or
    // when a drag starts in another list), and the drag can start on the
    // very next pointer event.
    watch(
      [interactionTarget, () => props.dragListId],
      ([target, dragListId], _previous, onCleanup) => {
        if (!target) {
          return;
        }

        onCleanup(
          bindInteractionTarget(target, {
            dragListId,
            orientation: rawProps.orientation,
            domRef,
            proxyStateRef,
            sourceScrollOffsetRef,
            dragItemsRef,
            getDragItems,
            getOnDrop: () => rawProps.onDrop,
            getOnAcceptDrop: () => rawProps.onAcceptDrop,
            getOnRemove: () => rawProps.onRemove,
            getUpdatePosition: () =>
              rawProps.updatePosition ?? defaultUpdatePosition,
            updateDragOperationSourceAndTarget: (params) =>
              dragDropProvider.value.updateDragOperationSourceAndTarget(params),
            updateDragProxyRenderState,
          }),
        );
      },
      { flush: 'sync' },
    );

    // the same function for the whole life of the list
    const onDragItemPointerDown = (e: PointerEvent) => {
      startDragOnPointerDown(e, rawProps, {
        domRef,
        proxyStateRef,
        sourceScrollOffsetRef,
        dragItemsRef,
        setInteractionTarget,
        updateDragProxyRenderState,
      });
    };

    let stopAcceptingDrags: (() => void) | null = null;

    onMounted(() => {
      findDragListElement(domRef, props.dragListId);

      stopAcceptingDrags = acceptDragsFromOtherLists({
        getProps: () => rawProps,
        domRef,
        setInteractionTarget,
      });
    });

    watch(
      () => props.dragListId,
      (dragListId) => {
        findDragListElement(domRef, dragListId);
      },
      // after the DOM has the new id
      { flush: 'post' },
    );

    onBeforeUnmount(() => {
      stopAcceptingDrags?.();
      stopAcceptingDrags = null;

      // don't leave a target behind when the list is unmounted
      DragManager.unregisterDragInteractionTarget(registeredTargetRef.current);
      registeredTargetRef.current = null;
    });

    const dragging = computed(() => !!dragDropProvider.value.dragItemId);

    const context = computed<DragListContextValue>(() => {
      const { dragItemId, dragSourceListId, dropTargetListId, status } =
        dragDropProvider.value;

      return {
        dragItemId,
        onDragItemPointerDown,
        dragSourceListId,
        dropTargetListId,
        status,
        dragListId: props.dragListId,
        draggingInProgress: !!dragItemId,
      };
    });

    provide(DragListInjectionKey, context);

    const domProps = computed<DragListDomProps>(() => ({
      class: join(
        'DragList',
        dragging.value ? 'DragList--dragging' : '',
        DragListRecipe({
          dragging: dragging.value,
        }),
      ),
      [DRAG_LIST_ATTRIBUTE]: props.dragListId,
    }));

    // The slot props are read from the computeds when the slot uses them.
    // So a slot that only uses `domProps` is rendered again when a drag
    // starts and when it ends, and not while the drag moves between lists.
    const slotProps = {
      get domProps() {
        return domProps.value;
      },
      get context() {
        return context.value;
      },
    };

    return () => {
      const proxyRenderState = dragProxyRenderState.value;

      // always the same two children, so the list is not mounted again
      // when the proxy shows up
      return [
        slots.default?.(slotProps) ?? null,
        proxyRenderState && props.renderDragProxy
          ? props.renderDragProxy({
              ...proxyRenderState,
              ref: proxyRefCallback,
            })
          : null,
      ];
    };
  },
});

export const DragList = Object.assign(DragListComponent, { DraggableItem });
