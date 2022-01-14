import { DataSourceSingleSortInfo, DataSourceSortInfo } from '../types';

const EMPTY_ARRAY: DataSourceSingleSortInfo<any>[] = Object.freeze(
  [],
) as any as DataSourceSingleSortInfo<any>[];

// the idea of using a weakmap was that single objects always get
// mapped into an array, thus become a new reference on every render
// which breaks React.memo and useEffect comparisons.
//
// but now, mostly just having the EMPTY_ARRAY fixes the referencial issue

export const normalizeSortInfo = <T>(
  initialSortInfo?: DataSourceSortInfo<T>,
  weakMap?: WeakMap<any, any>,
): DataSourceSingleSortInfo<T>[] => {
  const sortInfo =
    initialSortInfo ?? (EMPTY_ARRAY as DataSourceSingleSortInfo<T>[]);

  const result = Array.isArray(sortInfo) ? sortInfo : [sortInfo];

  if (weakMap && weakMap.has(sortInfo)) {
    const prevResult = weakMap.get(sortInfo);

    if (prevResult && prevResult.length === result.length) {
      return prevResult;
    }
  }

  if (weakMap && sortInfo) {
    weakMap.set(sortInfo, result);
  }

  return result;
};
