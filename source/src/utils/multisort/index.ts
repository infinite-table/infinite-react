import TYPES from './sortTypes';

export type SortDir = 1 | -1;

export type MultisortInfo<T> = {
  /**
   * The sorting direction
   */
  dir: SortDir;

  /**
   * a property whose value to use for sorting on the array items
   */
  field?: keyof T;

  /**
   * for now 'string' and 'number' are known types, meaning they have
   * sort functions already implemented
   */
  type?: string;

  fn?: (a: any, b: any) => number;
};

export interface MultisortFn<T> {
  (sortInfo: MultisortInfo<T>[], array: T[]): T[];
  knownTypes: {
    [key: string]: (first: T, second: T) => number;
  };
}

export const multisort = <T>(
  sortInfo: MultisortInfo<T>[],
  array: T[],
  get?: (item: any) => T,
): T[] => {
  array.sort(getMultisortFunction<T>(sortInfo, get));

  return array;
};

multisort.knownTypes = TYPES;

var getSingleSortFunction = <T>(info: MultisortInfo<T>) => {
  if (!info) {
    return;
  }

  const field = info.field;
  var dir = info.dir < 0 ? -1 : info.dir > 0 ? 1 : 0;

  if (!dir) {
    return;
  }

  let fn = info.fn;

  if (!fn && info.type) {
    fn = multisort.knownTypes[info.type];
    if (!fn) {
      console.warn(
        `Unknown sort type "${info.type}" - please pass one of ${Object.keys(
          multisort.knownTypes,
        ).join(', ')}`,
      );
    }
  }

  if (!fn) {
    fn = TYPES.string;
  }

  return (first: T, second: T) => {
    const a = field ? first[field] : first;
    const b = field ? second[field] : second;

    return dir * fn!(a, b);
  };
};

const getSortFunctions = <T>(sortInfo: MultisortInfo<T>[]) => {
  return sortInfo
    .map(getSingleSortFunction)
    .filter((fn) => fn instanceof Function);
};

const getMultisortFunction = <T>(
  sortInfo: MultisortInfo<T>[],
  get?: (item: any) => T,
) => {
  const fns = getSortFunctions<T>(sortInfo);

  return (first: T, second: T): number => {
    if (get) {
      first = get(first);
      second = get(second);
    }

    let result = 0;
    let i = 0;
    let fn;

    const len = fns.length;

    for (; i < len; i++) {
      fn = fns[i];
      if (!fn) {
        continue;
      }

      result = fn(first, second);

      if (result !== 0) {
        return result;
      }
    }

    return result;
  };
};

export { getMultisortFunction, getSortFunctions };
