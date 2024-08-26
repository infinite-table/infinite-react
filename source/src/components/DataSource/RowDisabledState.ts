import { BooleanCollectionState } from './BooleanCollectionState';
import { RowDisabledStateObject } from './types';

export class RowDisabledState<KeyType = any> extends BooleanCollectionState<
  RowDisabledStateObject<KeyType>,
  KeyType
> {
  constructor(
    state: RowDisabledStateObject<KeyType> | RowDisabledState<KeyType>,
  ) {
    //@ts-ignore
    super(state);
  }
  public getState(): RowDisabledStateObject<KeyType> {
    const enabledRows = this.allPositive
      ? true
      : [...(this.positiveMap?.keys() ?? [])];

    const disabledRows = this.allNegative
      ? true
      : [...(this.negativeMap?.keys() ?? [])];

    return {
      enabledRows,
      disabledRows,
    } as RowDisabledStateObject<KeyType>;
  }

  getPositiveFromState(state: RowDisabledStateObject<KeyType>) {
    return state.enabledRows;
  }
  getNegativeFromState(state: RowDisabledStateObject<KeyType>) {
    return state.disabledRows;
  }

  public areAllDisabled() {
    return this.areAllNegative();
  }
  public areAllEnabled() {
    return this.areAllPositive();
  }

  public disableAll() {
    this.makeAllNegative();
  }

  public enableAll() {
    this.makeAllPositive();
  }

  public isRowEnabled = (key: KeyType) => {
    return !!this.isItemPositive(key);
  };

  public isRowDisabled(key: KeyType) {
    return !this.isRowEnabled(key);
  }

  public setRowEnabled(key: KeyType, shouldExpand: boolean) {
    return this.setItemValue(key, shouldExpand);
  }

  public disableRow(key: KeyType) {
    this.setRowEnabled(key, false);
  }
  public enableRow(key: KeyType) {
    this.setRowEnabled(key, true);
  }

  public toggleRow(key: KeyType) {
    this.toggleItem(key);
  }
}
