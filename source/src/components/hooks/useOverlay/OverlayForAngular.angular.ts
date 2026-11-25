/**
 * Angular sibling of the useOverlay hook (index.tsx) and of the Vue
 * composable (useOverlayForVue.vue.ts): positioned overlays (menus,
 * tooltips) shown next to an element or a point.
 *
 * All geometry/alignment logic is shared (overlayUtils.ts). This file owns
 * the Angular side:
 * - an overlay object holding a signal of handles (`createOverlay()` /
 *   `injectOverlay()`)
 * - the `ng-container[infiniteOverlayPortal]` directive, which renders the
 *   handles where it is placed (the grid puts it in its portal div) and,
 *   with a `portalContainer`, moves the rendered elements into that
 *   container. Only the DOM elements move: the views stay where the portal
 *   is in the component tree, so DI and change detection don't change
 *   (the Angular equivalent of React's createPortal / Vue's Teleport).
 */
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
  OnDestroy,
  Signal,
  ViewContainerRef,
  ViewEncapsulation,
  WritableSignal,
  afterNextRender,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  inputBinding,
  signal,
  untracked,
} from '@angular/core';

import { getChangeDetect } from '../../DataSource/privateHooks/getChangeDetect';
import { propToIdentifyMenu } from '../../Menu/propToIdentifyMenu';
import {
  InfiniteRender,
  isComponentRenderable,
} from '../../RawList/InfiniteRenderForAngular.angular';
import type { Renderable } from '../../types/FrameworkTypes.angular';
import type { SubscriptionCallback } from '../../types/SubscriptionCallback';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';

import {
  alignNode,
  isHTMLElement,
  retrieveElement,
  type ElementContainerGetter,
  type OverlayShowParams,
} from './overlayUtils';

export type { OverlayShowParams, ElementContainerGetter };

export type OverlayParams = {
  /**
   * Where the overlays are rendered:
   * - not specified: in a `position: fixed` wrapper, where the portal is
   * - `null` / `false`: where the portal is
   * - an element, a selector, a promise or a function returning one: in
   *   that element (a function is called again each time an overlay is
   *   shown)
   */
  portalContainer?: ElementContainerGetter | null | false;
  constrainTo?: OverlayShowParams['constrainTo'];
};

/**
 * What an overlay shows: a Renderable, or a function returning one (called
 * again when the overlay is updated).
 */
export type OverlayContent = Renderable | (() => Renderable);

export type UpdateOverlayContentFn = (
  content: OverlayContent,
  options?: { skipRealign?: boolean },
) => void;

export type ShowOverlayFn = (
  content: OverlayContent,
  params: OverlayShowParams,
) => UpdateOverlayContentFn;

/**
 * One shown overlay. Mutable: showing the same id again updates it in place.
 */
export type OverlayHandle = {
  readonly key: string;
  children: () => Renderable;
  /** bumped when the content changes */
  readonly version: WritableSignal<number>;
  /** realign after the next render of the content */
  realignAfterRender: boolean;

  constrainTo: OverlayShowParams['constrainTo'];
  alignPosition: OverlayShowParams['alignPosition'];
  alignTo: OverlayShowParams['alignTo'];

  realign: SubscriptionCallback<OverlayHandle>;
};

export type InfiniteOverlay = {
  /** shows an overlay (or updates the one with the same id) */
  showOverlay: ShowOverlayFn;
  hideOverlay: (id: string | number) => void;
  clearAll: () => void;
  /** renders the content of the overlays again */
  rerenderOverlays: () => void;
  /** the shown overlays, in the order they were first shown */
  readonly handles: Signal<readonly OverlayHandle[]>;
  readonly params: OverlayParams;
};

/**
 * Mirrors injectPortalContainerAndConstrainInMenuChild: when the overlay
 * content is a Menu, give it the portalContainer + constrainTo of the
 * overlay unless it has its own.
 */
function injectPortalContainerAndConstrainInMenuChild(
  children: Renderable,
  portalContainer: OverlayParams['portalContainer'],
  constrainTo: OverlayParams['constrainTo'],
): Renderable {
  if (
    isComponentRenderable(children) &&
    (children.component as any)?.[propToIdentifyMenu]
  ) {
    const inputs: Record<string, unknown> = { ...children.inputs };
    if (inputs.portalContainer === undefined) {
      inputs.portalContainer = portalContainer;
    }
    if (inputs.constrainTo === undefined) {
      inputs.constrainTo = constrainTo;
    }
    return { ...children, inputs };
  }
  return children;
}

function getIdForOnlyChild(content: OverlayContent) {
  if (isComponentRenderable(content)) {
    const id = content.inputs?.id;
    return id != null ? `${id}` : null;
  }
  return null;
}

/**
 * Creates an overlay: show content aligned to an element, a rectangle or a
 * point, and render it with an `infiniteOverlayPortal`:
 *
 * ```ts
 * readonly overlay = createOverlay({ portalContainer: 'body' });
 * show(target: HTMLElement) {
 *   this.overlay.showOverlay(() => this.tooltipTpl(), {
 *     alignTo: target,
 *     alignPosition: [['TopLeft', 'BottomLeft']],
 *   });
 * }
 * ```
 * ```html
 * <ng-container [infiniteOverlayPortal]="overlay" />
 * ```
 */
export function createOverlay(params: OverlayParams = {}): InfiniteOverlay {
  const rootParams = params;

  const handlesMap = new Map<string, OverlayHandle>();
  const handles = signal<readonly OverlayHandle[]>([]);
  const publish = () => handles.set([...handlesMap.values()]);

  const getChildrenFnForContent =
    (content: OverlayContent, constrainTo: OverlayParams['constrainTo']) =>
    (): Renderable => {
      const children =
        typeof content === 'function' && !isComponentClass(content)
          ? (content as () => Renderable)()
          : (content as Renderable);

      return injectPortalContainerAndConstrainInMenuChild(
        children,
        rootParams.portalContainer,
        constrainTo ?? rootParams.constrainTo,
      );
    };

  const showOverlay: ShowOverlayFn = (content, params) => {
    const id = params.id ?? getIdForOnlyChild(content) ?? getChangeDetect();
    const key = `${id}`;

    let handle = handlesMap.get(key);

    const updateOverlay: UpdateOverlayContentFn = (overlayContent, options) => {
      if (!handle || handlesMap.get(handle.key) !== handle) {
        return;
      }
      handle.children = getChildrenFnForContent(
        overlayContent,
        params.constrainTo,
      );
      // realign once the content has rendered again (React realigns in an
      // effect, Vue on nextTick)
      handle.realignAfterRender = !options?.skipRealign;
      handle.version.update((v) => v + 1);
    };

    if (handle) {
      handle.alignPosition = params.alignPosition;
      handle.alignTo = params.alignTo;
      handle.constrainTo = params.constrainTo;
      updateOverlay(content);
      return updateOverlay;
    }

    handle = {
      key,
      children: getChildrenFnForContent(content, params.constrainTo),
      version: signal(0),
      realignAfterRender: false,
      alignPosition: params.alignPosition,
      alignTo: params.alignTo,
      constrainTo: params.constrainTo,
      realign: buildSubscriptionCallback<OverlayHandle>(),
    };

    handlesMap.set(key, handle);
    publish();

    return updateOverlay;
  };

  const hideOverlay = (id: string | number) => {
    const key = `${id}`;
    if (handlesMap.has(key)) {
      handlesMap.delete(key);
      publish();
    }
  };

  const clearAll = () => {
    if (handlesMap.size) {
      handlesMap.clear();
      publish();
    }
  };

  const rerenderOverlays = () => {
    handlesMap.forEach((handle) => {
      handle.version.update((v) => v + 1);
    });
  };

  return {
    showOverlay,
    hideOverlay,
    clearAll,
    rerenderOverlays,
    handles: handles.asReadonly(),
    params: rootParams,
  };
}

/**
 * `createOverlay()` in an injection context: the overlays are cleared when
 * the component is destroyed. The Angular equivalent of React's and Vue's
 * `useOverlay`; render it with `<ng-container [infiniteOverlayPortal]="overlay" />`.
 */
export function injectOverlay(params: OverlayParams = {}): InfiniteOverlay {
  const overlay = createOverlay(params);
  inject(DestroyRef).onDestroy(() => overlay.clearAll());
  return overlay;
}

function isComponentClass(fn: unknown) {
  return typeof fn === 'function' && !!(fn as any).ɵcmp;
}

/**
 * One overlay: an absolutely positioned wrapper that aligns itself (shared
 * alignNode) after it first renders and whenever handle.realign fires.
 */
@Component({
  selector: 'div[infiniteOverlayContent]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [InfiniteRender],
  host: {
    style: 'position: absolute; top: 0px; left: 0px',
  },
  template: `<ng-container [infiniteRender]="children()" />`,
})
export class InfiniteOverlayContent {
  readonly handle = input.required<OverlayHandle>();

  private readonly node =
    inject<ElementRef<HTMLDivElement>>(ElementRef).nativeElement;

  protected readonly children = computed(() => {
    const handle = this.handle();
    handle.version();
    // the content function reads the (untracked) grid state: what it shows
    // is updated by showing the overlay again, as in React and Vue
    return untracked(() => handle.children());
  });

  constructor() {
    let removeOnRealign: VoidFunction | null = null;
    let wiredHandle: OverlayHandle | null = null;

    afterNextRender({
      write: () => {
        const handle = this.handle();
        alignNode(this.node, handle);
      },
    });

    afterRenderEffect({
      write: () => {
        const handle = this.handle();
        handle.version();
        untracked(() => {
          if (wiredHandle !== handle) {
            removeOnRealign?.();
            wiredHandle = handle;
            removeOnRealign = handle.realign.onChange((h) => {
              if (h) {
                alignNode(this.node, h);
              }
            });
          }
          if (handle.realignAfterRender) {
            handle.realignAfterRender = false;
            handle.realign(handle);
          }
        });
      },
    });

    inject(DestroyRef).onDestroy(() => {
      removeOnRealign?.();
    });
  }
}

/**
 * Renders the overlays of an overlay object (see `createOverlay()`) where
 * it is placed, or - with the overlay's `portalContainer` - inside that
 * container.
 */
@Directive({
  selector: 'ng-container[infiniteOverlayPortal]',
})
export class InfiniteOverlayPortal implements OnDestroy {
  readonly overlay = input.required<InfiniteOverlay>({
    alias: 'infiniteOverlayPortal',
  });

  private readonly vcr = inject(ViewContainerRef);
  private readonly anchor =
    inject<ElementRef<Comment>>(ElementRef).nativeElement;

  private readonly refs = new Map<
    string,
    ComponentRef<InfiniteOverlayContent>
  >();
  private fixedWrapper: HTMLDivElement | null = null;
  /** an async portalContainer, once resolved */
  private readonly resolvedContainer = signal<HTMLElement | null>(null);
  private resolvingFor: unknown = undefined;

  constructor() {
    effect(() => {
      const overlay = this.overlay();
      const handles = overlay.handles();
      const resolved = this.resolvedContainer();
      untracked(() => this.sync(overlay, handles, resolved));
    });
  }

  ngOnDestroy() {
    this.vcr.clear();
    this.refs.clear();
    this.fixedWrapper?.remove();
    this.fixedWrapper = null;
  }

  /**
   * The element the overlay elements go into, or null to leave them where
   * the portal is.
   */
  private getTarget(
    overlay: InfiniteOverlay,
    resolved: HTMLElement | null,
  ): HTMLElement | null {
    const { portalContainer } = overlay.params;

    if (portalContainer === null || portalContainer === false) {
      return null;
    }

    if (portalContainer === undefined) {
      // default: a fixed wrapper (DefaultOverlayPortal in React)
      if (!this.fixedWrapper) {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.top = '0px';
        wrapper.style.left = '0px';
        this.anchor.parentNode?.insertBefore(wrapper, this.anchor);
        this.fixedWrapper = wrapper;
      }
      return this.fixedWrapper;
    }

    // a function container is read again each time (the element may not
    // have been there when first resolved)
    const current =
      typeof portalContainer === 'function' ? portalContainer() : null;
    if (isHTMLElement(current)) {
      return current;
    }
    if (isHTMLElement(portalContainer)) {
      return portalContainer;
    }
    if (this.resolvingFor !== portalContainer) {
      this.resolvingFor = portalContainer;
      retrieveElement(portalContainer).then((container) => {
        if (container != null && this.resolvingFor === portalContainer) {
          this.resolvedContainer.set(container);
        }
      });
    }
    return resolved;
  }

  private sync(
    overlay: InfiniteOverlay,
    handles: readonly OverlayHandle[],
    resolved: HTMLElement | null,
  ) {
    const keys = new Set<string>();
    for (const handle of handles) {
      keys.add(handle.key);
    }
    for (const [key, ref] of this.refs) {
      if (
        !keys.has(key) ||
        ref.instance.handle() !== handles.find((h) => h.key === key)
      ) {
        // destroy() removes the element from wherever it was moved to
        ref.destroy();
        this.refs.delete(key);
      }
    }

    if (!handles.length) {
      return;
    }

    const target = this.getTarget(overlay, resolved);

    for (const handle of handles) {
      let ref = this.refs.get(handle.key);
      if (!ref) {
        // always appended: views inserted before a moved element would be
        // inserted relative to it
        ref = this.vcr.createComponent(InfiniteOverlayContent, {
          bindings: [inputBinding('handle', () => handle)],
        });
        this.refs.set(handle.key, ref);
      }
      const element = ref.location.nativeElement as HTMLElement;
      if (target && element.parentNode !== target) {
        target.appendChild(element);
      }
    }
  }
}
