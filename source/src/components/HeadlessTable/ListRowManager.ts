import binarySearch from 'binary-search';
import { Logger } from '../../utils/debug';
import { Renderable } from '../types/Renderable';
import { ListRowInterface } from './ListRowInterface';
import { ListRowPoolForReact } from './ListRowPoolForReact';

export type { ListRowInterface };

export class ListRowManager extends Logger {
  private pool: ListRowPoolForReact = new ListRowPoolForReact(this.debugId);

  private indexToRow: Map<number, ListRowInterface> = new Map();
  private rowToIndex: WeakMap<ListRowInterface, number> = new WeakMap();

  private offRemoveRow: VoidFunction;

  constructor(private debugId: string) {
    super(`${debugId}:ListRowManager`);

    this.offRemoveRow = this.pool.onRemoveRow((row) => this.onRemoveRow(row));
  }

  private onRemoveRow(row: ListRowInterface) {
    const rowIndex = this.rowToIndex.get(row);

    if (rowIndex == null) {
      return;
    }
    this.rowToIndex.delete(row);
    this.indexToRow.delete(rowIndex);
  }

  set poolSize(rowCount: number) {
    this.pool.poolSize = rowCount;
  }

  get poolSize() {
    return this.pool.poolSize;
  }

  getDetachedRow() {
    return this.pool.getDetachedRow();
  }

  /**
   * This gets a row for a given position.
   * If there's already a row currently attached at that position, it will be returned.
   *
   * Otherwise, we return another row.
   * @param rowIndex
   */
  getRowFor(rowIndex: number) {
    return this.getRowAt(rowIndex) ?? this.getDetachedRow();
  }

  private setRowIndexInList(row: ListRowInterface, rowIndex: number | null) {
    const currentIndex = this.rowToIndex.get(row);

    if (currentIndex != null) {
      this.indexToRow.delete(currentIndex);
    }

    if (rowIndex == null) {
      this.rowToIndex.delete(row);
    } else {
      this.rowToIndex.set(row, rowIndex);
      this.indexToRow.set(rowIndex, row);
    }
  }

  detachStartingWith(rowIndex: number) {
    const rows = this.getAttachedIndexes();

    let idx = binarySearch(rows, rowIndex, (a, b) => a - b);

    if (idx < 0) {
      idx = ~idx;
    }
    const rowsToDiscard = rows.slice(idx);

    rowsToDiscard.forEach((rowIndex) => this.detachRowAt(rowIndex));
  }

  getRowAt(rowPos: number) {
    return this.indexToRow.get(rowPos);
  }

  getRowIndex(row: ListRowInterface) {
    return this.rowToIndex.get(row);
  }

  isRowAttached(row: ListRowInterface) {
    const rowIndex = this.getRowIndex(row);

    return rowIndex != null;
  }

  isRowAttachedAt(rowIndex: number) {
    const row = this.getRowAt(rowIndex);

    return !!row;
  }

  getList() {
    const max = Math.max(...this.indexToRow.keys());

    const list = Array.from({ length: max + 1 }, (_, index) => {
      const row = this.indexToRow.get(index);

      if (!row) {
        return null;
      }

      return row.getNode();
    });

    return list;
  }

  getAttachedCount() {
    return this.indexToRow.size;
  }

  forEachAttachedRow(fn: (row: ListRowInterface) => void) {
    this.indexToRow.forEach(fn);
  }

  getAttachedIndexes() {
    return Array.from(this.indexToRow.keys()).sort();
  }

  getAllRows() {
    return [...this.pool.getAllRows()];
  }

  detachRowAt(rowIndex: number) {
    const row = this.getRowAt(rowIndex);

    if (!row) {
      return;
    }

    this.setRowIndexInList(row, null);
    this.pool.detachRow(row);
  }

  detachRow(row: ListRowInterface) {
    const rowIndex = this.getRowIndex(row);

    if (rowIndex == null) {
      return;
    }

    this.detachRowAt(rowIndex);
  }

  renderNodeAtRow(node: Renderable, row: ListRowInterface, rowIndex: number) {
    const currentRowAtPos = this.getRowAt(rowIndex);

    if (currentRowAtPos) {
      if (currentRowAtPos !== row) {
        // we have another row at that position
        // so we need to detach that row
        this.detachRowAt(rowIndex);
        // but also detach this row if it's attached
        this.detachRow(row);
      } else {
        // it's the same row, so we don't need to do anything
      }
    } else {
      // we don't have a row at that position

      // and we cant to put `row` at that position
      // but if it's attached somewhere else, we need to detach it first

      this.detachRow(row);
    }

    this.pool.attachRow(row);

    this.setRowIndexInList(row, rowIndex);

    row.update(node);

    return row;
  }

  makeDetachedRowsEmpty() {
    this.pool.getDetachedRows().forEach((row) => {
      row.update(null);
    });
  }

  destroy() {
    this.reset();
  }

  reset() {
    this.pool.reset();
    this.indexToRow.clear();
    this.offRemoveRow();
    this.offRemoveRow = () => {};
  }
}
