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

  set(keys: KeyType[] & { length: Omit<number, 0> }, value: ValueType) {
    let currentMap = this.map;
    if (!keys.length) {
      throw `Cannot set given keys - please provide a non-empty keys array.`;
      // currentMap.set((EMPTY_KEY as unknown) as K, { value });
      // this.length++;
      // return this;
    }
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      const last = i === len - 1;
      if (last) {
        const pair = currentMap.has(key) ? currentMap.get(key)! : {};

        pair.revision = this.revision++;
        pair.value = value;

        currentMap.set(key, pair);
        this.length++;
      } else {
        const pair = currentMap.has(key) ? currentMap.get(key)! : {};

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
      throw `Cannot get given keys - please provide a non-empty keys array.`;
      // return currentMap.get((EMPTY_KEY as unknown) as K)?.value;
    }
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      const last = i === len - 1;
      if (last) {
        return currentMap.get(key)?.value;
      } else {
        const pair = currentMap.get(key);

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
    keys = [...keys];
    let currentMap = this.map;
    if (!keys.length) {
      throw `Cannot delete given keys - please provide a non-empty keys array.`;
      // if (currentMap.has(EMPTY_KEY as unknown as K)) {
      //   this.length--;
      // }
      // return currentMap.delete((EMPTY_KEY as unknown) as K);
    }

    let maps = [currentMap];

    let result = false;

    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      const last = i === len - 1;
      if (last) {
        const pair = currentMap.get(key);

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
        const pair = currentMap.get(key);

        if (!pair || !pair.map) {
          result = false;
          break;
        }
        currentMap = pair.map;
        maps.push(currentMap);
      }
    }

    while (maps.length) {
      let map = maps.pop();
      let key = keys.pop();
      if (key && map?.size === 0) {
        let parentMap = maps[maps.length - 1];
        let pair = parentMap?.get(key);
        if (pair) {
          // pair.map === map ; which can be deleted
          delete pair.map;

          if (!pair.hasOwnProperty('value')) {
            // whole pair can be successfully deleted from parentMap
            parentMap.delete(key);
          }
        }
      }
    }
    return result;
  }

  has(keys: KeyType[]) {
    let currentMap = this.map;
    if (!keys.length) {
      throw `Cannot find existing given keys - please provide a non-empty keys array.`;
      // return (
      //   currentMap.has((EMPTY_KEY as unknown) as K) &&
      //   currentMap.get((EMPTY_KEY as unknown) as K)?.value !== undefined
      // );
    }
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      const last = i === len - 1;
      if (last) {
        const pair = currentMap.get(key);
        return !!pair && pair.hasOwnProperty('value');
      } else {
        const pair = currentMap.get(key);

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

    const keys = [...parentKeys, key];

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
    currentMap.forEach((_, key) => {
      const pair = currentMap.get(key);

      if (!pair) {
        return;
      }
      const { map } = pair;

      const keys = [...parentKeys, key];

      const next = map ? () => this.visitWithNext(keys, fn, map) : undefined;

      if (pair.hasOwnProperty('value')) {
        fn(pair.value!, keys, i, next);
        i++;
      } else {
        next?.();
      }
    });
  };

  private getArray<ReturnType>(
    fn: (pair: Pair<KeyType, ValueType> & { keys: KeyType[] }) => ReturnType,
  ) {
    const result: ReturnType[] = [];

    this.visit((pair, keys) => {
      result.push(fn({ ...pair, keys }));
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
