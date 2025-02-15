import { Logger } from '../../utils/debug';

import * as React from 'react';
import { AvoidReactDiff } from '../RawList/AvoidReactDiff';
import { Renderable } from '../types/Renderable';
import { SubscriptionCallback } from '../types/SubscriptionCallback';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import { ListRowInterface } from './ListRowInterface';

const ROW_COUNT_BY_DEBUG_ID = new Map<string, number>();
const emptyFn = () => {};

class ListRowForReact implements ListRowInterface {
  public debugId: string;

  private element: HTMLElement | null = null;
  private updater: SubscriptionCallback<Renderable>;
  private node: React.ReactNode;
  public ref: React.RefCallback<HTMLElement>;

  private mountSubscription = buildSubscriptionCallback<ListRowInterface>();

  constructor(debugId: string) {
    const count = ROW_COUNT_BY_DEBUG_ID.get(debugId) ?? 0;
    const key = `${debugId}:ListRowReact:${count}`;
    ROW_COUNT_BY_DEBUG_ID.set(debugId, count + 1);

    this.debugId = key;

    this.updater = buildSubscriptionCallback<Renderable>();
    this.node = (
      <AvoidReactDiff
        key={`detail-row-${key}`}
        name={`detail-row-${key}`}
        updater={this.updater}
      />
    );

    this.ref = (htmlElement) => {
      this.element = htmlElement;
      if (htmlElement) {
        this.mountSubscription(this);
      }
    };
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
    return this.node;
  }

  update(content: Renderable): void {
    this.updater(content);
  }

  getElement() {
    return this.element;
  }
}
/**
 * This is an abstraction for a collection of cells.
 *
 * Some are attached while some are detached. The attached ones will have a corresponding x,y
 * position in the actual rendering of the table.
 *
 * However, this pool is not aware of the position of a cell, but only
 * of its attached/detached status.
 *
 */
export class ListRowPoolForReact extends Logger {
  private rowRemoveSubscription = buildSubscriptionCallback<ListRowInterface>();

  /**
   * An attached row is a row that currently renders a corresponding
   * index position in the list
   */
  private attachedRows: Set<ListRowInterface>;

  /**
   * A detached row is a row that is not currently rendering a DataGrid Master-detail row
   * and does not have an associated  position in the list
   * but rather it simply waits in the pool, so it can be used if needed.
   *
   * However, its node (<AvoidReactDiff />) is included in the render
   * tree, but that jsx element is not actually rendering a DIV element,
   * but rather renders a `null` value.
   */

  private detachedRows: Set<ListRowInterface>;

  /**
   * We want to have this set as well because as we want to keep the order of the rows
   * no matter if they are attached or detached.
   *
   * This is because all rows are included in the render tree,
   * and we want to keep the same order of rows in the render tree
   * no matter if they go attached or detached at any point in time.
   */
  private allRowsOrdered: Set<ListRowInterface>;

  // we'll grow the pool by this amount at a time
  static POOL_SIZE_INCREMENT = 5;

  constructor(private debugId: string) {
    super(`${debugId}:ListRowPoolForReact`);

    this.attachedRows = new Set<ListRowInterface>();
    this.detachedRows = new Set<ListRowInterface>();
    this.allRowsOrdered = new Set<ListRowInterface>();
  }

  public destroy() {
    this.reset();
  }

  onRemoveRow(callback: (row: ListRowInterface) => void) {
    const off = this.rowRemoveSubscription.onChange((row) => {
      if (row != null) {
        callback(row);
      }
    });
    return off;
  }

  public reset() {
    this.attachedRows.clear();
    this.detachedRows.clear();

    this.allRowsOrdered.clear();
    this.rowRemoveSubscription.destroy();
  }

  getAttachedRows() {
    return this.attachedRows;
  }

  getDetachedRows() {
    return this.detachedRows;
  }

  getAllRows() {
    return this.allRowsOrdered;
  }

  /**
   * This should be the only place where we create a new cell.
   */
  private createRow(): ListRowInterface {
    const row = new ListRowForReact(this.debugId);

    //the cell is detached when created
    this.detachedRows.add(row);
    this.allRowsOrdered.add(row);

    return row;
  }

  /**
   * This really removes the cell, not only makes it detached,
   * but removes it from the render tree and from the pool.
   */
  private removeRow(row: ListRowInterface) {
    if (__DEV__) {
      if (!this.detachedRows.has(row)) {
        this.error(
          `You want to remove the row, but it's not in the detached rows set!`,
        );
      }
    }

    this.detachedRows.delete(row);
    this.attachedRows.delete(row);
    this.allRowsOrdered.delete(row);

    row.destroy();

    this.rowRemoveSubscription(row);
  }

  /**
   * This attaches a row to the list.
   * If no row is provided, it will get a detached one from the pool
   * and move that row to the attached set.
   * If a row is provided, it's moved to the attached set as well.
   */
  attachRow(row?: ListRowInterface) {
    if (!row) {
      row = this.getDetachedRow();
    }

    this.detachedRows.delete(row);
    this.attachedRows.add(row);

    return row;
  }

  detachRow(row: ListRowInterface) {
    this.attachedRows.delete(row);
    this.detachedRows.add(row);
  }

  /**
   * This gets a detached row from the pool.
   * If no detached row is available, it will create a new one and return that.
   */
  getDetachedRow(): ListRowInterface {
    const { detachedRows } = this;

    let row = detachedRows.values().next().value;

    if (!row) {
      this.poolSize += ListRowPoolForReact.POOL_SIZE_INCREMENT;
    }

    row = detachedRows.values().next().value;

    if (!row) {
      this.error('No rows available in the pool!');
    }

    return row;
  }

  get attachedSize() {
    return this.attachedRows.size;
  }

  get detachedSize() {
    return this.detachedRows.size;
  }

  get poolSize() {
    return this.allRowsOrdered.size;
  }

  set poolSize(value: number) {
    value =
      Math.ceil(value / ListRowPoolForReact.POOL_SIZE_INCREMENT) *
      ListRowPoolForReact.POOL_SIZE_INCREMENT;

    const currentSize = this.poolSize;

    if (value === currentSize) {
      return;
    }

    const { detachedRows } = this;

    let diff = currentSize - value;

    if (diff > 0) {
      // need to destroy some cells,
      // as there are too many available in the pool
      if (diff > detachedRows.size) {
        diff = detachedRows.size;
        this.debug('Trying to destroy more rows than are currently detached!');
      }

      const iterator = detachedRows.values();
      while (diff > 0) {
        const row = iterator.next().value as ListRowForReact;

        this.removeRow(row);

        diff--;
      }
    } else {
      diff = -diff;
      // need to create some cells,
      // as there are too few available in the pool
      while (diff > 0) {
        this.createRow();

        diff--;
      }
    }
  }
}
