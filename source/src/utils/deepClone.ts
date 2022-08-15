import { getGlobal } from './getGlobal';

function cloneArray(arr: any[]) {
  return arr.map(deepClone);
}

export function deepClone(source: any): any {
  //@ts-ignore
  if (getGlobal().structuredClone) {
    //@ts-ignore
    return getGlobal().structuredClone(source);
  }

  if (source === null || typeof source !== 'object') {
    // this is a scalar value
    return source;
  }
  if (Array.isArray(source)) {
    return cloneArray(source);
  }
  if (source instanceof Date) {
    return new Date(source);
  }
  if (source instanceof Set) {
    return new Set(cloneArray(Array.from(source)));
  }
  if (source instanceof Map) {
    return new Map(cloneArray(Array.from(source)));
  }

  let target: any = {};
  for (let key in source)
    if (source.hasOwnProperty(key)) {
      target[key] = deepClone(source[key]);
    }

  return target;
}
