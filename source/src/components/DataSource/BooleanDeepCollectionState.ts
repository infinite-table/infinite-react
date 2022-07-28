import { DeepMap } from '../../utils/DeepMap';

export type BooleanDeepCollectionStateKeys<KeyType> = true | KeyType[][];

export type BooleanDeepCollectionStateObject<KeyType> = {
  positiveItems: BooleanDeepCollectionStateKeys<KeyType>;
  negativeItems: BooleanDeepCollectionStateKeys<KeyType>;
};

export abstract class BooleanDeepCollectionState<
  StateObject,
  KeyType extends any = any,
> {
  protected positiveMap?: DeepMap<KeyType, true>;
  protected negativeMap?: DeepMap<KeyType, true>;

  protected allNegative!: boolean;
  protected allPositive!: boolean;

  private initialState!: BooleanDeepCollectionStateObject<KeyType>;

  constructor(
    state:
      | BooleanDeepCollectionStateObject<KeyType>
      | BooleanDeepCollectionState<StateObject, KeyType>,
  ) {
    const stateObject =
      state instanceof Object.getPrototypeOf(this).constructor
        ? //@ts-ignore
          state.getState()
        : state;

    const positiveItems = this.getPositiveFromState(stateObject);
    const negativeItems = this.getNegativeFromState(stateObject);

    this.update({
      negativeItems,
      positiveItems,
    });
  }

  abstract getPositiveFromState(
    state: StateObject,
  ): BooleanDeepCollectionStateKeys<KeyType>;
  abstract getNegativeFromState(
    state: StateObject,
  ): BooleanDeepCollectionStateKeys<KeyType>;

  abstract getState(): StateObject;

  protected getInitialState() {
    return this.initialState;
  }

  // protected getState(): BooleanDeepCollectionStateObject<KeyType> {
  //   return {
  //     positiveItems: this.allPositive
  //       ? true
  //       : this.positiveMap?.topDownKeys() ?? [],
  //     negativeItems: this.allNegative
  //       ? true
  //       : this.negativeMap?.topDownKeys() ?? [],
  //   };
  // }

  public destroy() {
    this.positiveMap?.clear();
    this.negativeMap?.clear();

    delete this.positiveMap;
    delete this.negativeMap;
  }

  private update(state: BooleanDeepCollectionStateObject<KeyType>) {
    const { positiveItems, negativeItems } = state;

    this.allNegative = negativeItems === true;
    this.allPositive = positiveItems === true;

    if (this.allNegative && this.allPositive) {
      throw `Cannot have both negativeItems and positiveItems be true!`;
    }

    if (negativeItems !== true) {
      if (this.negativeMap) {
        this.negativeMap.clear();
        this.negativeMap.fill(negativeItems.map((keys) => [keys, true]));
      } else {
        this.negativeMap = new DeepMap(
          negativeItems.map((keys) => [keys, true]),
        );
      }

      if (this.positiveMap) {
        this.positiveMap.clear();
      }
    }

    if (positiveItems !== true) {
      if (this.positiveMap) {
        this.positiveMap.clear();
        this.positiveMap.fill(positiveItems.map((keys) => [keys, true]));
      } else {
        this.positiveMap = new DeepMap(
          positiveItems.map((keys) => [keys, true]),
        );
      }
      if (this.negativeMap) {
        this.negativeMap.clear();
      }
    }
  }

  protected areAllNegative() {
    return (
      this.allNegative &&
      (this.positiveMap ? this.positiveMap.size === 0 : true)
    );
  }
  protected areAllPositive() {
    return (
      this.allPositive &&
      (this.negativeMap ? this.negativeMap.size === 0 : true)
    );
  }

  protected makeAllNegative() {
    this.update({
      negativeItems: true,
      positiveItems: [],
    });
  }

  protected makeAllPositive() {
    this.update({
      positiveItems: true,
      negativeItems: [],
    });
  }

  protected isItemPositive(keys: KeyType[]) {
    if (this.allPositive === true) {
      if (this.allNegative === true) {
        throw 'Cannot have both positiveItems and negativeItems be "true"';
      }

      return !this.negativeMap?.has(keys);
    }

    return this.positiveMap?.has(keys);
  }

  protected isItemNegative(keys: KeyType[]) {
    return !this.isItemPositive(keys);
  }

  protected setItemValue(keys: KeyType[], shouldMakePositive: boolean) {
    if (shouldMakePositive === this.isItemPositive(keys)) {
      return;
    }

    if (shouldMakePositive) {
      if (this.allNegative === true) {
        if (!this.positiveMap) {
          throw `No positiveMap found when trying to set item ${keys.join(
            ',',
          )} be positive`;
        }
        this.positiveMap.set(keys, true);
      } else if (this.allPositive === true) {
        if (!this.negativeMap) {
          throw `No negativeMap found when trying to set item ${keys.join(
            ',',
          )} be positive`;
        }
        this.negativeMap.delete(keys);
      }
    } else {
      // we should collapse the item
      if (this.allPositive === true) {
        if (!this.negativeMap) {
          throw `No negativeMap found when trying to set item ${keys.join(
            ',',
          )} be negative`;
        }
        this.negativeMap.set(keys, true);
      } else if (this.allNegative === true) {
        if (!this.positiveMap) {
          throw `No positiveMap found when trying to set item ${keys.join(
            ',',
          )} be negative`;
        }
        this.positiveMap?.delete(keys);
      }
    }
  }

  protected makeItemNegative(keys: KeyType[]) {
    this.setItemValue(keys, false);
  }
  protected makeItemPositive(keys: KeyType[]) {
    this.setItemValue(keys, true);
  }

  protected toggleItem(keys: KeyType[]) {
    this.setItemValue(keys, !this.isItemPositive(keys));
  }
}
