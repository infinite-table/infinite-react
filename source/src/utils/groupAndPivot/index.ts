import { DeepMap } from '../DeepMap';

export type AggregationReducer<T, AggregationResultType> = {
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
  groupNesting?: number;
  groupKeys?: any[];
  parentGroupKeys?: any[];
  indexInGroup?: number;
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

export type GroupBy<DataType> = {
  field: keyof DataType;
  groupToKey?: (value: any, data: DataType) => GroupKeyType;
};

type GroupParams<DataType> = {
  groupBy: GroupBy<DataType>[];
  groupToKey?: (value: any, item: DataType) => GroupKeyType;
};

type DataGroupResult<DataType> = {
  deepMap: DeepMap<GroupKeyType, DataType[]>;
  groupParams: GroupParams<DataType>;
  initialData: DataType[];
};

export function group<DataType>(
  groupParams: GroupParams<DataType>,
  data: DataType[],
): DataGroupResult<DataType> {
  const { groupBy, groupToKey: defaultGroupToKey = GROUP_TO_KEY } = groupParams;

  const groupByLength = groupBy.length;

  const deepMap = new DeepMap<GroupKeyType, DataType[]>();

  let currentKeys: GroupKeyType[] = [];

  for (let i = 0, len = data.length; i < len; i++) {
    let item = data[i];

    for (let groupByIndex = 0; groupByIndex < groupByLength; groupByIndex++) {
      const { field: groupByProperty, groupToKey } = groupBy[groupByIndex];
      const key = (groupToKey || defaultGroupToKey)(
        item[groupByProperty],
        item,
      );

      currentKeys.push(key);

      if (!deepMap.has(currentKeys)) {
        deepMap.set(currentKeys, []);
      }
      deepMap.get(currentKeys)!.push(item);
    }

    currentKeys.length = 0;
  }

  return { deepMap, groupParams, initialData: data };
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

type GetEnhancedGroupDataOptions<DataType> = {
  groupKeys: any[];
  groupBy: (keyof DataType)[];
  groupItems: DataType[];
  reducers?: AggregationReducer<DataType, any>[];
};

function getEnhancedGroupData<DataType>(
  options: GetEnhancedGroupDataOptions<DataType>,
) {
  const { groupItems, groupBy, groupKeys, reducers } = options;
  const groupNesting = groupKeys.length;

  const enhancedGroupData: InfiniteTableEnhancedGroupData<DataType> = {
    data: null,
    groupCount: groupItems.length,
    groupData: groupItems,
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

  return enhancedGroupData;
}

function completeGroupReducers<DataType>(
  enhancedGroupData?: InfiniteTableEnhancedGroupData<DataType>,
  reducers?: AggregationReducer<DataType, any>[],
) {
  if (!enhancedGroupData) {
    return;
  }
  if (reducers && reducers.length) {
    completeReducers(
      reducers,
      enhancedGroupData.reducerResults!,
      enhancedGroupData.groupData,
    );
  }
}

function completeReducers<DataType>(
  reducers: AggregationReducer<DataType, any>[],
  reducerResults: any[],
  items: DataType[],
) {
  if (reducers && reducers.length) {
    reducers?.forEach((reducer: AggregationReducer<DataType, any>, index) => {
      if (reducer.done) {
        reducerResults[index] = reducer.done!(reducerResults[index], items);
      }
    });
  }

  return reducerResults;
}

export function enhancedFlatten<DataType>(
  groupResult: DataGroupResult<DataType>,
  options?: {
    reducers?: AggregationReducer<DataType, any>[];
  },
): { data: InfiniteTableEnhancedData<DataType>[]; reducerResults?: any[] } {
  const { groupParams, deepMap } = groupResult;
  const { groupBy } = groupParams;

  const result: InfiniteTableEnhancedData<DataType>[] = [];

  const reducers = options?.reducers;

  const parents: InfiniteTableEnhancedGroupData<DataType>[] = [];

  const globalReducerResults =
    reducers && reducers.length > 0
      ? reducers.map((reducer) => reducer.initialValue)
      : undefined;

  const visitGroup = (
    items: DataType[],
    groupKeys: any[],
    next?: VoidFunction,
  ) => {
    const groupNesting = groupKeys.length;

    const enhancedGroupData: InfiniteTableEnhancedGroupData<DataType> =
      getEnhancedGroupData({
        groupBy,
        groupItems: items,
        groupKeys,
        reducers,
      });

    result.push(enhancedGroupData);
    parents.push(enhancedGroupData);

    if (!next) {
      result.push(
        ...items.map((item, index) => {
          if (reducers && reducers.length) {
            reducers?.forEach((reducer, index) => {
              const val = reducer.getter(item);
              parents.forEach((parent) => {
                const reducerResults = parent.reducerResults!;

                reducerResults[index] = reducer.reducer(
                  reducerResults[index],
                  val,
                  item,
                );
              });

              globalReducerResults![index] = reducer.reducer(
                globalReducerResults![index],
                val,
                item,
              );
            });
          }

          return {
            data: item,
            isGroupRow: false,
            parentGroupKeys: groupKeys,
            indexInGroup: index,
            groupBy,
            groupNesting,
          };
        }),
      );
    } else {
      next();
    }
    parents.pop();
    completeGroupReducers(enhancedGroupData, reducers);
  };

  deepMap.visitDepthFirst(visitGroup);

  if (globalReducerResults && globalReducerResults.length) {
    completeReducers(reducers!, globalReducerResults, groupResult.initialData);
  }

  return {
    data: result,
    reducerResults: globalReducerResults,
  };
}
