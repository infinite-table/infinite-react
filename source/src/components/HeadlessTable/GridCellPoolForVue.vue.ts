import { h } from 'vue';
import type { VNode } from 'vue';

import { RenderSlot } from '../RawList/RenderSlot.vue';
import { Renderable } from '../types/Renderable';
import { SubscriptionCallback } from '../types/SubscriptionCallback';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import { ElementRefCallback } from '../types/DOMTypes';
import { GridCellInterface } from './GridCellInterface';
import { GridCellPoolBase } from './GridCellPoolBase';

const CELL_COUNT_BY_DEBUG_ID = new Map<string, number>();
const emptyFn = () => {};

class GridCellForVue<T_ADDITIONAL_CELL_INFO = any>
  implements GridCellInterface<T_ADDITIONAL_CELL_INFO>
{
  public debugId: string;

  private cellInfo?: T_ADDITIONAL_CELL_INFO;

  private element: HTMLElement | null = null;
  private updater: SubscriptionCallback<Renderable>;

  private node: VNode | null;

  public ref: ElementRefCallback;

  private mounted: boolean = false;

  private pendingAfterCommitWork: (() => void) | null = null;

  private mountSubscription =
    buildSubscriptionCallback<GridCellInterface<T_ADDITIONAL_CELL_INFO>>();

  constructor(debugId: string, cellInfo?: T_ADDITIONAL_CELL_INFO) {
    const count = CELL_COUNT_BY_DEBUG_ID.get(debugId) ?? 0;
    const key = `${debugId}:GridCellVue:${count}`;
    CELL_COUNT_BY_DEBUG_ID.set(debugId, count + 1);

    this.debugId = key;
    this.cellInfo = cellInfo;

    this.updater = buildSubscriptionCallback<Renderable>();

    // Created once, like the React cell's <AvoidReactDiff /> element.
    // When the parent slot re-renders with an already-mounted vnode, Vue's
    // normalizeVNode clones it (cloneIfMounted), and the stable key ensures
    // it's patched — never remounted.
    this.node = h(RenderSlot, {
      key,
      name: key,
      updater: this.updater,
      afterCommit: this.afterCommit,
    });

    this.ref = (htmlElement) => {
      this.element = htmlElement;
      if (htmlElement) {
        this.mounted = true;
        this.mountSubscription(this);
      } else {
        this.mounted = false;
      }
    };
  }

  setPendingAfterCommitWork(fn: (() => void) | null) {
    this.pendingAfterCommitWork = fn;
  }

  private afterCommit = () => {
    if (this.pendingAfterCommitWork) {
      const work = this.pendingAfterCommitWork;
      this.pendingAfterCommitWork = null;
      work();
    }
  };

  isMounted() {
    return this.mounted;
  }

  onMount(callback: (cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>) => void) {
    const off = this.mountSubscription.onChange((cell) => {
      if (cell != null) {
        callback(cell);
      }
    });

    return off;
  }

  destroy() {
    this.mountSubscription.destroy();
    this.updater.destroy();

    this.pendingAfterCommitWork = null;
    this.ref = emptyFn;
    this.element = null;
    this.node = null;
  }

  getNode() {
    return this.node as unknown as Renderable;
  }

  update(content: Renderable, additionalInfo?: T_ADDITIONAL_CELL_INFO): void {
    this.updater(content);
    this.cellInfo = additionalInfo;
  }

  getAdditionalInfo(): T_ADDITIONAL_CELL_INFO | undefined {
    return this.cellInfo;
  }

  getElement() {
    return this.element;
  }
}

/**
 * Vue cell pool: all pool mechanics live in GridCellPoolBase; this class
 * only knows how to create Vue cells (a RenderSlot vnode).
 */
export class GridCellPoolForVue<
  T_ADDITIONAL_CELL_INFO,
> extends GridCellPoolBase<T_ADDITIONAL_CELL_INFO> {
  constructor(private cellDebugId: string) {
    super(`${cellDebugId}:GridCellPoolForVue`);
  }

  protected createCellInstance(): GridCellInterface<T_ADDITIONAL_CELL_INFO> {
    return new GridCellForVue<T_ADDITIONAL_CELL_INFO>(this.cellDebugId);
  }
}
