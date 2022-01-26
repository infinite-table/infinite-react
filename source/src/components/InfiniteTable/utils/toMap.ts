export function toMap<K extends string, V>(
  mapOrObject?: Map<K, V> | Record<K, V>,
  weakMapCache?: WeakMap<any, any>,
): Map<K, V> {
  if (!mapOrObject) {
    return new Map<K, V>();
  }

  if (mapOrObject instanceof Map) {
    return mapOrObject;
  }

  if (weakMapCache && weakMapCache.has(mapOrObject)) {
    return weakMapCache.get(mapOrObject) as Map<K, V>;
  }

  const result = new Map<K, V>(Object.entries(mapOrObject) as [K, V][]);

  if (weakMapCache) {
    weakMapCache.set(mapOrObject, result);
  }

  return result;
}
