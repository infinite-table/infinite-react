export type BooleanCollectionStateKeys<KeyType extends string | number> =
  | true
  | Record<KeyType, true>;

export type BooleanCollectionStateObject<KeyType extends string | number> = {
  positiveItems: BooleanCollectionStateKeys<KeyType>;
  negativeItems: BooleanCollectionStateKeys<KeyType>;
};

export abstract class BooleanCollectionState<
  StateObject,
  KeyType extends string | number = string,
> {
  protected positiveMap?: Map<KeyType, true>;
  protected negativeMap?: Map<KeyType, true>;

  protected allNegative!: boolean;
  protected allPositive!: boolean;

  private initialState!: BooleanCollectionStateObject<KeyType>;

  constructor(
    state:
      | BooleanCollectionStateObject<KeyType>
      | BooleanCollectionState<StateObject, KeyType>,
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
  ): BooleanCollectionStateKeys<KeyType>;
  abstract getNegativeFromState(
    state: StateObject,
  ): BooleanCollectionStateKeys<KeyType>;

  abstract getState(): StateObject;

  protected getInitialState() {
    return this.initialState;
  }

  // protected getState(): BooleanCollectionStateObject<KeyType> {
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

  private update(state: BooleanCollectionStateObject<KeyType>) {
    const { positiveItems, negativeItems } = state;

    this.allNegative = negativeItems === true;
    this.allPositive = positiveItems === true;

    if (this.allNegative && this.allPositive) {
      throw `Cannot have both negativeItems and positiveItems be true!`;
    }

    if (negativeItems && negativeItems !== true) {
      if (!this.negativeMap) {
        this.negativeMap = new Map();
      }
      this.negativeMap.clear();

      for (let k in negativeItems) {
        if (negativeItems.hasOwnProperty(k)) {
          this.negativeMap.set(k, true);
        }
      }
      if (this.positiveMap) {
        this.positiveMap.clear();
      }
    }

    if (positiveItems && positiveItems !== true) {
      if (!this.positiveMap) {
        this.positiveMap = new Map();
      }
      this.positiveMap.clear();

      for (let k in positiveItems) {
        if (positiveItems.hasOwnProperty(k)) {
          this.positiveMap.set(k, true);
        }
      }

      if (this.negativeMap) {
        this.negativeMap.clear();
      }
    }
  }

  protected isDefaultNegativeSelection() {
    return this.allNegative;
  }

  protected isDefaultPositiveSelection() {
    return this.allPositive;
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
      positiveItems: {} as Record<KeyType, true>,
    });
  }

  protected makeAllPositive() {
    this.update({
      positiveItems: true,
      negativeItems: {} as Record<KeyType, true>,
    });
  }

  protected isItemPositive(key: KeyType) {
    key = `${key}` as KeyType;
    if (this.allPositive === true) {
      if (this.allNegative === true) {
        throw 'Cannot have both positiveItems and negativeItems be "true"';
      }

      return !this.negativeMap?.has(key as KeyType);
    }

    return !!this.positiveMap?.has(key as KeyType);
  }

  protected isItemNegative(key: KeyType) {
    return !this.isItemPositive(key);
  }

  protected setItemValue(key: KeyType, shouldMakePositive: boolean) {
    key = `${key}` as KeyType;
    if (shouldMakePositive === this.isItemPositive(key)) {
      return;
    }

    if (shouldMakePositive) {
      if (this.allNegative === true) {
        if (!this.positiveMap) {
          throw `No positiveMap found when trying to set item ${key} be positive`;
        }
        this.positiveMap.set(key, true);
      } else if (this.allPositive === true) {
        if (!this.negativeMap) {
          throw `No negativeMap found when trying to set item ${key} be positive`;
        }
        this.negativeMap.delete(key);
      }
    } else {
      // we should collapse the item
      if (this.allPositive === true) {
        if (!this.negativeMap) {
          throw `No negativeMap found when trying to set item ${key} be negative`;
        }
        this.negativeMap.set(key, true);
      } else if (this.allNegative === true) {
        if (!this.positiveMap) {
          throw `No positiveMap found when trying to set item ${key} be negative`;
        }
        this.positiveMap?.delete(key);
      }
    }
  }

  protected makeItemNegative(key: KeyType) {
    this.setItemValue(key, false);
  }
  protected makeItemPositive(key: KeyType) {
    this.setItemValue(key, true);
  }

  protected toggleItem(key: KeyType) {
    this.setItemValue(key, !this.isItemPositive(key));
  }
}
