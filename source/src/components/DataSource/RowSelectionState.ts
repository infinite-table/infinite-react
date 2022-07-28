import { BooleanCollectionState } from './BooleanCollectionState';

export type RowSelectionStateKeys<RowKeyType extends string | number> =
  | true
  | Record<RowKeyType, true>;

export type RowSelectionStateObject<
  RowKeyType extends string | number = string,
> = {
  selectedRows: RowSelectionStateKeys<RowKeyType>;
  deselectedRows: RowSelectionStateKeys<RowKeyType>;
};

function reduceKeysToRecord<T extends string | number>(
  acc: Record<T, true>,
  key: T,
) {
  //@ts-ignore
  acc[key] = true;
  return acc;
}
export class RowSelectionState<
  RowKeyType extends string | number = string,
> extends BooleanCollectionState<
  RowSelectionStateObject<RowKeyType>,
  RowKeyType
> {
  constructor(
    state: RowSelectionStateObject<RowKeyType> | RowSelectionState<RowKeyType>,
  ) {
    //@ts-ignore
    super(state);
  }
  public getState(): RowSelectionStateObject<RowKeyType> {
    return {
      selectedRows: this.allPositive
        ? true
        : [...(this.positiveMap?.keys() || [])].reduce(
            reduceKeysToRecord,
            {} as Record<RowKeyType, true>,
          ) ?? {},
      deselectedRows: this.allNegative
        ? true
        : [...(this.negativeMap?.keys() || [])].reduce(
            reduceKeysToRecord,
            {} as Record<RowKeyType, true>,
          ) ?? {},
    };
  }

  getPositiveFromState(state: RowSelectionStateObject<RowKeyType>) {
    return state.selectedRows;
  }
  getNegativeFromState(state: RowSelectionStateObject<RowKeyType>) {
    return state.deselectedRows;
  }

  public areAllSelected() {
    return this.areAllPositive();
  }

  public areAllDeselected() {
    return this.areAllNegative();
  }

  public deselectAll() {
    this.makeAllNegative();
  }

  public selectAll() {
    this.makeAllPositive();
  }

  public isRowDefaultSelected() {
    return this.isDefaultPositiveSelection();
  }

  public isRowDefaultDeselected() {
    return this.isDefaultNegativeSelection();
  }

  public isRowSelected(key: string | number) {
    return this.isItemPositive(key as RowKeyType);
  }

  public isRowDeselected(key: string | number) {
    return !this.isItemPositive(key as RowKeyType);
  }

  public setRowSelected(key: string | number, selected: boolean) {
    return this.setItemValue(key as RowKeyType, selected);
  }

  public deselectRow(key: string | number) {
    this.setRowSelected(key, false);
  }

  public selectRow(key: string | number) {
    this.setRowSelected(key, true);
  }

  public toggleRowSelection(key: string | number) {
    this.toggleItem(key as RowKeyType);
  }

  public getSelectedCount(): number {
    if (this.isRowDefaultSelected()) {
      return this.negativeMap ? -this.negativeMap.size : 0;
    }

    return this.positiveMap?.size ?? 0;
  }
}
