import { InfiniteTableEnhancedData } from '../../components/InfiniteTable';
import { DeepMap } from '../DeepMap';

const GROUP_TO_KEY = (value: any) => value;

type GroupKeyType = any; //string | number | symbol | null | undefined;

type GroupParams<DataType> = {
  groupBy: (keyof DataType)[];
  groupToKey?: (value: any, item: DataType) => GroupKeyType;
};

type DataGroupResult<DataType> = {
  deepMap: DeepMap<GroupKeyType, DataType[]>;
  groupParams: GroupParams<DataType>;
};

export function group<DataType>(
  groupParams: GroupParams<DataType>,
  data: DataType[],
): DataGroupResult<DataType> {
  const { groupBy, groupToKey = GROUP_TO_KEY } = groupParams;

  const groupByLength = groupBy.length;

  const deepMap = new DeepMap<GroupKeyType, DataType[]>();

  let currentKeys: GroupKeyType[] = [];

  for (let i = 0, len = data.length; i < len; i++) {
    let item = data[i];

    for (let groupByIndex = 0; groupByIndex < groupByLength; groupByIndex++) {
      const groupByProperty = groupBy[groupByIndex];
      const key = groupToKey(item[groupByProperty], item);

      currentKeys.push(key);

      if (!deepMap.has(currentKeys)) {
        deepMap.set(currentKeys, []);
      }
      deepMap.get(currentKeys)!.push(item);
    }

    currentKeys.length = 0;
  }

  return { deepMap, groupParams };
}

export function flatten<DataType>(
  groupResult: DataGroupResult<DataType>,
): DataType[] {
  const { groupParams, deepMap } = groupResult;
  const groupByLength = groupParams.groupBy.length;

  const result: DataType[] = [];

  deepMap.topDownKeys().reduce((acc: DataType[], key) => {
    if (key.length === groupByLength) {
      const items = deepMap.get(key)!;
      acc.push(...items);
    }

    return acc;
  }, result);

  return result;
}

export function enhancedFlatten<DataType>(
  groupResult: DataGroupResult<DataType>,
): InfiniteTableEnhancedData<DataType>[] {
  const { groupParams, deepMap } = groupResult;
  const groupByLength = groupParams.groupBy.length;

  const result: InfiniteTableEnhancedData<DataType>[] = [];

  deepMap
    .topDownKeys()
    .reduce((acc: InfiniteTableEnhancedData<DataType>[], key) => {
      const items = deepMap.get(key)!;

      acc.push({
        data: null,
        groupCount: items.length,
        groupData: items,
        groupKeys: key,
        value: key[key.length - 1],
        isGroupRow: true,
        groupNesting: key.length,
      });
      if (key.length === groupByLength) {
        acc.push(
          ...items.map((item) => {
            return { data: item, isGroupRow: false };
          }),
        );
      }

      return acc;
    }, result);

  return result;
}
