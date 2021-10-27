export function shallowEqualObjects<T extends object | null>(
  objA: T,
  objB: T,
): boolean {
  if (objA === objB) {
    return true;
  }

  if (!objA || !objB) {
    return false;
  }

  var aKeys = Object.keys(objA) as (keyof T)[];
  var bKeys = Object.keys(objB) as (keyof T)[];
  var len = aKeys.length;

  if (bKeys.length !== len) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    var key = aKeys[i];

    if (
      (objA as any)[key] !== (objB as any)[key] ||
      !Object.prototype.hasOwnProperty.call(objB, key)
    ) {
      return false;
    }
  }

  return true;
}
