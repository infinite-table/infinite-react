/**
 * Angular sibling of DragList.tsx (Vue: DragList.vue.ts).
 *
 * What a drag does (the pointer, the DOM, the DragManager) is shared with
 * the React and Vue builds: it is in dragListController.ts. This file has
 * what is specific to Angular: the directives and their context.
 *
 * Differences from the React component, all of them the Angular idiom:
 * - the list and its items are attribute directives on your own elements,
 *   which get what React's `domProps` have (class names, data attributes,
 *   the pointer down listener of an item):
 *
 *   ```html
 *   <div infiniteDragList="vertical" orientation="vertical" (dropped)="onDrop($event)">
 *     @for (id of items; track id) {
 *       <div [infiniteDragItem]="id">{{ id }}</div>
 *     }
 *   </div>
 *   ```
 *
 * - the list id is the value of `infiniteDragList`, an item id the value of
 *   `infiniteDragItem`;
 * - a drag handle is an element with `infiniteDragHandle` inside the item:
 *   with one, only the handle starts a drag;
 * - `renderDragProxy` is a template, rendered in `document.body` while a
 *   drag is in progress, with the proxy state as its context;
 * - `injectDragList()` returns a signal.
 */
import {
  DestroyRef,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  InjectionToken,
  Signal,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';

import { DraggableItemRecipe, DragListRecipe } from './DragList.css';
import { join } from '../../../../utils/join';
import { booleanInput } from '../../../hooks/useComponentState/angularPropsMeta';
// with the explicit suffix, as the Vue sibling does
import { injectDragDropProvider } from './DragDropProvider.angular';
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

/** `(dropped)`: the new order of the old indexes, and what moved. */
export type DragListDropEvent = {
  sortedIndexes: number[];
  dragIndex: number;
  dropIndex: number;
  dragItemId: string;
  dropItemId?: string;
};

/** `(removed)`: the order without the removed item, and which one it was. */
export type DragListRemoveEvent = {
  sortedIndexes: number[];
  dragIndex: number;
  dragItemId: string;
};

/** `(dropAccepted)`: the item that came from another list, and where. */
export type DragListAcceptDropEvent = Parameters<
  NonNullable<DragListProps['onAcceptDrop']>
>[0];

// the framework-neutral part of the drag list is in dragListController.ts
export {
  createDefaultProxy,
  defaultDragProxyMove,
  DRAG_ITEM_ATTRIBUTE,
  DRAG_ITEM_LIST_ATTRIBUTE,
  type DragProxyMoveParams,
  type DragProxyRenderState,
  type DragProxySetupParams,
  type DragProxySetupResult,
};

export type DragListContextValue = {
  dragItemId: string | number | null;
  onDragItemPointerDown: (e: PointerEvent) => void;
  draggingInProgress: boolean;
  dragListId: string;
  dragSourceListId: string | null;
  dropTargetListId: string | null;
  status: 'accepted' | 'rejected';
};

export const INFINITE_DRAG_LIST = new InjectionToken<
  Signal<DragListContextValue>
>('INFINITE_DRAG_LIST');

// what injectDragList gives outside a drag list
const DEFAULT_LIST_CONTEXT: Signal<DragListContextValue> = signal({
  dragItemId: null,
  onDragItemPointerDown: () => {},
  draggingInProgress: false,
  dragListId: '',
  status: 'accepted' as const,
  dragSourceListId: null,
  dropTargetListId: null,
}).asReadonly();

/**
 * In an injection context inside a drag list: its context, as a signal -
 * read it in a template, a computed or an effect to follow the drag.
 */
export function injectDragList(): Signal<DragListContextValue> {
  return inject(INFINITE_DRAG_LIST, { optional: true }) ?? DEFAULT_LIST_CONTEXT;
}

/**
 * The context of the `renderDragProxy` template: the proxy state, as
 * `$implicit` (`let-proxy`) and by name (`let-dx="dx"`).
 */
export type DragProxyTemplateContext = DragProxyRenderState & {
  $implicit: DragProxyRenderState;
};

/**
 * The props of a drag list, as in React: the inputs of `[infiniteDragList]`
 * have these names (the list id is the value of `infiniteDragList`).
 */
export type DragListProps = DragListBaseProps & {
  /**
   * A template for the drag proxy, rendered in `document.body` while a drag
   * is in progress - give its root element `position: fixed` and place it
   * at `initialRect` moved by `dx` / `dy`. When provided, onDragProxySetup
   * and onDragProxyMove are ignored. The original DOM node is hidden
   * automatically.
   */
  renderDragProxy?: TemplateRef<DragProxyTemplateContext>;
};

type Ref<T> = { current: T };

/**
 * A drag list: put it on the element of the list. Its items are the
 * elements with `[infiniteDragItem]` inside it.
 */
@Directive({
  selector: '[infiniteDragList]',
  exportAs: 'infiniteDragList',
  providers: [
    {
      provide: INFINITE_DRAG_LIST,
      useFactory: () => inject(DragList).context,
    },
  ],
  host: {
    '[class]': 'className()',
    '[attr.data-drag-list-id]': 'dragListId()',
  },
})
export class DragList {
  readonly dragListId = input.required<string>({ alias: 'infiniteDragList' });
  readonly orientation = input.required<DragListProps['orientation']>();
  readonly acceptDropsFrom = input<string[]>();
  readonly removeOnDropOutside = input<
    boolean | undefined,
    boolean | '' | undefined
  >(undefined, { transform: booleanInput });
  readonly shouldAcceptDrop = input<DragListProps['shouldAcceptDrop']>();
  /**
   * A drop inside the list reordered its items: `sortedIndexes` is the new
   * order of the old indexes (React / Vue: `onDrop`).
   */
  readonly dropped = output<DragListDropEvent>();
  /**
   * An item was dragged out of the list and dropped outside it, with
   * `removeOnDropOutside` (React / Vue: `onRemove`).
   */
  readonly removed = output<DragListRemoveEvent>();
  /**
   * An item of another list (one of `acceptDropsFrom`) was dropped in this
   * list (React / Vue: `onAcceptDrop`).
   */
  readonly dropAccepted = output<DragListAcceptDropEvent>();
  readonly updatePosition = input<DragListProps['updatePosition']>();
  readonly dragStrategy = input<DragListProps['dragStrategy']>();
  readonly onDragProxySetup = input<DragListProps['onDragProxySetup']>();
  readonly onDragProxyMove = input<DragListProps['onDragProxyMove']>();
  readonly renderDragProxy = input<DragListProps['renderDragProxy']>();
  readonly preserveDragSpace = input<
    boolean | undefined,
    boolean | '' | undefined
  >(undefined, { transform: booleanInput });

  /**
   * The props as the handlers of a drag read them: they run on pointer and
   * scroll events, outside any reactive context.
   */
  private readonly props: DragListProps = (() => {
    const self = this;
    // the shared controller calls callbacks: they emit the outputs
    const onDrop: DragListProps['onDrop'] = (sortedIndexes, options) =>
      self.dropped.emit({ sortedIndexes, ...options });
    const onRemove: NonNullable<DragListProps['onRemove']> = (
      sortedIndexes,
      options,
    ) => self.removed.emit({ sortedIndexes, ...options });
    const onAcceptDrop: NonNullable<DragListProps['onAcceptDrop']> = (
      options,
    ) => self.dropAccepted.emit(options);
    return {
      get dragListId() {
        return untracked(self.dragListId);
      },
      get orientation() {
        return untracked(self.orientation);
      },
      get acceptDropsFrom() {
        return untracked(self.acceptDropsFrom);
      },
      get removeOnDropOutside() {
        return untracked(self.removeOnDropOutside);
      },
      get shouldAcceptDrop() {
        return untracked(self.shouldAcceptDrop);
      },
      onRemove,
      onAcceptDrop,
      onDrop,
      get updatePosition() {
        return untracked(self.updatePosition);
      },
      get dragStrategy() {
        return untracked(self.dragStrategy);
      },
      get onDragProxySetup() {
        return untracked(self.onDragProxySetup);
      },
      get onDragProxyMove() {
        return untracked(self.onDragProxyMove);
      },
      get renderDragProxy() {
        return untracked(self.renderDragProxy);
      },
      get preserveDragSpace() {
        return untracked(self.preserveDragSpace);
      },
    };
  })();

  private readonly vcr = inject(ViewContainerRef);
  private readonly dragDropProvider = injectDragDropProvider();

  // these live as long as the list, and are not reactive
  private readonly domRef: Ref<HTMLElement | null> = {
    current: inject<ElementRef<HTMLElement>>(ElementRef).nativeElement,
  };
  private readonly proxyStateRef: Ref<DragListProxyState | null> = {
    current: null,
  };
  private readonly sourceScrollOffsetRef = { current: { top: 0, left: 0 } };
  private readonly dragItemsRef: Ref<HTMLElement[]> = { current: [] };
  private readonly registeredTargetRef: Ref<DragInteractionTarget | null> = {
    current: null,
  };

  private interactionTarget: DragInteractionTarget | null = null;
  private unbindInteractionTarget: VoidFunction | null = null;

  // only used with renderDragProxy
  private dragProxyRenderState: DragProxyRenderState | null = null;
  private proxyView: EmbeddedViewRef<DragProxyTemplateContext> | null = null;

  private readonly updateDragProxyRenderState: UpdateDragProxyRenderState = (
    update,
  ) => {
    this.dragProxyRenderState = update(this.dragProxyRenderState);
    this.renderProxy(this.dragProxyRenderState);
  };

  private readonly setInteractionTarget = (
    target: DragInteractionTarget | null,
  ) => {
    replaceRegisteredInteractionTarget(this.registeredTargetRef, target);

    this.interactionTarget = target;
    // right away: the target is set on pointer down (or when a drag starts
    // in another list), and the drag can start on the very next pointer
    // event
    this.bindInteractionTarget();
  };

  // the same function for the whole life of the list
  private readonly onDragItemPointerDown = (e: PointerEvent) => {
    startDragOnPointerDown(e, this.props, {
      domRef: this.domRef,
      proxyStateRef: this.proxyStateRef,
      sourceScrollOffsetRef: this.sourceScrollOffsetRef,
      dragItemsRef: this.dragItemsRef,
      setInteractionTarget: this.setInteractionTarget,
      updateDragProxyRenderState: this.updateDragProxyRenderState,
    });
  };

  private readonly dragging = computed(
    () => !!this.dragDropProvider().dragItemId,
  );

  protected readonly className = computed(() => {
    const dragging = this.dragging();
    return join(
      'DragList',
      dragging ? 'DragList--dragging' : '',
      DragListRecipe({ dragging }),
    );
  });

  /**
   * The context of the list (tracked) - also what `injectDragList()` gives
   * inside it.
   */
  readonly context = computed<DragListContextValue>(() => {
    const { dragItemId, dragSourceListId, dropTargetListId, status } =
      this.dragDropProvider();

    return {
      dragItemId,
      onDragItemPointerDown: this.onDragItemPointerDown,
      dragSourceListId,
      dropTargetListId,
      status,
      dragListId: this.dragListId(),
      draggingInProgress: !!dragItemId,
    };
  });

  constructor() {
    // a new list id: the target in use follows it
    let firstRun = true;
    effect(() => {
      this.dragListId();
      if (firstRun) {
        firstRun = false;
        return;
      }
      untracked(() => this.bindInteractionTarget());
    });

    let stopAcceptingDrags: (() => void) | null = null;

    afterNextRender(() => {
      stopAcceptingDrags = acceptDragsFromOtherLists({
        getProps: () => this.props,
        domRef: this.domRef,
        setInteractionTarget: this.setInteractionTarget,
      });
    });

    inject(DestroyRef).onDestroy(() => {
      stopAcceptingDrags?.();
      stopAcceptingDrags = null;

      this.unbindInteractionTarget?.();
      this.unbindInteractionTarget = null;

      // don't leave a target behind when the list is destroyed
      DragManager.unregisterDragInteractionTarget(
        this.registeredTargetRef.current,
      );
      this.registeredTargetRef.current = null;

      this.destroyProxyView();
    });
  }

  /**
   * Makes the list follow the drag its interaction target takes part in -
   * see bindInteractionTarget in dragListController.ts.
   */
  private bindInteractionTarget() {
    this.unbindInteractionTarget?.();
    this.unbindInteractionTarget = null;

    const target = this.interactionTarget;
    if (!target) {
      return;
    }

    const props = this.props;
    const { dragListId } = props;

    this.unbindInteractionTarget = bindInteractionTarget(target, {
      dragListId,
      orientation: props.orientation,
      domRef: this.domRef,
      proxyStateRef: this.proxyStateRef,
      sourceScrollOffsetRef: this.sourceScrollOffsetRef,
      dragItemsRef: this.dragItemsRef,
      getDragItems: () =>
        getDragItemNodes(this.dragItemsRef, this.domRef, props.dragListId),
      getOnDrop: () => props.onDrop,
      getOnAcceptDrop: () => props.onAcceptDrop,
      getOnRemove: () => props.onRemove,
      getUpdatePosition: () => props.updatePosition ?? defaultUpdatePosition,
      updateDragOperationSourceAndTarget: (params) =>
        untracked(this.dragDropProvider).updateDragOperationSourceAndTarget(
          params,
        ),
      updateDragProxyRenderState: this.updateDragProxyRenderState,
    });
  }

  /**
   * Renders the `renderDragProxy` template in the body, for as long as an
   * item is dragged; its context follows the pointer.
   */
  private renderProxy(state: DragProxyRenderState | null) {
    const template = this.props.renderDragProxy;

    if (!state || state.dragItemId == null || !template) {
      this.destroyProxyView();
      return;
    }

    const context: DragProxyTemplateContext = { ...state, $implicit: state };

    if (!this.proxyView) {
      const view = this.vcr.createEmbeddedView(template, context);
      this.proxyView = view;
      // rendered by this list (it has the injector of the list), shown in
      // the body, so no scroll container clips it
      for (const node of view.rootNodes) {
        document.body.appendChild(node);
      }
    } else {
      Object.assign(this.proxyView.context, context);
    }
    this.proxyView.detectChanges();
  }

  private destroyProxyView() {
    const view = this.proxyView;
    this.proxyView = null;
    if (view && !view.destroyed) {
      view.destroy();
    }
  }
}

export type DragItemContextValue = {
  dragItemId: string | number;
  dragListId: string | null;
  active: boolean;
  draggingInProgress: boolean;
  dragSourceListId: string | null;
  dropTargetListId: string | null;
};

/**
 * An item of a drag list: put it on the element of the item, with the id
 * of the item as its value. Pressing on the element starts a drag - or only
 * on its `[infiniteDragHandle]`, when it has one.
 */
@Directive({
  selector: '[infiniteDragItem]',
  exportAs: 'infiniteDragItem',
  host: {
    '[class]': 'className()',
    '[attr.data-drag-item-id]': 'itemId()',
    '[attr.data-drag-item-list-id]': 'itemListId()',
  },
})
export class DragItem {
  readonly id = input.required<string | number>({ alias: 'infiniteDragItem' });
  /**
   * The list the item belongs to - the closest one by default.
   */
  readonly dragListId = input<string>();

  private readonly listContext = injectDragList();

  protected readonly itemId = computed(() => `${this.id()}`);

  protected readonly itemListId = computed(
    () => this.dragListId() ?? this.listContext().dragListId,
  );

  // Each of these is its own computed, so the item is only checked again
  // when one of them has a new value - not for every change of the
  // list context (eg the pointer going over another list).
  private readonly active = computed(() => {
    const { dragSourceListId, dragItemId } = this.listContext();
    return (
      dragSourceListId === this.itemListId() && dragItemId === this.itemId()
    );
  });

  private readonly draggingInProgress = computed(
    () => this.listContext().draggingInProgress,
  );

  protected readonly className = computed(() => {
    const active = this.active();
    return join(
      'DraggableItem',
      active ? 'DraggableItem--active' : '',
      DraggableItemRecipe({
        active,
        draggingInProgress: this.draggingInProgress(),
      }),
    );
  });

  /**
   * The context of the item (tracked).
   */
  readonly context = computed<DragItemContextValue>(() => {
    const { dragSourceListId, dropTargetListId } = this.listContext();
    return {
      dragItemId: this.id(),
      active: this.active(),
      dragListId: this.itemListId(),
      draggingInProgress: this.draggingInProgress(),
      dragSourceListId,
      dropTargetListId,
    };
  });

  private handleCount = 0;

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    // a native listener: a pointer down is not a reason for a change
    // detection
    const onPointerDown = (e: PointerEvent) => {
      if (this.handleCount) {
        // only the handles start a drag
        return;
      }
      this.startDrag(e);
    };
    element.addEventListener('pointerdown', onPointerDown);

    inject(DestroyRef).onDestroy(() => {
      element.removeEventListener('pointerdown', onPointerDown);
    });
  }

  /**
   * Starts a possible drag of the item (it starts on the first pointer
   * move) - what the item does on pointer down.
   */
  startDrag(e: PointerEvent) {
    untracked(this.listContext).onDragItemPointerDown(e);
  }

  /** @internal - for DragHandle */
  registerHandle(): VoidFunction {
    this.handleCount++;
    let registered = true;
    return () => {
      if (registered) {
        registered = false;
        this.handleCount--;
      }
    };
  }
}

/**
 * The drag handle of an item: with one, only the handle starts a drag of
 * the item.
 *
 * ```html
 * <div [infiniteDragItem]="id">
 *   <span infiniteDragHandle></span> {{ id }}
 * </div>
 * ```
 */
@Directive({
  selector: '[infiniteDragHandle]',
})
export class DragHandle {
  constructor() {
    const item = inject(DragItem);
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    const unregister = item.registerHandle();
    const onPointerDown = (e: PointerEvent) => item.startDrag(e);
    element.addEventListener('pointerdown', onPointerDown);

    inject(DestroyRef).onDestroy(() => {
      unregister();
      element.removeEventListener('pointerdown', onPointerDown);
    });
  }
}
