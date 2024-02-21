import { BooleanCollectionState } from './BooleanCollectionState';

import { DataSourcePropRowDetailsStateObject } from './types';

export class RowDetailsState<KeyType = any> extends BooleanCollectionState<
  DataSourcePropRowDetailsStateObject<KeyType>,
  KeyType
> {
  constructor(
    state:
      | DataSourcePropRowDetailsStateObject<KeyType>
      | RowDetailsState<KeyType>,
  ) {
    //@ts-ignore
    super(state);
  }
  public getState(): DataSourcePropRowDetailsStateObject<KeyType> {
    const expandedRows = this.allPositive
      ? true
      : [...(this.positiveMap?.keys() ?? [])];

    const collapsedRows = this.allNegative
      ? true
      : [...(this.negativeMap?.keys() ?? [])];

    return {
      expandedRows,
      collapsedRows,
    };
  }

  getPositiveFromState(state: DataSourcePropRowDetailsStateObject<KeyType>) {
    return state.expandedRows;
  }
  getNegativeFromState(state: DataSourcePropRowDetailsStateObject<KeyType>) {
    return state.collapsedRows;
  }

  public areAllCollapsed() {
    return this.areAllNegative();
  }
  public areAllExpanded() {
    return this.areAllPositive();
  }

  public collapseAll() {
    this.makeAllNegative();
  }

  public expandAll() {
    this.makeAllPositive();
  }

  public isRowDetailsExpanded = (key: KeyType) => {
    return !!this.isItemPositive(key);
  };

  public isRowDetailsCollapsed(key: KeyType) {
    return !this.isRowDetailsExpanded(key);
  }

  public setRowDetailsExpanded(key: KeyType, shouldExpand: boolean) {
    return this.setItemValue(key, shouldExpand);
  }

  public collapseRowDetails(key: KeyType) {
    this.setRowDetailsExpanded(key, false);
  }
  public expandRowDetails(key: KeyType) {
    this.setRowDetailsExpanded(key, true);
  }

  public toggleRowDetails(key: KeyType) {
    this.toggleItem(key);
  }
}
