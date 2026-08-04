import { h } from 'vue';
import type { VNode } from 'vue';

import { RenderSlot } from '../RawList/RenderSlot.vue';
import { Renderable } from '../types/Renderable';
import { SubscriptionCallback } from '../types/SubscriptionCallback';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import { ElementRefCallback } from '../types/DOMTypes';
import { ListRowInterface } from './ListRowInterface';
import { ListRowPoolBase } from './ListRowPoolBase';

const ROW_COUNT_BY_DEBUG_ID = new Map<string, number>();
const emptyFn = () => {};

class ListRowForVue implements ListRowInterface {
  public debugId: string;

  private element: HTMLElement | null = null;
  private updater: SubscriptionCallback<Renderable>;
  private node: VNode | null;
  public ref: ElementRefCallback;

  private mounted: boolean = false;

  private mountSubscription = buildSubscriptionCallback<ListRowInterface>();

  constructor(debugId: string) {
    const count = ROW_COUNT_BY_DEBUG_ID.get(debugId) ?? 0;
    const key = `${debugId}:ListRowVue:${count}`;
    ROW_COUNT_BY_DEBUG_ID.set(debugId, count + 1);

    this.debugId = key;

    this.updater = buildSubscriptionCallback<Renderable>();
    this.node = h(RenderSlot, {
      key: `detail-row-${key}`,
      name: `detail-row-${key}`,
      updater: this.updater,
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

  isMounted() {
    return this.mounted;
  }

  onMount(callback: (row: ListRowInterface) => void) {
    const off = this.mountSubscription.onChange((row) => {
      if (row != null) {
        callback(row);
      }
    });

    return off;
  }

  destroy() {
    this.mountSubscription.destroy();
    this.updater.destroy();
    this.ref = emptyFn;
    this.element = null;
    this.node = null;
  }

  getNode() {
    return this.node as unknown as Renderable;
  }

  update(content: Renderable): void {
    this.updater(content);
  }

  getElement() {
    return this.element;
  }
}

/**
 * Vue row pool: all pool mechanics live in ListRowPoolBase; this class
 * only knows how to create Vue rows (a RenderSlot vnode).
 */
export class ListRowPoolForVue extends ListRowPoolBase {
  constructor(private rowDebugId: string) {
    super(`${rowDebugId}:ListRowPoolForVue`);
  }

  protected createRowInstance(): ListRowInterface {
    return new ListRowForVue(this.rowDebugId);
  }
}
