export function objectValuesExcept(obj: any, exceptList: Record<string, true>) {
  const result: any[] = [];
  for (const k in obj)
    if (obj.hasOwnProperty(k) && !exceptList.hasOwnProperty(k)) {
      result.push(obj[k]);
    }

  return result;
}
