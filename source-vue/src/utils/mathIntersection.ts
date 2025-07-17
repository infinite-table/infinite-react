export function arrayIntersection<T>(...arrays: T[][]): T[] {
  if (!arrays.length) {
    return [] as T[];
  }
  const map = new Map();
  arrays.forEach((arr) => {
    for (let i = 0, len = arr.length; i < len; i++) {
      const item = arr[i];
      const count = map.get(item) ?? 0;

      map.set(item, count + 1);
    }

    return map;
  });

  const len = arrays.length;
  return arrays[0].filter((x: T) => {
    return map.get(x) === len;
  });
}
