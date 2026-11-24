import type { PerfMarker } from '../devTools/PerfMarker';
import { treeTraverse } from '../groupAndPivot/treeUtils';
import { sortByNumber, SORT_BY_NUMBER_MIN_LENGTH } from './sortByNumber';
import TYPES, { numberComparator } from './sortTypes';

export type SortDir = 1 | -1;

export type MultisortInfo<T> = {
  /**
   * The sorting direction
   */
  dir: SortDir;

  /**
   * for now 'string' and 'number' are known types, meaning they have
   * sort functions already implemented
   */
  type?: string | string[];

  fn?: (a: any, b: any) => number;

  /**
   * a property whose value to use for sorting on the array items
   */
  field?: keyof T;

  /**
   * or a function to retrieve the item value to use for sorting
   */
  valueGetter?: (item: T) => any;
};

export type MultisortInfoAllowMultipleFields<T> = Omit<
  MultisortInfo<T>,
  'field'
> & {
  field?: keyof T | (keyof T | ((item: T) => any))[];
};

export interface MultisortFn<T> {
  (sortInfo: MultisortInfo<T>[], array: T[]): T[];
  knownTypes: {
    [key: string]: (first: T, second: T) => number;
  };
}

function toPlainSortInfo<T>(
  sortInfo: MultisortInfoAllowMultipleFields<T>[],
): MultisortInfo<T>[] {
  const plainSortInfo = sortInfo
    .map((sortInfo) => {
      if (Array.isArray(sortInfo.field)) {
        return sortInfo.field.map((field, index) => {
          // the sort type will most likely also
          // be an array of the same length
          // so make sure to also get the associated sort type
          let type = Array.isArray(sortInfo.type)
            ? sortInfo.type[index] ?? sortInfo.type[0]
            : sortInfo.type;

          if (typeof field === 'function') {
            const result = {
              ...sortInfo,
              valueGetter: field,
              field: undefined,
              type,
            };
            return result;
          }

          const result = { ...sortInfo, type, field };
          return result;
        });
      }

      return sortInfo as MultisortInfo<T>;
    })
    .flat();

  return plainSortInfo;
}

export const multisort = <T>(
  sortInfo: MultisortInfoAllowMultipleFields<T>[],
  array: T[],
  options?:
    | { marker?: PerfMarker; get?: (item: any) => T }
    | ((item: any) => T),
): T[] => {
  const get = typeof options === 'function' ? options : options?.get;
  const marker =
    options && typeof options === 'object' ? options.marker : undefined;

  if (marker) {
    marker.start();
  }

  const plainSortInfo = toPlainSortInfo(sortInfo);

  if (!sortByNumberIfPossible(plainSortInfo, array, get)) {
    array.sort(getMultisortFunction<T>(plainSortInfo, get));
  }

  if (marker) {
    marker.end();
  }

  return array;
};

export type NestedMultiSortOptions<T> = {
  get?: (item: any) => T;
  nodesKey: string;
  isLeafNode?: (item: T) => boolean;
  getNodeChildren?: (item: T) => null | T[];
  toKey: (item: T) => any;
  depthFirst?: boolean;
  inplace?: boolean;
  marker?: PerfMarker;
};
export const multisortNested = <T>(
  sortInfo: MultisortInfoAllowMultipleFields<T>[],
  array: T[],
  options: NestedMultiSortOptions<T>,
): T[] => {
  const { marker } = options;
  if (marker) {
    marker.start();
  }

  const sortFn = getMultisortFunction<T>(
    toPlainSortInfo(sortInfo),
    options.get,
  );

  const depthFirst = options.depthFirst ?? false;
  const inplace = options.inplace ?? false;

  if (!depthFirst) {
    if (inplace) {
      array.sort(sortFn);
    } else {
      array = [...array].sort(sortFn);
    }
  }

  const { nodesKey, toKey } = options;

  const getNodeChildren = (node: T) => {
    return node[nodesKey as keyof T] as any as T[] | null;
  };

  const isLeafNode = (node: T) => {
    return node[nodesKey as keyof T] === undefined;
  };

  treeTraverse(
    {
      isLeafNode: options.isLeafNode ?? isLeafNode,
      getNodeChildren: options.getNodeChildren ?? getNodeChildren,
      toKey,
    },
    {
      onParentNode: (item, next, children) => {
        if (depthFirst) {
          next();
        }

        if (Array.isArray(children)) {
          const res = inplace
            ? children.sort(sortFn)
            : [...children].sort(sortFn);

          //@ts-ignore
          item[nodesKey] = res;
        }

        if (!depthFirst) {
          next();
        }
      },
    },
    array,
  );

  if (depthFirst) {
    if (inplace) {
      array.sort(sortFn);
    } else {
      array = [...array].sort(sortFn);
    }
  }

  if (marker) {
    marker.end();
  }

  return array;
};

multisort.knownTypes = TYPES;

/**
 * A big array sorted by one column with the built-in number comparator can
 * be sorted without calling the comparator - see sortByNumber.
 *
 * Returns true if it sorted the array (in place, in the same order the
 * comparator would give).
 */
function sortByNumberIfPossible<T>(
  sortInfo: MultisortInfo<T>[],
  array: T[],
  get?: (item: any) => T,
): boolean {
  if (sortInfo.length !== 1 || array.length < SORT_BY_NUMBER_MIN_LENGTH) {
    return false;
  }

  const info = sortInfo[0];

  if (!info || info.fn || !info.type || (info.dir !== 1 && info.dir !== -1)) {
    return false;
  }

  const type = Array.isArray(info.type) ? info.type[0] : info.type;

  // the type could be overridden with a custom comparator
  if (multisort.knownTypes[type] !== numberComparator) {
    return false;
  }

  const { field, valueGetter } = info;

  return sortByNumber(
    array,
    (item: T) => {
      if (get) {
        item = get(item);
      }
      return valueGetter ? valueGetter(item) : field ? item[field] : item;
    },
    info.dir,
  );
}

const getSingleSortFunction = <T>(info: MultisortInfo<T>) => {
  if (!info) {
    return;
  }

  const field = info.field;
  const valueGetter = info.valueGetter;
  const dir = info.dir < 0 ? -1 : info.dir > 0 ? 1 : 0;

  if (!dir) {
    return;
  }

  let fn = info.fn;

  if (!fn && info.type) {
    const type = Array.isArray(info.type) ? info.type[0] : info.type;
    fn = multisort.knownTypes[type];
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
    const a = valueGetter ? valueGetter(first) : field ? first[field] : first;
    const b = valueGetter
      ? valueGetter(second)
      : field
      ? second[field]
      : second;

    const result = fn!(a, b);
    return result === 0 ? result : dir * result;
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
