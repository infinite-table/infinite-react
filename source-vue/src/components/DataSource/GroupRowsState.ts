import { BooleanDeepCollectionState } from './BooleanDeepCollectionState';

import { DataSourcePropGroupRowsStateObject } from './types';

export class GroupRowsState<
  KeyType extends any = any,
> extends BooleanDeepCollectionState<
  DataSourcePropGroupRowsStateObject<KeyType>,
  KeyType
> {
  constructor(
    state:
      | DataSourcePropGroupRowsStateObject<KeyType>
      | GroupRowsState<KeyType>,
  ) {
    //@ts-ignore
    super(state);
  }
  public getState(): DataSourcePropGroupRowsStateObject<KeyType> {
    return {
      expandedRows: this.allPositive
        ? true
        : this.positiveMap?.topDownKeys() ?? [],
      collapsedRows: this.allNegative
        ? true
        : this.negativeMap?.topDownKeys() ?? [],
    };
  }

  getPositiveFromState(state: DataSourcePropGroupRowsStateObject<KeyType>) {
    return state.expandedRows;
  }
  getNegativeFromState(state: DataSourcePropGroupRowsStateObject<KeyType>) {
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

  public isGroupRowExpanded(keys: KeyType[]) {
    return this.isItemPositive(keys);
  }

  public isGroupRowCollapsed(keys: KeyType[]) {
    return !this.isGroupRowExpanded(keys);
  }

  public setGroupRowExpanded(keys: KeyType[], shouldExpand: boolean) {
    return this.setItemValue(keys, shouldExpand);
  }

  public collapseGroupRow(keys: KeyType[]) {
    this.setGroupRowExpanded(keys, false);
  }
  public expandGroupRow(keys: KeyType[]) {
    this.setGroupRowExpanded(keys, true);
  }

  public toggleGroupRow(keys: KeyType[]) {
    this.toggleItem(keys);
  }
}
