import { Logger } from '../../utils/debugLoggers';

import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import { ListRowInterface, ListRowPool } from './ListRowInterface';

/**
 * Framework-neutral implementation of the (detail) row pool.
 *
 * Same attach/detach pooling mechanics as GridCellPoolBase, for master-detail
 * rows. Subclasses only implement {@link createRowInstance} — the framework
 * render slot wiring.
 */
export abstract class ListRowPoolBase extends Logger implements ListRowPool {
  private rowRemoveSubscription = buildSubscriptionCallback<ListRowInterface>();

  private rowAttachmentChangeSubscription = buildSubscriptionCallback<{
    row: ListRowInterface;
    attached: boolean;
  }>();

  /**
   * An attached row is a row that currently renders a corresponding
   * index position in the list
   */
  private attachedRows: Set<ListRowInterface>;

  /**
   * A detached row is a row that is not currently rendering a DataGrid Master-detail row
   * and does not have an associated position in the list
   * but rather it simply waits in the pool, so it can be used if needed.
   *
   * However, its node (the framework render slot) is included in the render
   * tree, but that element is not actually rendering a DIV element,
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
  static POOL_SIZE_INCREMENT = 1;

  constructor(debugId: string) {
    super(debugId);

    this.attachedRows = new Set<ListRowInterface>();
    this.detachedRows = new Set<ListRowInterface>();
    this.allRowsOrdered = new Set<ListRowInterface>();
  }

  /**
   * The single framework-specific hook: build a new (detached) row instance.
   */
  protected abstract createRowInstance(): ListRowInterface;

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

  onRowAttachmentChange(
    callback: (row: ListRowInterface, attached: boolean) => void,
  ) {
    const off = this.rowAttachmentChangeSubscription.onChange((res) => {
      if (res == null) {
        return;
      }
      const { row, attached } = res;
      callback(row, attached);
    });

    return off;
  }

  public reset() {
    this.attachedRows.clear();
    this.detachedRows.clear();

    this.allRowsOrdered.clear();
    this.rowRemoveSubscription.destroy();
    this.rowAttachmentChangeSubscription.destroy();
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
   * This should be the only place where we create a new row.
   */
  private createRow(): ListRowInterface {
    const row = this.createRowInstance();

    //the row is detached when created
    this.detachedRows.add(row);
    this.allRowsOrdered.add(row);

    return row;
  }

  /**
   * This really removes the row, not only makes it detached,
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
    if (row && this.attachedRows.has(row)) {
      return row;
    }

    if (!row) {
      row = this.getDetachedRow();
    }

    this.detachedRows.delete(row);
    this.attachedRows.add(row);

    this.rowAttachmentChangeSubscription({
      row,
      attached: true,
    });

    return row;
  }

  detachRow(row: ListRowInterface) {
    if (this.detachedRows.has(row)) {
      return false;
    }

    this.attachedRows.delete(row);
    this.detachedRows.add(row);

    this.rowAttachmentChangeSubscription({
      row,
      attached: false,
    });

    return true;
  }

  /**
   * This gets a detached row from the pool.
   * If no detached row is available, it will create a new one and return that.
   */
  getDetachedRow(): ListRowInterface {
    const { detachedRows } = this;

    let row = detachedRows.values().next().value;

    if (!row) {
      this.poolSize += ListRowPoolBase.POOL_SIZE_INCREMENT;
    }

    row = detachedRows.values().next().value;

    if (!row) {
      this.error('No rows available in the pool!');
    }

    return row as ListRowInterface;
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
      Math.ceil(value / ListRowPoolBase.POOL_SIZE_INCREMENT) *
      ListRowPoolBase.POOL_SIZE_INCREMENT;

    const currentSize = this.poolSize;

    if (value === currentSize) {
      return;
    }

    const { detachedRows } = this;

    let diff = currentSize - value;

    if (diff > 0) {
      // need to destroy some rows,
      // as there are too many available in the pool
      if (diff > detachedRows.size) {
        diff = detachedRows.size;
        this.debug('Trying to destroy more rows than are currently detached!');
      }

      const iterator = detachedRows.values();
      while (diff > 0) {
        const row = iterator.next().value as ListRowInterface;

        this.removeRow(row);

        diff--;
      }
    } else {
      diff = -diff;
      // need to create some rows,
      // as there are too few available in the pool
      while (diff > 0) {
        this.createRow();

        diff--;
      }
    }
  }
}
