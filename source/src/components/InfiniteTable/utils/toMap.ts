export function toMap<K extends string, V>(
  mapOrObject?: Map<K, V> | Record<K, V>,
): Map<K, V> {
  if (!mapOrObject) {
    return new Map<K, V>();
  }

  if (mapOrObject instanceof Map) {
    return mapOrObject;
  }

  return new Map<K, V>(Object.entries(mapOrObject) as [K, V][]);
}
