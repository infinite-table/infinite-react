import { DeepMap } from '../../utils/DeepMap';

export class GroupRowsLoadingState<KeyType extends any = any> {
  private loadingMap!: DeepMap<KeyType, true>;

  //private initialState!: DataSourceExpandedAndCollapsedGroupRows<KeyType>;

  constructor(state?: GroupRowsLoadingState<KeyType>) {
    if (!state) {
      console.log('empty constuct');
    }
    this.update(state);
  }

  public isLoadingGroupData(keys: KeyType[]): boolean {
    return this.loadingMap.has(keys);
  }

  // @ts-ignore
  public isGroupDataPartiallyLoaded(keys: KeyType[]): boolean {
    // TODO AFL
    throw new Error('Not implemented yet');
  }

  // @ts-ignore
  public isGroupDataLoaded(keys: KeyType[]): boolean {
    // TODO AFL
    throw new Error('Not implemented yet');
  }

  public setGroupRowLoading(keys: KeyType[], isLoading: boolean): void {
    if (isLoading === this.isLoadingGroupData(keys)) {
      return;
    }

    if (isLoading) {
      this.loadingMap.set(keys, true);
    } else {
      this.loadingMap.delete(keys);
    }
  }

  public destroy() {
    this.loadingMap.clear();
  }

  private update(state?: GroupRowsLoadingState<KeyType>) {
    this.loadingMap = state ? state.loadingMap : new DeepMap();
  }
}
