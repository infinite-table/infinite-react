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

function DEFAULT_TO_KEY<T>(value: T): T {
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

export type GroupKeyType<T extends any> = T; //string | number | symbol | null | undefined;

type PivotReducerResults<T = any> = T[];

type PivotGroupValueType<DataType, KeyType> = {
  reducerResults: PivotReducerResults<KeyType>;
  items: DataType[];
};

export type DeepMapGroupValueType<DataType, KeyType> = {
  items: DataType[];
  reducerResults: any[];
  pivotDeepMap?: DeepMap<
    GroupKeyType<KeyType>,
    PivotGroupValueType<DataType, KeyType>
  >;
};

export type GroupBy<DataType, KeyType> = {
  field: keyof DataType;
  toKey?: (value: any, data: DataType) => GroupKeyType<KeyType>;
};

export type PivotBy<DataType, KeyType> = GroupBy<DataType, KeyType>;

type GroupParams<DataType, KeyType> = {
  groupBy: GroupBy<DataType, KeyType>[];
  defaultToKey?: (value: any, item: DataType) => GroupKeyType<KeyType>;
  pivot?: PivotBy<DataType, KeyType>[];
  reducers?: AggregationReducer<DataType, any>[];
};

export type DataGroupResult<DataType, KeyType extends any> = {
  deepMap: DeepMap<
    GroupKeyType<KeyType>,
    DeepMapGroupValueType<DataType, KeyType>
  >;
  groupParams: GroupParams<DataType, KeyType>;
  initialData: DataType[];
  reducerResults?: any[];
  topLevelPivotSet?: Set<GroupKeyType<KeyType>>;
};

function initReducers<DataType>(
  reducers?: AggregationReducer<DataType, any>[],
): any[] {
  if (!reducers || !reducers.length) {
    return [];
  }

  return reducers.map((reducer) => reducer.initialValue);
}

/**
 *
 * This fn mutates the reducerResults array!!!
 *
 * @param data data item
 * @param reducers an array of reducers
 * @param reducerResults the results on which to operate
 *
 */
function computeReducersFor<DataType>(
  data: DataType,
  reducers: AggregationReducer<DataType, any>[],
  reducerResults: any[],
) {
  if (!reducers || !reducers.length) {
    return;
  }

  reducers.forEach((reducer, index) => {
    const currentValue = reducerResults[index];

    reducerResults[index] = reducer.reducer(
      currentValue,
      reducer.getter(data),
      data,
    );
  });
}

export function group<DataType, KeyType = any>(
  groupParams: GroupParams<DataType, KeyType>,
  data: DataType[],
): DataGroupResult<DataType, KeyType> {
  const {
    groupBy,
    defaultToKey = DEFAULT_TO_KEY,
    pivot,
    reducers,
  } = groupParams;

  const groupByLength = groupBy.length;

  const topLevelPivotSet = pivot ? new Set<GroupKeyType<KeyType>>() : undefined;

  const deepMap = new DeepMap<
    GroupKeyType<KeyType>,
    DeepMapGroupValueType<DataType, KeyType>
  >();

  let currentGroupKeys: GroupKeyType<KeyType>[] = [];
  let currentPivotKeys: GroupKeyType<KeyType>[] = [];

  const globalReducerResults = initReducers<DataType>(reducers);

  for (let i = 0, len = data.length; i < len; i++) {
    let item = data[i];

    for (let groupByIndex = 0; groupByIndex < groupByLength; groupByIndex++) {
      const { field: groupByProperty, toKey: groupToKey } =
        groupBy[groupByIndex];
      const key: GroupKeyType<KeyType> = (groupToKey || defaultToKey)(
        item[groupByProperty],
        item,
      );

      currentGroupKeys.push(key);

      if (!deepMap.has(currentGroupKeys)) {
        const deepMapGroupValue: DeepMapGroupValueType<DataType, KeyType> = {
          items: [],
          reducerResults: initReducers<DataType>(reducers),
        };
        if (pivot) {
          deepMapGroupValue.pivotDeepMap = new DeepMap<
            GroupKeyType<KeyType>,
            PivotGroupValueType<DataType, KeyType>
          >();
        }
        deepMap.set(currentGroupKeys, deepMapGroupValue);
      }

      const {
        items: currentGroupItems,
        reducerResults,
        pivotDeepMap,
      } = deepMap.get(currentGroupKeys)!;

      currentGroupItems.push(item);

      if (reducers) {
        computeReducersFor<DataType>(item, reducers, reducerResults);
        computeReducersFor<DataType>(item, reducers, globalReducerResults);
      }
      if (pivot) {
        for (
          let pivotIndex = 0, pivotLength = pivot.length;
          pivotIndex < pivotLength;
          pivotIndex++
        ) {
          const { field: pivotField, toKey: pivotToKey } = pivot[pivotIndex];
          const pivotKey: GroupKeyType<KeyType> = (pivotToKey || defaultToKey)(
            item[pivotField],
            item,
          );

          if (pivotIndex === 0) {
            topLevelPivotSet!.add(pivotKey);
          }
          currentPivotKeys.push(pivotKey);
          if (!pivotDeepMap!.has(currentPivotKeys)) {
            pivotDeepMap?.set(currentPivotKeys, {
              reducerResults: initReducers<DataType>(reducers),
              items: [],
            });
          }
          const {
            reducerResults: pivotReducerResults,
            items: pivotGroupItems,
          } = pivotDeepMap!.get(currentPivotKeys)!;

          pivotGroupItems.push(item);
          if (reducers) {
            computeReducersFor<DataType>(item, reducers, pivotReducerResults);
          }
        }
        currentPivotKeys.length = 0;
      }
    }

    currentGroupKeys.length = 0;
  }

  deepMap.visitDepthFirst((deepMapValue, keys: KeyType[], next) => {
    if (reducers) {
      completeReducers(
        reducers,
        deepMapValue.reducerResults,
        deepMapValue.items,
      );
    }
    if (pivot) {
      if (reducers) {
        // do we need this check
        deepMapValue.pivotDeepMap!.visitDepthFirst(
          (
            { items, reducerResults: pivotReducerResults },
            keys: KeyType[],
            next,
          ) => {
            completeReducers(reducers, pivotReducerResults, items);
            next?.();
          },
        );
      }
    }
    next?.();
  });

  if (reducers) {
    completeReducers(reducers, globalReducerResults, data);
  }

  const result: DataGroupResult<DataType, KeyType> = {
    deepMap,
    groupParams,
    initialData: data,
    reducerResults: globalReducerResults,
  };
  if (pivot) {
    result.topLevelPivotSet = topLevelPivotSet;
  }

  return result;
}

export function flatten<DataType, KeyType extends any>(
  groupResult: DataGroupResult<DataType, KeyType>,
): DataType[] {
  const { groupParams, deepMap } = groupResult;
  const groupByLength = groupParams.groupBy.length;

  const result: DataType[] = [];

  deepMap.topDownKeys().reduce((acc: DataType[], key) => {
    if (key.length === groupByLength) {
      const items = deepMap.get(key)!.items;
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

export function enhancedFlatten<DataType, KeyType = any>(
  groupResult: DataGroupResult<DataType, KeyType>,
  options?: {
    reducers?: AggregationReducer<DataType, any>[];
  },
): { data: InfiniteTableEnhancedData<DataType>[]; reducerResults?: any[] } {
  const { groupParams, deepMap } = groupResult;
  const { groupBy } = groupParams;

  const groupByStrings = groupBy.map((g) => g.field);

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
        groupBy: groupByStrings,
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
            groupBy: groupByStrings,
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
