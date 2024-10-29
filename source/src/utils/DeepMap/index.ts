import { once } from './once';
import { sortAscending } from './sortAscending';

type VoidFn = () => void;

type Pair<KeyType, ValueType> = {
  value?: ValueType;
  map?: Map<KeyType, Pair<KeyType, ValueType>>;
  length: number;
  revision?: number;
};

const SORT_ASC_REVISION = (p1: Pair<any, any>, p2: Pair<any, any>) =>
  sortAscending(p1.revision!, p2.revision!);

export type DeepMapVisitFn<KeyType, ValueType> = (
  pair: Pair<KeyType, ValueType>,
  keys: KeyType[],
  next: VoidFn,
) => void;

export class DeepMap<KeyType, ValueType> {
  private map = new Map<KeyType, Pair<KeyType, ValueType>>();
  private length = 0;
  private revision = 0;
  private emptyKey = Symbol('emptyKey') as any as KeyType;

  static clone<KeyType, ValueType>(map: DeepMap<KeyType, ValueType>) {
    const clone = new DeepMap<KeyType, ValueType>();

    map.visit((pair, keys) => {
      clone.set(keys, pair.value!);
    });

    return clone;
  }

  constructor(initial?: [KeyType[], ValueType][]) {
    this.fill(initial);
  }

  fill(initial?: [KeyType[], ValueType][]) {
    if (initial) {
      initial.forEach((entry) => {
        const [keys, value] = entry;

        this.set(keys, value);
      });
    }
  }

  getValuesStartingWith(
    keys: KeyType[],
    excludeSelf?: boolean,
    depthLimit?: number,
  ): ValueType[] {
    const result: ValueType[] = [];
    this.getStartingWith(
      keys,
      (_keys, value) => {
        result.push(value);
      },
      excludeSelf,
      depthLimit,
    );

    return result;
  }

  getEntriesStartingWith(
    keys: KeyType[],
    excludeSelf?: boolean,
    depthLimit?: number,
  ): [KeyType[], ValueType][] {
    const result: [KeyType[], ValueType][] = [];
    this.getStartingWith(
      keys,
      (keys, value) => {
        result.push([keys, value]);
      },
      excludeSelf,
      depthLimit,
    );

    return result;
  }

  getUnnestedKeysStartingWith(
    keys: KeyType[],
    excludeSelf?: boolean,
    depthLimit?: number,
  ): KeyType[][] {
    const pairs: (Pair<KeyType, ValueType> & { keys: KeyType[] })[] = [];

    const fn: (pair: Pair<KeyType, ValueType> & { keys: KeyType[] }) => void = (
      pair,
    ) => {
      pairs.push(pair);
    };

    let currentMap = this.map;
    let pair: Pair<KeyType, ValueType> | undefined;
    let stop = false;

    if (keys.length) {
      for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];

        pair = currentMap.get(key);

        if (!pair || !pair.map) {
          stop = true;
          if (i === len - 1) {
            // if on the last key
            // we want to allow the if clause below to run and check if the value on the last
            // pair is present
            stop = true;
            break;
          } else {
            return [];
          }
        }

        currentMap = pair.map;
      }
    } else {
      if (!excludeSelf) {
        const hasEmptyKey = currentMap.has(this.emptyKey);
        if (hasEmptyKey) {
          return [[]];
        }
      }
    }

    if (pair && pair.value !== undefined) {
      if (!excludeSelf) {
        fn({ ...pair, keys });
        stop = true;
      }
    }
    if (stop) {
      return pairs.sort(SORT_ASC_REVISION).map((pair) => pair.keys);
    }

    this.visitWithNext(
      keys,
      (_value, keys, _i, _next, pair) => {
        fn({ ...pair, keys });
        // don't call next to go deeper
      },
      currentMap,
      depthLimit,
      excludeSelf,
    );

    return pairs.sort(SORT_ASC_REVISION).map((pair) => pair.keys);
  }

  getKeysStartingWith(
    keys: KeyType[],
    excludeSelf?: boolean,
    depthLimit?: number,
  ): KeyType[][] {
    const result: KeyType[][] = [];
    this.getStartingWith(
      keys,
      (keys) => {
        result.push(keys);
      },
      excludeSelf,
      depthLimit,
    );

    return result;
  }

  private getStartingWith(
    keys: KeyType[],
    fn: (key: KeyType[], value: ValueType) => void,
    excludeSelf?: boolean,
    depthLimit?: number,
  ) {
    let currentMap = this.map;
    let pair: Pair<KeyType, ValueType> | undefined;
    let stop = false;

    if (keys.length) {
      for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];

        pair = currentMap.get(key);

        if (!pair || !pair.map) {
          stop = true;
          if (i === len - 1) {
            // if on the last key
            // we want to allow the if clause below to run and check if the value on the last
            // pair is present
            stop = true;
            break;
          } else {
            return;
          }
        }

        currentMap = pair.map;
      }
    }

    if (pair && pair.value !== undefined) {
      if (!excludeSelf) {
        fn(keys, pair.value!);
      }
    }
    if (stop) {
      return;
    }

    this.visitWithNext(
      keys,
      (value, keys, _i, next) => {
        fn(keys, value);
        next?.();
      },
      currentMap,
      depthLimit,
      excludeSelf,
    );
  }

  private getMapAt(keys: KeyType[]) {
    let currentMap = this.map;
    let pair: Pair<KeyType, ValueType> | undefined;
    if (!keys.length) {
      return this.map;
    }

    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];

      pair = currentMap.get(key);

      if (!pair || !pair.map) {
        return undefined;
      }

      currentMap = pair.map;
    }
    return currentMap;
  }

  getAllChildrenSizeFor(keys: KeyType[]) {
    let currentMap = this.map;
    let pair: Pair<KeyType, ValueType> | undefined;
    if (!keys.length) {
      return this.length;
    }

    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];

      pair = currentMap.get(key);

      if (!pair || !pair.map) {
        return 0;
      }

      currentMap = pair.map;
    }
    return pair!.length;
  }

  getDirectChildrenSizeFor(keys: KeyType[]) {
    let currentMap = this.map;
    if (!keys.length) {
      keys = [this.emptyKey];
    }
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      const last = i === len - 1;
      const pair = currentMap.get(key);

      if (!pair || !pair.map) {
        return 0;
      }
      currentMap = pair.map;
      if (last) {
        return currentMap?.size ?? 0;
      }
    }
    return 0;
  }

  set(keys: KeyType[] & { length: Omit<number, 0> }, value: ValueType) {
    let currentMap = this.map;
    if (!keys.length) {
      keys = [this.emptyKey];
    }

    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      const last = i === len - 1;
      const pair = currentMap.get(key)! || {
        length: 0,
      };

      if (last) {
        pair.revision = this.revision++;
        pair.value = value;

        currentMap.set(key, pair);
        this.length++;
      } else {
        if (!pair.map) {
          pair.map = new Map<KeyType, Pair<KeyType, ValueType>>();
          currentMap.set(key, pair);
        }
        pair.length++;

        currentMap = pair.map;
      }
    }

    return this;
  }

  get(keys: KeyType[]): ValueType | undefined {
    let currentMap = this.map;
    if (!keys.length) {
      keys = [this.emptyKey];
    }
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      const last = i === len - 1;
      const pair = currentMap.get(key);
      if (last) {
        return pair ? pair.value : undefined;
      } else {
        if (!pair || !pair.map) {
          return;
        }
        currentMap = pair.map;
      }
    }
    return;
  }

  get size() {
    return this.length;
  }

  clear() {
    const clearMap = (map: Map<KeyType, Pair<KeyType, ValueType>>) => {
      map.forEach((value, _key) => {
        const { map } = value;
        if (map) {
          clearMap(map);
        }
      });

      map.clear();
    };

    clearMap(this.map);

    this.length = 0;
    this.revision = 0;
  }

  delete(keys: KeyType[]): boolean {
    let currentMap = this.map;
    if (!keys.length) {
      keys = [this.emptyKey];
    } else {
      keys = [...keys];
    }

    const maps = [currentMap];
    const pairs = [];

    let result = false;

    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      const last = i === len - 1;
      const pair = currentMap.get(key);
      if (last) {
        if (pair) {
          if (pair.hasOwnProperty('value')) {
            delete pair.value;
            delete pair.revision;

            result = true;
            pairs.forEach((pair) => {
              pair.length--;
            });
            this.length--;
          }

          if (pair.map && pair.map.size === 0) {
            delete pair.map;
          }
          if (!pair.map) {
            // pair is empty, so we can remove it altogether
            currentMap.delete(key);
          }
        }

        break;
      } else {
        if (!pair || !pair.map) {
          result = false;
          break;
        }
        pairs.push(pair);
        currentMap = pair.map;
        maps.push(currentMap);
      }
    }

    while (maps.length) {
      const map = maps.pop();
      const keysLen = keys.length;
      keys.pop();
      if (keysLen > 0 && map?.size === 0) {
        const parentMap = maps[maps.length - 1];
        const parentKey = keys[keys.length - 1];
        const pair = parentMap?.get(parentKey);
        if (pair) {
          // pair.map === map ; which can be deleted
          delete pair.map;

          if (!pair.hasOwnProperty('value')) {
            // whole pair can be successfully deleted from parentMap
            parentMap.delete(parentKey);
          }
        }
      }
    }
    return result;
  }

  has(keys: KeyType[]) {
    let currentMap = this.map;
    if (!keys.length) {
      keys = [this.emptyKey];
    }
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      const last = i === len - 1;
      const pair = currentMap.get(key);
      if (last) {
        return pair ? pair.hasOwnProperty('value') : false;
      } else {
        if (!pair || !pair.map) {
          return false;
        }
        currentMap = pair.map;
      }
    }
    return false;
  }

  private visitKey(
    key: KeyType,
    currentMap: Map<KeyType, Pair<KeyType, ValueType>>,
    parentKeys: KeyType[],
    fn: DeepMapVisitFn<KeyType, ValueType>,
  ) {
    const pair = currentMap.get(key);

    if (!pair) {
      return;
    }
    const { map } = pair;

    const keys = key === this.emptyKey ? [] : [...parentKeys, key];

    const next = once(() => {
      if (map) {
        map.forEach((_, k) => {
          this.visitKey(k, map, keys, fn);
        });
      }
    });

    if (pair.hasOwnProperty('value')) {
      fn(pair, keys, next);
    }

    // if it was called by fn, it won't be called again, as it's once-d
    next();
  }

  visit = (fn: DeepMapVisitFn<KeyType, ValueType>) => {
    this.map.forEach((_, k) => this.visitKey(k, this.map, [], fn));
  };

  visitDepthFirst = (
    fn: (
      value: ValueType,
      keys: KeyType[],
      indexInGroup: number,
      next?: VoidFn,
    ) => void,
  ) => {
    this.visitWithNext([], fn);
  };

  private visitWithNext = (
    parentKeys: KeyType[],

    fn: (
      value: ValueType,
      keys: KeyType[],
      indexInGroup: number,
      next: VoidFn | undefined,
      pair: Pair<KeyType, ValueType>,
    ) => void,
    currentMap: Map<KeyType, Pair<KeyType, ValueType>> = this.map,
    depthLimit?: number,
    skipSelfValue?: boolean,
  ) => {
    if (!currentMap) {
      return;
    }
    let i = 0;
    const hasEmptyKey = currentMap.has(this.emptyKey);
    let allowEmptyKey = skipSelfValue ? false : true;

    if (depthLimit !== undefined) {
      if (depthLimit < 0) {
        return;
      }
      depthLimit--;
    }

    const iterator = (_: Pair<KeyType, ValueType>, key: KeyType) => {
      const pair = currentMap.get(key);

      if (!pair) {
        return;
      }
      const { map } = pair;

      const isEmptyKey = key === this.emptyKey;
      if (isEmptyKey && !allowEmptyKey) {
        return;
      }
      const keys = isEmptyKey ? [] : [...parentKeys, key];

      let next = map
        ? () =>
            this.visitWithNext(
              keys,
              fn,
              map,
              depthLimit !== undefined ? depthLimit - 1 : undefined,
            )
        : undefined;

      if (pair.hasOwnProperty('value')) {
        fn(pair.value!, keys, i, next, pair);
        i++;
      } else {
        next?.();
      }
    };

    if (hasEmptyKey) {
      iterator(undefined as any as Pair<KeyType, ValueType>, this.emptyKey);
      allowEmptyKey = false;
      i = 0;
    }
    currentMap.forEach(iterator);
  };

  private getArray<ReturnType>(
    fn: (pair: Pair<KeyType, ValueType> & { keys: KeyType[] }) => ReturnType,
  ) {
    const result: ReturnType[] = [];

    this.visit((pair, keys) => {
      const res = fn({ ...pair, keys });
      if (keys.length === 0) {
        result.splice(0, 0, res);
      } else {
        result.push(res);
      }
    });

    return result;
  }

  valuesAt(keys: KeyType[]): ValueType[] {
    const map = this.getMapAt(keys);
    if (!map) {
      return [];
    }

    const result: ValueType[] = [];
    map.forEach((bag) => {
      if (bag.value !== undefined) {
        result.push(bag.value);
      }
    });

    return result;
  }

  values() {
    return this.sortedIterator<ValueType>((pair) => pair.value!);
  }
  keys() {
    const keys = this.sortedIterator<KeyType[]>((pair) => pair.keys);

    return keys;
  }

  entries() {
    return this.sortedIterator<[KeyType[], ValueType]>((pair) => [
      pair.keys,
      pair.value!,
    ]);
  }

  topDownEntries() {
    return this.getArray<[KeyType[], ValueType]>((pair) => [
      pair.keys,
      pair.value!,
    ]);
  }

  topDownKeys() {
    return this.getArray<KeyType[]>((pair) => pair.keys);
  }
  topDownValues() {
    return this.getArray<ValueType>((pair) => pair.value!);
  }

  private sortedIterator<ReturnType>(
    fn: (pair: Pair<KeyType, ValueType> & { keys: KeyType[] }) => ReturnType,
  ) {
    const result: (Pair<KeyType, ValueType> & { keys: KeyType[] })[] = [];

    this.visit((pair, keys) => {
      result.push({ ...pair, keys });
    });

    result.sort(SORT_ASC_REVISION);

    function* makeIterator() {
      for (let i = 0, len = result.length; i < len; i++) {
        yield fn(result[i]);
      }
    }

    return makeIterator();
  }

  // private iterator<ReturnType>(
  //   fn: (pair: Pair<KeyType, ValueType> & { keys: KeyType[] }) => ReturnType,
  // ) {
  //   const result: (Pair<KeyType, ValueType> & { keys: KeyType[] })[] = [];

  //   this.visit((pair, keys) => {
  //     result.push({ ...pair, keys });
  //   });

  //   function* makeIterator() {
  //     for (let i = 0, len = result.length; i < len; i++) {
  //       yield fn(result[i]);
  //     }
  //   }

  //   return makeIterator();
  // }
}
