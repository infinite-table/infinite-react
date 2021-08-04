import { DeepMap } from '../DeepMap';

export type GroupByReducer<T, AggregationResultType> = {
  initialValue: AggregationResultType;
  getter: (data: T) => any;
  reducer: (
    accumulator: any,
    value: any,
    data: T,
  ) => AggregationResultType | any;
  done?: (
    accumulatedValue: AggregationResultType | any,
    array: T[],
  ) => AggregationResultType;
};

function GROUP_TO_KEY<T>(value: T): T | string {
  return value;
}

export interface InfiniteTableEnhancedData<T> {
  data: T | null;
  groupData?: T[];
  value?: any;
  isGroupRow?: boolean;
  groupNesting: number;
  groupKeys?: any[];
  parentGroupKeys?: any[];
  groupCount?: number;
  groupBy?: (keyof T)[];
  reducerResults?: any[];
}

export interface InfiniteTableEnhancedGroupData<T>
  extends InfiniteTableEnhancedData<T> {
  data: null;
  groupData: T[];
  value: any;
  isGroupRow: true;
  groupNesting: number;
  groupKeys?: any[];
  groupCount: number;
  groupBy: (keyof T)[];
}

export type GroupKeyType = any; //string | number | symbol | null | undefined;

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
  options?: {
    reducers?: GroupByReducer<DataType, any>[];
  },
): InfiniteTableEnhancedData<DataType>[] {
  const { groupParams, deepMap } = groupResult;
  const { groupBy } = groupParams;
  const groupByLength = groupBy.length;

  const result: InfiniteTableEnhancedData<DataType>[] = [];

  const reducers = options?.reducers;

  const parents: InfiniteTableEnhancedGroupData<DataType>[] = [];

  deepMap
    .topDownKeys()
    .reduce((acc: InfiniteTableEnhancedData<DataType>[], key) => {
      const items = deepMap.get(key)!;
      const groupKeys = key;

      // console.log(key);

      const groupNesting = key.length;
      const enhancedGroupData: InfiniteTableEnhancedGroupData<DataType> = {
        data: null,
        groupCount: items.length,
        groupData: items,
        groupKeys,
        value: groupKeys[groupKeys.length - 1],
        groupBy: groupBy.slice(0, groupNesting) as (keyof DataType)[],
        isGroupRow: true,
        groupNesting,
        reducerResults:
          reducers && reducers.length > 0
            ? reducers.map((reducer) => reducer.initialValue)
            : undefined,
      };

      // enhancedFlattenGroup(enhancedGroupData, items)
      acc.push(enhancedGroupData);
      parents.push(enhancedGroupData);

      if (groupKeys.length === groupByLength) {
        // console.log(items.length);
        acc.push(
          ...items.map((item) => {
            if (reducers && reducers.length) {
              reducers?.forEach((reducer, index) => {
                parents.forEach((parent) => {
                  const reducerResults = parent.reducerResults!;
                  reducerResults[index] = reducer.reducer(
                    reducerResults[index],
                    reducer.getter(item),
                    item,
                  );
                });
              });
            }
            return {
              data: item,
              isGroupRow: false,
              parentGroupKeys: groupKeys,
              groupBy,
              groupNesting,
            };
          }),
        );

        if (reducers && reducers.length) {
          reducers?.forEach((reducer: GroupByReducer<DataType, any>, index) => {
            if (reducer.done) {
              // parents.forEach((parent) => {
              const reducerResults = enhancedGroupData.reducerResults!;
              reducerResults[index] = reducer.done!(
                reducerResults[index],
                items,
              );
              // });
            }
          });
        }
      }

      return acc;
    }, result);

  return result;
}
