import { DataSourceExpandedAndCollapsedGroupRows } from './types';
import { DeepMap } from '../../utils/DeepMap';

export class GroupRowsState<KeyType extends any = any> {
  private expandedMap?: DeepMap<KeyType, true>;
  private collapsedMap?: DeepMap<KeyType, true>;
  private collapsedAll!: boolean;
  private expandedAll!: boolean;

  private initialState!: DataSourceExpandedAndCollapsedGroupRows<KeyType>;

  constructor(
    state:
      | DataSourceExpandedAndCollapsedGroupRows<KeyType>
      | GroupRowsState<KeyType>,
  ) {
    this.update(state instanceof GroupRowsState ? state.getState() : state);
  }

  public getState(): DataSourceExpandedAndCollapsedGroupRows<KeyType> {
    return {
      expandedRows: this.expandedAll
        ? true
        : this.expandedMap?.topDownKeys() ?? [],
      collapsedRows: this.collapsedAll
        ? true
        : this.collapsedMap?.topDownKeys() ?? [],
    };
  }

  public destroy() {
    this.expandedMap?.clear();
    this.collapsedMap?.clear();

    delete this.expandedMap;
    delete this.collapsedMap;
  }

  private update(state: DataSourceExpandedAndCollapsedGroupRows<KeyType>) {
    this.initialState = state;

    const { collapsedRows, expandedRows } = this.initialState;

    this.collapsedAll = collapsedRows === true;
    this.expandedAll = expandedRows === true;

    if (this.collapsedAll && this.expandedAll) {
      throw `Cannot have both collapsedRows and expandedRows be true!`;
    }

    if (collapsedRows !== true) {
      this.collapsedMap?.clear();
      this.collapsedMap =
        this.collapsedMap ??
        new DeepMap(collapsedRows.map((keys) => [keys, true]));
    }
    if (expandedRows !== true) {
      this.expandedMap?.clear();
      this.expandedMap =
        this.expandedMap ??
        new DeepMap(expandedRows.map((keys) => [keys, true]));
    }
  }

  public areAllCollapsed() {
    return (
      this.collapsedAll &&
      (this.expandedMap ? this.expandedMap.size === 0 : true)
    );
  }
  public areAllExpanded() {
    return (
      this.expandedAll &&
      (this.collapsedMap ? this.collapsedMap.size === 0 : true)
    );
  }

  public collapseAll() {
    this.update({
      collapsedRows: true,
      expandedRows: [],
    });
  }

  public expandAll() {
    this.update({
      expandedRows: true,
      collapsedRows: [],
    });
  }

  public isGroupRowExpanded(keys: KeyType[]) {
    if (this.expandedAll === true) {
      if (this.collapsedAll === true) {
        throw 'Cannot have both expandedRows and collapsedRows be "true"';
      }

      return !this.collapsedMap?.has(keys);
    }

    return this.expandedMap?.has(keys);
  }

  public isGroupRowCollapsed(keys: KeyType[]) {
    return !this.isGroupRowExpanded(keys);
  }

  public setGroupRowExpanded(keys: KeyType[], shouldExpand: boolean) {
    if (shouldExpand === this.isGroupRowExpanded(keys)) {
      return;
    }

    if (shouldExpand) {
      if (this.collapsedAll === true) {
        if (!this.expandedMap) {
          throw `No expandedMap found when trying to expand group row ${keys.join(
            ',',
          )}`;
        }
        this.expandedMap.set(keys, true);
      } else if (this.expandedAll === true) {
        if (!this.collapsedMap) {
          throw `No collapsedMap found when trying to expand group row ${keys.join(
            ',',
          )}`;
        }
        this.collapsedMap.delete(keys);
      }
    } else {
      // we should collapse the group row
      if (this.expandedAll === true) {
        if (!this.collapsedMap) {
          throw `No collapsedMap found when trying to collapse group row ${keys.join(
            ',',
          )}`;
        }
        this.collapsedMap.set(keys, true);
      } else if (this.collapsedAll === true) {
        if (!this.expandedMap) {
          throw `No expandedMap found when trying to collapse group row ${keys.join(
            ',',
          )}`;
        }
        this.expandedMap?.delete(keys);
      }
    }
  }

  public collapseGroupRow(keys: KeyType[]) {
    this.setGroupRowExpanded(keys, false);
  }
  public expandGroupRow(keys: KeyType[]) {
    this.setGroupRowExpanded(keys, true);
  }

  public toggleGroupRow(keys: KeyType[]) {
    this.setGroupRowExpanded(keys, !this.isGroupRowExpanded(keys));
  }
}
