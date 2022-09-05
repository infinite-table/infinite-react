import { DEFAULT_TO_KEY } from './defaultToKey';
import { GroupBy, GroupKeyType } from './types';

export function getGroupKeysForDataItem<DataType, KeyType = any>(
  data: DataType,
  groupBy: GroupBy<DataType, KeyType>[],
) {
  return groupBy.reduce((groupKeys, groupBy) => {
    const { field: groupByProperty, toKey: groupToKey } = groupBy;
    const key: GroupKeyType<KeyType> = (groupToKey || DEFAULT_TO_KEY)(
      data[groupByProperty],
      data,
    );

    groupKeys.push(key);

    return groupKeys;
  }, [] as any[]);
}
