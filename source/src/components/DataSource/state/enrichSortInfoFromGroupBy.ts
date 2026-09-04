import type { DataSourceGroupBy, DataSourceSingleSortInfo } from '../types';

export const GROUP_COLUMN_ID = 'group-by';
export const GROUP_COLUMN_ID_PREFIX = 'group-by-';

function getSortFieldsForGroupBy<T>(
  groupBy: DataSourceGroupBy<T>[],
): DataSourceSingleSortInfo<T>['field'] | undefined {
  const fields = groupBy
    .map((g) => {
      if (g.valueGetter) {
        return (item: T) => g.valueGetter!({ data: item, field: g.field });
      }
      return (g.field ?? g.groupField) as keyof T | undefined;
    })
    .filter(Boolean) as (keyof T | ((item: T) => any))[];

  if (!fields.length) {
    return undefined;
  }

  // A lone valueGetter is only valid as part of a field array
  if (fields.length === 1 && typeof fields[0] !== 'function') {
    return fields[0] as keyof T;
  }

  return fields as DataSourceSingleSortInfo<T>['field'];
}

/**
 * Fills in `field` on group-column sort infos that only have `{ id, dir }`.
 *
 * - `id: 'group-by'` uses every `groupBy` field (single-column strategy)
 * - `id: 'group-by-<field>'` uses that groupBy item (multi-column strategy)
 */
export function enrichSortInfoFromGroupBy<T>(
  sortInfo: DataSourceSingleSortInfo<T>[] | null,
  groupBy: DataSourceGroupBy<T>[] | undefined,
): DataSourceSingleSortInfo<T>[] | null {
  if (!sortInfo?.length || !groupBy?.length) {
    return sortInfo;
  }

  let changed = false;
  const next = sortInfo.map((info) => {
    if (info.field != null || !info.id) {
      return info;
    }

    if (info.id === GROUP_COLUMN_ID) {
      const field = getSortFieldsForGroupBy(groupBy);
      if (field == null) {
        return info;
      }
      changed = true;
      return { ...info, field };
    }

    if (info.id.startsWith(GROUP_COLUMN_ID_PREFIX)) {
      const key = info.id.slice(GROUP_COLUMN_ID_PREFIX.length);
      const match = groupBy.find(
        (g) => String(g.field) === key || g.groupField === key,
      );
      if (!match) {
        return info;
      }
      const field = getSortFieldsForGroupBy([match]);
      if (field == null) {
        return info;
      }
      changed = true;
      return { ...info, field };
    }

    return info;
  });

  return changed ? next : sortInfo;
}
