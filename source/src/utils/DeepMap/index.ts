import { once } from './once';
import { sortAscending } from './sortAscending';

type VoidFn = () => void;

type Pair<KeyType, ValueType> = {
  value?: ValueType;
  map?: Map<KeyType, Pair<KeyType, ValueType>>;
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
    if (initial) {
      initial.forEach((entry) => {
        const [keys, value] = entry;

        this.set(keys, value);
      });
    }
  }

  getValuesStartingWith(keys: KeyType[]): ValueType[] {
    const result: ValueType[] = [];
    this.getStartingWith(keys, (_keys, value) => {
      result.push(value);
    });

    return result;
  }

  getKeysStartingWith(keys: KeyType[]): KeyType[][] {
    const result: KeyType[][] = [];
    this.getStartingWith(keys, (keys) => {
      result.push(keys);
    });

    return result;
  }

  private getStartingWith(
    keys: KeyType[],
    fn: (key: KeyType[], value: ValueType) => void,
  ) {
    let currentMap = this.map;
    let pair: Pair<KeyType, ValueType> | undefined;
    if (!keys.length) {
      keys = [this.emptyKey];
    }

    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];

      pair = currentMap.get(key);

      if (!pair || !pair.map) {
        return;
      }

      currentMap = pair.map;
    }

    if (pair && pair.value !== undefined) {
      fn(keys, pair.value!);
    }
    this.visitWithNext(
      keys,
      (value, keys, _i, next) => {
        fn(keys, value);
        next?.();
      },
      currentMap,
    );
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
      const pair = currentMap.get(key)! || {};

      if (last) {
        pair.revision = this.revision++;
        pair.value = value;

        currentMap.set(key, pair);
        this.length++;
      } else {
        if (!pair.map) {
          pair.map = new Map<KeyType, ValueType>();
          currentMap.set(key, pair);
        }

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
      next?: VoidFn,
    ) => void,
    currentMap: Map<KeyType, Pair<KeyType, ValueType>> = this.map,
  ) => {
    if (!currentMap) {
      return;
    }
    let i = 0;
    const hasEmptyKey = currentMap.has(this.emptyKey);
    let allowEmptyKey = true;

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

      const next = map ? () => this.visitWithNext(keys, fn, map) : undefined;

      if (pair.hasOwnProperty('value')) {
        fn(pair.value!, keys, i, next);
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
