import {
  ComponentRef,
  InjectionToken,
  Injector,
  Signal,
  Type,
  ViewContainerRef,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';

import type { Renderable } from '../types/Renderable';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import { ElementRefCallback } from '../types/DOMTypes';
import { GridCellInterface } from './GridCellInterface';
import { GridCellPoolBase } from './GridCellPoolBase';
import { ListRowInterface } from './ListRowInterface';
import { ListRowPoolBase } from './ListRowPoolBase';

/**
 * How the Angular grid renders its cells and detail rows.
 *
 * The shared GridRenderer owns the cell pool and positions every cell
 * element itself (transform, z-index, hover and detached class names). The
 * framework only has to put content into a cell element - for Angular, each
 * pooled cell owns one `ComponentRef`, created through the `ViewContainerRef`
 * of the `RawTable` directive. When the renderer recycles a cell for another
 * row/column, the same component instance gets new props: views are never
 * destroyed while scrolling.
 *
 * `renderCell()` returns a PooledRenderable (`renderPooled(Cmp, props)`). The
 * component reads its props through `injectPooledProps()` - a writable signal
 * owned by the pooled cell. Writing a signal (rather than `setInput()`) keeps
 * the rest of the application out of the scroll path: only the cell's own
 * view is marked for refresh. At the end of every `renderRange()` the
 * renderer calls `onRender()`, and the RawTable directive commits the cells
 * that got new props with a synchronous `detectChanges()`, so content and
 * position land in the same task.
 */

/**
 * What `renderCell()` / `renderDetailRow()` return in the Angular build.
 */
export interface PooledRenderable<P = unknown> {
  readonly kind: 'pooled';
  /**
   * The component created for the cell. A cell recycled for content with
   * another component (eg a header cell vs a header group cell) recreates
   * its view.
   */
  readonly component: Type<unknown>;
  /**
   * Host directives applied to the component (`createComponent({ directives })`).
   */
  readonly directives?: readonly Type<unknown>[];
  readonly props: P;
}

export function renderPooled<P>(
  component: Type<unknown>,
  props: P,
  directives?: readonly Type<unknown>[],
): PooledRenderable<P> {
  return { kind: 'pooled', component, directives, props };
}

export function isPooledRenderable(value: unknown): value is PooledRenderable {
  return (
    value != null &&
    typeof value === 'object' &&
    (value as PooledRenderable).kind === 'pooled'
  );
}

type PooledPropsSink<P> = {
  readonly props: WritableSignal<P | null>;
};

const INFINITE_POOLED_PROPS = new InjectionToken<PooledPropsSink<any>>(
  'INFINITE_POOLED_PROPS',
);

/**
 * In a component (or a directive on it) created by a cell/row pool: the
 * props of the latest `renderPooled()` call for that cell.
 */
export function injectPooledProps<P>(): Signal<P | null> {
  return inject<PooledPropsSink<P>>(INFINITE_POOLED_PROPS).props.asReadonly();
}

export type PoolHost = {
  vcr: ViewContainerRef;
  injector: Injector;
};

/**
 * The views of one renderer (its cells and detail rows): where they are
 * created and which of them need to be committed.
 */
export class PooledViewHost {
  private host: PoolHost | null = null;
  private views = new Set<PooledView>();
  private dirty = new Set<PooledView>();
  private destroyed = false;

  constructor(public readonly debugId: string) {}

  /**
   * Called by the RawTable directive. Binding to another container (the
   * previous one was destroyed with its view) makes every view be
   * recreated on its next update.
   */
  bind(host: PoolHost) {
    if (this.host && this.host.vcr === host.vcr) {
      return;
    }
    this.host = host;
    this.views.forEach((view) => view.forgetView());
  }

  /**
   * The RawTable stops using this renderer (another renderer replaced it, eg
   * when wrapRowsHorizontally changes, or the RawTable is destroyed): its
   * views are removed from the container. Only forgetting them would leave
   * them in the DOM next to the new renderer's views, and the renderer's own
   * destroy, which may run later, would find nothing to destroy.
   */
  unbind(vcr: ViewContainerRef) {
    if (this.host?.vcr !== vcr) {
      return;
    }
    this.host = null;
    this.views.forEach((view) => view.releaseView());
  }

  getHost(): PoolHost | null {
    return this.host;
  }

  register(view: PooledView) {
    this.views.add(view);
  }

  unregister(view: PooledView) {
    this.views.delete(view);
    this.dirty.delete(view);
  }

  markDirty(view: PooledView) {
    this.dirty.add(view);
  }

  isDirty(view: PooledView) {
    return this.dirty.has(view);
  }

  /**
   * Synchronously renders the views that got new props since the last
   * commit, then runs the work that waited for that (positioning, in the
   * horizontal layout).
   */
  commit = () => {
    if (this.destroyed || !this.dirty.size) {
      return;
    }
    const dirty = Array.from(this.dirty);
    this.dirty.clear();

    for (let i = 0; i < dirty.length; i++) {
      dirty[i].detectChanges();
    }
    for (let i = 0; i < dirty.length; i++) {
      dirty[i].flushPendingAfterCommitWork();
    }
  };

  destroy() {
    this.destroyed = true;
    this.host = null;
    this.views.forEach((view) => view.releaseView());
    this.views.clear();
    this.dirty.clear();
  }
}

const VIEW_COUNT_BY_DEBUG_ID = new Map<string, number>();

abstract class PooledView {
  public debugId: string;

  private componentRef: ComponentRef<unknown> | null = null;
  private componentType: Type<unknown> | null = null;
  private directives: readonly Type<unknown>[] | undefined;

  private sink: PooledPropsSink<unknown> = {
    props: signal<unknown>(null),
  };

  protected element: HTMLElement | null = null;
  private mounted = false;
  private pendingAfterCommitWork: (() => void) | null = null;

  protected mountSubscription = buildSubscriptionCallback<any>();

  public ref: ElementRefCallback;

  constructor(
    debugIdPrefix: string,
    kind: string,
    protected viewHost: PooledViewHost,
  ) {
    const count = VIEW_COUNT_BY_DEBUG_ID.get(debugIdPrefix) ?? 0;
    VIEW_COUNT_BY_DEBUG_ID.set(debugIdPrefix, count + 1);
    this.debugId = `${debugIdPrefix}:${kind}:${count}`;

    viewHost.register(this);

    // the pool sets the element itself (the host element of the component it
    // creates) - a component that also calls the domRef it gets passes the
    // same element, which is a no-op
    this.ref = (element) => this.setElement(element);
  }

  private setElement(element: HTMLElement | null) {
    if (element === this.element) {
      return;
    }
    this.element = element;
    this.mounted = !!element;
    if (element) {
      this.mountSubscription(this);
    }
  }

  protected updateContent(content: Renderable) {
    if (!content) {
      // the renderer detaches the cell; its view stays, hidden by the
      // detached class names, so it can be reused
      return;
    }
    if (!isPooledRenderable(content)) {
      if (__DEV__) {
        console.error(
          `[${this.debugId}] the Angular grid renders cells with renderPooled(), got`,
          content,
        );
      }
      return;
    }

    const host = this.viewHost.getHost();
    if (!host) {
      if (__DEV__) {
        console.error(
          `[${this.debugId}] cell updated before the renderer was bound to a view container`,
        );
      }
      return;
    }

    if (
      !this.componentRef ||
      this.componentType !== content.component ||
      !sameDirectives(this.directives, content.directives)
    ) {
      this.createView(host, content);
    }

    this.sink.props.set(content.props);
    this.viewHost.markDirty(this);
  }

  private createView(host: PoolHost, content: PooledRenderable) {
    const { vcr, injector } = host;

    let index: number | undefined;
    if (this.componentRef) {
      const currentIndex = vcr.indexOf(this.componentRef.hostView);
      index = currentIndex >= 0 ? currentIndex : undefined;
      this.destroyView();
    }

    const elementInjector = Injector.create({
      providers: [{ provide: INFINITE_POOLED_PROPS, useValue: this.sink }],
      parent: injector,
    });

    this.componentRef = vcr.createComponent(content.component, {
      index,
      injector: elementInjector,
      directives: content.directives as Type<unknown>[] | undefined,
    });
    this.componentType = content.component;
    this.directives = content.directives;

    this.setElement(this.componentRef.location.nativeElement as HTMLElement);
  }

  private destroyView() {
    const ref = this.componentRef;
    this.componentRef = null;
    this.componentType = null;
    this.directives = undefined;
    if (ref && !ref.hostView.destroyed) {
      ref.destroy();
    }
    this.setElement(null);
  }

  /**
   * Removes the view from its container (a view that is already destroyed,
   * with its container, is left alone); it is recreated on the next update.
   */
  releaseView() {
    this.destroyView();
  }

  /**
   * The container of the view was destroyed (or replaced): the view is gone
   * and will be recreated on the next update.
   */
  forgetView() {
    this.componentRef = null;
    this.componentType = null;
    this.directives = undefined;
    this.setElement(null);
  }

  detectChanges() {
    const ref = this.componentRef;
    if (ref && !ref.hostView.destroyed) {
      ref.changeDetectorRef.detectChanges();
    }
  }

  setPendingAfterCommitWork(fn: (() => void) | null) {
    this.pendingAfterCommitWork = fn;
    // the content of this cell is already committed: nothing to wait for
    if (fn && !this.viewHost.isDirty(this)) {
      this.flushPendingAfterCommitWork();
    }
  }

  flushPendingAfterCommitWork() {
    if (this.pendingAfterCommitWork) {
      const work = this.pendingAfterCommitWork;
      this.pendingAfterCommitWork = null;
      work();
    }
  }

  isMounted() {
    return this.mounted;
  }

  getElement() {
    return this.element;
  }

  getNode(): Renderable {
    // the renderer collects the nodes of all cells for onRender(); in
    // Angular the views are created by the pool, so this is only a handle
    return this as unknown as Renderable;
  }

  destroy() {
    this.viewHost.unregister(this);
    this.mountSubscription.destroy();
    this.pendingAfterCommitWork = null;
    this.destroyView();
    this.ref = () => {};
  }
}

function sameDirectives(
  a: readonly Type<unknown>[] | undefined,
  b: readonly Type<unknown>[] | undefined,
) {
  if (a === b) {
    return true;
  }
  const lenA = a?.length ?? 0;
  const lenB = b?.length ?? 0;
  if (lenA !== lenB) {
    return false;
  }
  for (let i = 0; i < lenA; i++) {
    if (a![i] !== b![i]) {
      return false;
    }
  }
  return true;
}

class GridCellForAngular<T_ADDITIONAL_CELL_INFO = any>
  extends PooledView
  implements GridCellInterface<T_ADDITIONAL_CELL_INFO>
{
  private cellInfo?: T_ADDITIONAL_CELL_INFO;

  constructor(debugId: string, viewHost: PooledViewHost) {
    super(debugId, 'GridCellAngular', viewHost);
  }

  onMount(callback: (cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>) => void) {
    return this.mountSubscription.onChange((cell) => {
      if (cell != null) {
        callback(cell);
      }
    });
  }

  update(content: Renderable, additionalInfo?: T_ADDITIONAL_CELL_INFO): void {
    this.cellInfo = additionalInfo;
    this.updateContent(content);
  }

  getAdditionalInfo(): T_ADDITIONAL_CELL_INFO | undefined {
    return this.cellInfo;
  }
}

class ListRowForAngular extends PooledView implements ListRowInterface {
  constructor(debugId: string, viewHost: PooledViewHost) {
    super(debugId, 'ListRowAngular', viewHost);
  }

  onMount(callback: (row: ListRowInterface) => void) {
    return this.mountSubscription.onChange((row) => {
      if (row != null) {
        callback(row);
      }
    });
  }

  update(content: Renderable): void {
    this.updateContent(content);
  }
}

/**
 * Angular cell pool: all pool mechanics live in GridCellPoolBase; this class
 * only knows how to create Angular cells.
 */
export class GridCellPoolForAngular<
  T_ADDITIONAL_CELL_INFO,
> extends GridCellPoolBase<T_ADDITIONAL_CELL_INFO> {
  constructor(private cellDebugId: string, private viewHost: PooledViewHost) {
    super(`${cellDebugId}:GridCellPoolForAngular`);
  }

  protected createCellInstance(): GridCellInterface<T_ADDITIONAL_CELL_INFO> {
    return new GridCellForAngular<T_ADDITIONAL_CELL_INFO>(
      this.cellDebugId,
      this.viewHost,
    );
  }
}

export class ListRowPoolForAngular extends ListRowPoolBase {
  constructor(private rowDebugId: string, private viewHost: PooledViewHost) {
    super(`${rowDebugId}:ListRowPoolForAngular`);
  }

  protected createRowInstance(): ListRowInterface {
    return new ListRowForAngular(this.rowDebugId, this.viewHost);
  }
}
