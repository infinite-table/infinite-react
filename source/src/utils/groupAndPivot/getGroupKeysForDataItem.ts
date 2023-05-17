import { DEFAULT_TO_KEY } from './defaultToKey';
import { GroupBy, GroupKeyType } from './types';

export function getGroupKeysForDataItem<DataType, KeyType = any>(
  data: DataType,
  groupBy: GroupBy<DataType, KeyType>[],
) {
  return groupBy.reduce((groupKeys, groupBy) => {
    const { field: groupByProperty, valueGetter, toKey: groupToKey } = groupBy;
    const value = groupByProperty
      ? data[groupByProperty]
      : valueGetter?.({ data, field: groupByProperty });
    const key: GroupKeyType<KeyType> = (groupToKey || DEFAULT_TO_KEY)(
      value,
      data,
    );

    groupKeys.push(key);

    return groupKeys;
  }, [] as any[]);
}
