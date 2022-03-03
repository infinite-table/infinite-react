export function assignFiltered(
  filterFn: (value: any, key: string) => boolean,
  target: any,
  ...rest: any[]
) {
  let result = target;

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
