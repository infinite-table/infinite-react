export function keyMirror<T extends object>(obj: T): { [K in keyof T]: K } {
  const result: object = {};
  Object.keys(obj).forEach((key) => {
    //@ts-ignore
    result[key] = key;
  });
  return result as { [K in keyof T]: K };
}
