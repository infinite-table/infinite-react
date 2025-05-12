export function setIntersection<T>(...sets: Set<T>[]): Set<T> {
  if (!sets.length) {
    return new Set<T>();
  }
  const [first, ...rest] = sets;
  return new Set([...first].filter((x) => rest.every((set) => set.has(x))));
}

export function setFilter<T>(set: Set<T>, filter: (x: T) => boolean): Set<T> {
  const result = new Set<T>();
  for (const x of set) {
    if (filter(x)) {
      result.add(x);
    }
  }
  return result;
}

export function setFind<T>(
  set: Set<T>,
  find: (x: T) => boolean,
): T | undefined {
  for (const x of set) {
    if (find(x)) {
      return x;
    }
  }
  return undefined;
}

export function setPop<T>(set: Set<T>): T | undefined {
  if (set.size === 0) {
    return undefined;
  }
  const value = set.values().next().value;

  //@ts-ignore
  set.delete(value);

  return value;
}
