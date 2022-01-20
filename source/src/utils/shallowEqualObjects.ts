export function shallowEqualObjects<T extends object | null>(
  objA: T,
  objB: T,
  ignoreKeys?: Set<string>,
): boolean {
  if (objA === objB) {
    return true;
  }

  if (!objA || !objB) {
    return false;
  }

  var aKeys = Object.keys(objA) as (keyof T)[];
  var bKeys = Object.keys(objB) as (keyof T)[];

  if (ignoreKeys) {
    //@ts-ignore
    aKeys = aKeys.filter((key) => !ignoreKeys.has(key));
    //@ts-ignore
    bKeys = bKeys.filter((key) => !ignoreKeys.has(key));
  }

  var len = aKeys.length;

  if (bKeys.length !== len) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    var key = aKeys[i];

    if (ignoreKeys) {
      //@ts-ignore
      if (ignoreKeys.has(key)) {
        continue;
      }
    }

    if (
      (objA as any)[key] !== (objB as any)[key] ||
      !Object.prototype.hasOwnProperty.call(objB, key)
    ) {
      return false;
    }
  }

  return true;
}
