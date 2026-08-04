import { Logger } from '../../utils/debugLoggers';

import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import { GridCellInterface, GridCellPool } from './GridCellInterface';

/**
 * Framework-neutral implementation of the cell pool.
 *
 * This is an abstraction for a collection of cells.
 *
 * Some are attached while some are detached. The attached ones will have a corresponding x,y
 * position in the actual rendering of the table.
 *
 * However, this pool is not aware of the position of a cell, but only
 * of its attached/detached status.
 *
 * The only framework-specific part is how a cell is created (the cell wraps a
 * framework render slot: `<AvoidReactDiff />` for React, `RenderSlot` for Vue, ...),
 * so subclasses only implement {@link createCellInstance}.
 */
export abstract class GridCellPoolBase<T_ADDITIONAL_CELL_INFO>
  extends Logger
  implements GridCellPool<T_ADDITIONAL_CELL_INFO>
{
  private cellRemoveSubscription =
    buildSubscriptionCallback<GridCellInterface<T_ADDITIONAL_CELL_INFO>>();

  private cellAttachmentChangeSubscription = buildSubscriptionCallback<{
    cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>;
    attached: boolean;
  }>();

  /**
   * An attached cell is a cell that currently renders a corresponding
   * x,y position in the table
   */
  private attachedCells: Set<GridCellInterface<T_ADDITIONAL_CELL_INFO>>;

  /**
   * A detached cell is a cell that is not currently rendering a DataGrid cell
   * and does not have an associated x,y position in the table
   * but rather it simply waits in the pool, so it can be used if needed.
   *
   * However, its node (the framework render slot) is included in the render
   * tree, but that element is not actually rendering a DIV element,
   * but rather renders a `null` value.
   */

  private detachedCells: Set<GridCellInterface<T_ADDITIONAL_CELL_INFO>>;

  /**
   * We want to have this set as well because as we want to keep the order of the cells
   * no matter if they are attached or detached.
   *
   * This is because all cells are included in the render tree,
   * and we want to keep the same order of cells in the render tree
   * no matter if they go attached or detached at any point in time.
   */
  private allCellsOrdered: Set<GridCellInterface<T_ADDITIONAL_CELL_INFO>>;

  // we'll grow the pool by this amount at a time
  static POOL_SIZE_INCREMENT = 1; // for now, making this larger will create the cells, but on fast scrolling, those extra cells can tend to lag behind the scroll position as they are not updated

  constructor(debugId: string) {
    super(debugId);

    this.attachedCells = new Set<GridCellInterface<T_ADDITIONAL_CELL_INFO>>();
    this.detachedCells = new Set<GridCellInterface<T_ADDITIONAL_CELL_INFO>>();
    this.allCellsOrdered = new Set<GridCellInterface<T_ADDITIONAL_CELL_INFO>>();
  }

  /**
   * The single framework-specific hook: build a new (detached) cell instance.
   */
  protected abstract createCellInstance(): GridCellInterface<T_ADDITIONAL_CELL_INFO>;

  public destroy() {
    this.reset();
  }

  onRemoveCell(
    callback: (cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>) => void,
  ) {
    const off = this.cellRemoveSubscription.onChange((cell) => {
      if (cell != null) {
        callback(cell);
      }
    });
    return off;
  }

  onCellAttachmentChange(
    callback: (
      cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>,
      attached: boolean,
    ) => void,
  ) {
    const off = this.cellAttachmentChangeSubscription.onChange((res) => {
      if (res == null) {
        return;
      }
      const { cell, attached } = res;
      callback(cell, attached);
    });

    return off;
  }

  public reset() {
    this.attachedCells.clear();
    this.detachedCells.clear();

    this.allCellsOrdered.clear();
    this.cellRemoveSubscription.destroy();
    this.cellAttachmentChangeSubscription.destroy();
  }

  getAttachedCells() {
    return this.attachedCells;
  }

  getDetachedCells() {
    return this.detachedCells;
  }

  getAllCells() {
    return this.allCellsOrdered;
  }

  /**
   * This should be the only place where we create a new cell.
   */
  private createCell(): GridCellInterface<T_ADDITIONAL_CELL_INFO> {
    const cell = this.createCellInstance();

    //the cell is detached when created
    this.detachedCells.add(cell);
    this.allCellsOrdered.add(cell);

    return cell;
  }

  /**
   * This really removes the cell, not only makes it detached,
   * but removes it from the render tree and from the pool.
   */
  private removeCell(cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>) {
    if (__DEV__) {
      if (!this.detachedCells.has(cell)) {
        this.error(
          `You want to remove the cell, but it's not in the detached cells set!`,
        );
      }
    }

    this.detachedCells.delete(cell);
    this.attachedCells.delete(cell);
    this.allCellsOrdered.delete(cell);

    cell.destroy();

    this.cellRemoveSubscription(cell);
  }

  /**
   * This attaches a cell to the table.
   * If no cell is provided, it will get a detached one from the pool
   * and move that cell to the attached set.
   * If a cell is provided, it's moved to the attached set as well.
   */
  attachCell(cell?: GridCellInterface<T_ADDITIONAL_CELL_INFO>) {
    if (cell && this.attachedCells.has(cell)) {
      return cell;
    }

    if (!cell) {
      cell = this.getDetachedCell();
    }

    this.detachedCells.delete(cell);
    this.attachedCells.add(cell);

    this.cellAttachmentChangeSubscription({
      cell,
      attached: true,
    });

    return cell;
  }

  detachCell(cell: GridCellInterface<T_ADDITIONAL_CELL_INFO>) {
    if (this.detachedCells.has(cell)) {
      return false;
    }

    this.attachedCells.delete(cell);
    this.detachedCells.add(cell);

    this.cellAttachmentChangeSubscription({
      cell,
      attached: false,
    });

    return true;
  }

  /**
   * This gets a detached cell from the pool.
   * If no detached cell is available, it will create a new one and return that.
   */
  getDetachedCell(): GridCellInterface<T_ADDITIONAL_CELL_INFO> {
    const { detachedCells } = this;

    let cell = detachedCells.values().next().value;

    if (!cell) {
      this.poolSize += GridCellPoolBase.POOL_SIZE_INCREMENT;
      cell = detachedCells.values().next().value;
    }

    if (!cell) {
      this.error('No cells available in the pool!');
    }

    return cell as GridCellInterface<T_ADDITIONAL_CELL_INFO>;
  }

  get attachedSize() {
    return this.attachedCells.size;
  }

  get detachedSize() {
    return this.detachedCells.size;
  }

  get poolSize() {
    return this.allCellsOrdered.size;
  }

  flushPendingAfterCommitWork() {
    for (const cell of this.attachedCells) {
      cell.flushPendingAfterCommitWork();
    }
  }

  set poolSize(value: number) {
    value =
      Math.ceil(value / GridCellPoolBase.POOL_SIZE_INCREMENT) *
      GridCellPoolBase.POOL_SIZE_INCREMENT;

    const currentSize = this.poolSize;

    if (value === currentSize) {
      return;
    }

    const { detachedCells } = this;

    let diff = currentSize - value;

    if (diff > 0) {
      // need to destroy some cells,
      // as there are too many available in the pool
      if (diff > detachedCells.size) {
        diff = detachedCells.size;
        this.debug('Trying to destroy more cells than are currently detached!');
      }

      const iterator = detachedCells.values();
      while (diff > 0) {
        const cell = iterator.next()
          .value as GridCellInterface<T_ADDITIONAL_CELL_INFO>;

        this.removeCell(cell);

        diff--;
      }
    } else {
      diff = -diff;
      // need to create some cells,
      // as there are too few available in the pool
      while (diff > 0) {
        this.createCell();

        diff--;
      }
    }
  }
}
