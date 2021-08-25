import { useEffect } from 'react';

type InterceptedMapFns<K, V> = {
  set?: (k: K, v: V) => void;
  beforeClear?: (map: Map<K, V>) => void;
  clear?: () => void;
  delete?: (k: K) => void;
};

/**
 *
 * @param map Map to intercept
 * @param fns fns to inject
 * @returns a function to restore the map to initial methods
 */
export function interceptMap<K, V>(
  map: Map<K, V>,
  fns: InterceptedMapFns<K, V>,
) {
  const { set, delete: deleteKey, clear } = map;

  if (fns.set) {
    map.set = (key: K, value: V) => {
      set.call(map, key, value);
      fns.set!(key, value);

      return map;
    };
  }
  if (fns.delete) {
    map.delete = (key: any) => {
      const removed = deleteKey.call(map, key);
      fns.delete!(key)!;

      return removed;
    };
  }
  if (fns.clear || fns.beforeClear) {
    map.clear = () => {
      if (fns.beforeClear) {
        fns.beforeClear(map);
      }
      const result = clear.call(map);
      if (fns.clear) {
        fns.clear();
      }
      return result;
    };
  }

  return () => {
    if (set) {
      map.set = set;
    }
    if (deleteKey) {
      map.delete = deleteKey;
    }
    if (clear) {
      map.clear = clear;
    }
  };
}

export function useInterceptedMap<K, V>(
  map: Map<K, V>,
  fns: InterceptedMapFns<K, V>,
) {
  useEffect(() => {
    return interceptMap(map, fns);
  }, [map]);
}
