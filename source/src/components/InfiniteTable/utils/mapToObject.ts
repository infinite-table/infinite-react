export function mapToObject<K extends string, V>(
  mapOrObject?: Map<K, V> | Record<K, V>,
): Record<K, V> {
  if (!mapOrObject) {
    return {} as Record<K, V>;
  }

  if (mapOrObject instanceof Map) {
    const result = {} as Record<K, V>;
    const entries = [...mapOrObject.entries()] as [K, V][];

    entries.forEach(([key, value]) => {
      result[key] = value;
    });

    return result;
  }

  return mapOrObject;
}
