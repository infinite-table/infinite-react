import { InfiniteTableColumn } from '../..';
import { GroupRowsState } from '../../components/DataSource/GroupRowsState';
import {
  InfiniteTableColumnGroup,
  InfiniteTablePropColumnGroups,
  InfiniteTablePropColumns,
} from '../../components/InfiniteTable/types/InfiniteTableProps';
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
  collapsed: boolean;
  groupNesting?: number;
  groupKeys?: any[];
  parentGroupKeys?: any[];
  indexInGroup?: number;
  groupCount?: number;
  groupBy?: (keyof T)[];
  pivotValuesMap?: PivotValuesDeepMap<T, any>;
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
  pivotValuesMap?: PivotValuesDeepMap<T, any>;
}

export type GroupKeyType<T extends any = any> = T; //string | number | symbol | null | undefined;

type PivotReducerResults<T = any> = T[];

type PivotGroupValueType<DataType, KeyType> = {
  reducerResults: PivotReducerResults<KeyType>;
  items: DataType[];
};

export type PivotValuesDeepMap<DataType, KeyType> = DeepMap<
  GroupKeyType<KeyType>,
  PivotGroupValueType<DataType, KeyType>
>;

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
  topLevelPivotColumns?: DeepMap<GroupKeyType<KeyType>, boolean>;
  pivot?: PivotBy<DataType, KeyType>[];
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

  const topLevelPivotColumns = pivot
    ? new DeepMap<GroupKeyType<KeyType>, boolean>()
    : undefined;

  const deepMap = new DeepMap<
    GroupKeyType<KeyType>,
    DeepMapGroupValueType<DataType, KeyType>
  >();

  let currentGroupKeys: GroupKeyType<KeyType>[] = [];
  let currentPivotKeys: GroupKeyType<KeyType>[] = [];

  const initialReducerValue = initReducers<DataType>(reducers);

  const globalReducerResults = [...initialReducerValue];

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
          reducerResults: [...initialReducerValue],
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

          currentPivotKeys.push(pivotKey);
          if (!pivotDeepMap!.has(currentPivotKeys)) {
            topLevelPivotColumns!.set(currentPivotKeys, true);
            pivotDeepMap?.set(currentPivotKeys, {
              reducerResults: [...initialReducerValue],
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

    if (reducers) {
      computeReducersFor<DataType>(item, reducers, globalReducerResults);
    }

    currentGroupKeys.length = 0;
  }

  if (reducers) {
    deepMap.visitDepthFirst((deepMapValue, _keys: KeyType[], next) => {
      completeReducers(
        reducers,
        deepMapValue.reducerResults,
        deepMapValue.items,
      );

      if (pivot) {
        // do we need this check
        deepMapValue.pivotDeepMap!.visitDepthFirst(
          (
            { items, reducerResults: pivotReducerResults },
            _keys: KeyType[],
            next,
          ) => {
            completeReducers(reducers, pivotReducerResults, items);
            next?.();
          },
        );
      }
      next?.();
    });
  }

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
    result.topLevelPivotColumns = topLevelPivotColumns;
    result.pivot = pivot;
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
  collapsed: boolean;
};

function getEnhancedGroupData<DataType>(
  options: GetEnhancedGroupDataOptions<DataType>,
  deepMapValue: DeepMapGroupValueType<DataType, any>,
) {
  const { groupBy, groupKeys, collapsed } = options;
  const groupNesting = groupKeys.length;
  const { items: groupItems, reducerResults, pivotDeepMap } = deepMapValue;

  const enhancedGroupData: InfiniteTableEnhancedGroupData<DataType> = {
    data: null,
    groupCount: groupItems.length,
    groupData: groupItems,
    groupKeys,
    collapsed,
    value: groupKeys[groupKeys.length - 1],
    groupBy: groupBy.slice(0, groupNesting) as (keyof DataType)[],
    isGroupRow: true,
    pivotValuesMap: pivotDeepMap,
    groupNesting,
    reducerResults,
  };

  return enhancedGroupData;
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
  groupRowsState?: GroupRowsState,
): { data: InfiniteTableEnhancedData<DataType>[] } {
  const { groupParams, deepMap, pivot } = groupResult;
  const { groupBy } = groupParams;

  const groupByStrings = groupBy.map((g) => g.field);

  const result: InfiniteTableEnhancedData<DataType>[] = [];

  const parents: InfiniteTableEnhancedGroupData<DataType>[] = [];

  deepMap.visitDepthFirst(
    (deepMapValue, groupKeys: any[], next?: () => void) => {
      const items = deepMapValue.items;

      const groupNesting = groupKeys.length;

      const collapsed = groupRowsState?.isGroupRowCollapsed(groupKeys) ?? false;
      const enhancedGroupData: InfiniteTableEnhancedGroupData<DataType> =
        getEnhancedGroupData(
          {
            groupBy: groupByStrings,
            groupKeys,
            collapsed,
          },
          deepMapValue,
        );

      result.push(enhancedGroupData);
      parents.push(enhancedGroupData);

      if (!collapsed) {
        if (!next) {
          if (!pivot) {
            result.push(
              ...items.map((item, index) => {
                return {
                  data: item,
                  isGroupRow: false,
                  collapsed: false,
                  parentGroupKeys: groupKeys,
                  indexInGroup: index,
                  groupBy: groupByStrings,
                  groupNesting,
                };
              }),
            );
          }
        } else {
          next();
        }
      }
      parents.pop();
    },
  );

  return {
    data: result,
  };
}

export type ComputedColumnsAndGroups<DataType> = {
  columns: InfiniteTablePropColumns<DataType>;
  columnGroups: InfiniteTablePropColumnGroups;
};

export function getPivotColumnsAndColumnGroups<DataType, KeyType = any>(
  deepMap: DeepMap<KeyType, boolean>,
  pivotLength: number,
): ComputedColumnsAndGroups<DataType> {
  const columns: InfiniteTablePropColumns<DataType> = new Map<
    string,
    InfiniteTableColumn<DataType>
  >([
    [
      'labels',
      {
        header: 'Row labels',
        render: ({ enhancedData }) => {
          return enhancedData.groupKeys?.join(' >> ');
        },
      },
    ],
  ]);
  const columnGroups: InfiniteTablePropColumnGroups = new Map<
    string,
    InfiniteTableColumnGroup
  >();

  deepMap.topDownKeys().forEach((keys: KeyType[]) => {
    keys = [...keys];

    if (keys.length === pivotLength) {
      const parentKeys = keys.slice(0, -1);
      let columnGroupId = parentKeys.join('/');
      columns.set(`${keys.join('/')}`, {
        columnGroup: parentKeys.length ? `${columnGroupId}` : undefined,
        header: keys[keys.length - 1],
        render: ({ enhancedData }) => {
          const value =
            enhancedData.pivotValuesMap?.get(keys)?.reducerResults[0] ?? null;

          return value;
        },
      });
    } else {
      const colGroupId = keys.join('/');
      const parentKeys = keys.slice(0, -1);

      columnGroups.set(colGroupId, {
        columnGroup: parentKeys.length ? parentKeys.join('/') : undefined,
        header: keys.join(' >> '),
      });
    }
  });

  if (columns.size === 1) {
    columns.set('single', {
      header: 'Reduced',
      render: ({ enhancedData }) => {
        return `${enhancedData.reducerResults?.[0]}`;
      },
    });
  }

  const result = {
    columns,
    columnGroups,
  };

  return result;
}
