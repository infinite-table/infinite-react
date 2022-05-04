export function assignFiltered(
  filterFn: (value: any, key: string) => boolean,
  target: any,
  ...rest: any[]
) {
  const result = target;

  rest.forEach((obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && filterFn(obj[key], key)) {
        result[key] = obj[key];
      }
    }
  });

  return result;
}

export function assignNonNull(target: any, ...rest: any[]) {
  return assignFiltered((value) => value != null, target, ...rest);
}

export function assignExcept(
  exceptKeys: Record<string, boolean>,
  target: any,
  ...rest: any[]
) {
  return assignFiltered((_value, key) => !(key in exceptKeys), target, ...rest);
}
