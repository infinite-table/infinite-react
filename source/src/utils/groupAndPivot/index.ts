import {
  DataSourceAggregationReducer,
  DataSourceMappings,
  LazyGroupDataDeepMap,
  LazyGroupRowInfo,
} from '../..';
import { GroupRowsState } from '../../components/DataSource/GroupRowsState';
import {
  InfiniteTableColumn,
  InfiniteTablePivotColumn,
  InfiniteTablePivotFinalColumnGroup,
  InfiniteTablePivotFinalColumnVariant,
} from '../../components/InfiniteTable/types/InfiniteTableColumn';
import {
  InfiniteTableColumnGroup,
  InfiniteTableGroupColumnBase,
} from '../../components/InfiniteTable/types/InfiniteTableProps';
import { DeepMap } from '../DeepMap';

export const LAZY_ROOT_KEY_FOR_GROUPS: string = '____root____';

export type AggregationReducer<
  T,
  AggregationResultType = any,
> = DataSourceAggregationReducer<T, AggregationResultType> & {
  id: string;
};

export type AggregationReducerResult<AggregationResultType extends any = any> =
  {
    value: AggregationResultType;
    id: string;
  };

function DEFAULT_TO_KEY<T>(value: T): T {
  return value;
}

export type InfiniteTableRowInfoNormalType<DataType> = {
  data: DataType;
  isGroupRow: false;
};
export type InfiniteTableRowInfoGroupType<DataType> = {
  data: Partial<DataType> | null;
  isGroupRow: true;
};

export type InfiniteTableRowInfoNormal<T> = InfiniteTableRowInfoBase<T> &
  InfiniteTableRowInfoNormalType<T>;
export type InfiniteTableRowInfoGroup<T> = InfiniteTableRowInfoBase<T> &
  InfiniteTableRowInfoGroupType<T>;
export type InfiniteTableRowInfo<T> =
  | InfiniteTableRowInfoNormal<T>
  | InfiniteTableRowInfoGroup<T>;

export type InfiniteTableRowInfoBase<T> = {
  id: any;
  value?: any;
  groupData?: T[];
  collapsed: boolean;
  collapsedChildrenCount?: number;
  collapsedGroupsCount?: number;
  groupNesting?: number;
  groupKeys?: any[];
  parents?: InfiniteTableEnhancedGroupInfo<T>[];
  indexInParentGroups?: number[];
  indexInGroup: number;
  indexInAll: number;
  groupCount?: number;
  groupBy?: (keyof T)[];
  rootGroupBy?: (keyof T)[];
  pivotValuesMap?: PivotValuesDeepMap<T, any>;
  reducerResults?: Record<string, AggregationReducerResult>;
};

export type InfiniteTableEnhancedGroupInfo<T> = InfiniteTableRowInfo<T> & {
  data: Partial<T> | null;
  groupData: T[];
  value: any;
  isGroupRow: true;
  collapsedChildrenCount: number;
  collapsedGroupsCount: number;
  groupNesting: number;
  groupKeys?: any[];
  groupCount: number;
  groupBy: (keyof T)[];
  rootGroupBy: (keyof T)[];
  pivotValuesMap?: PivotValuesDeepMap<T, any>;
};

export type GroupKeyType<T extends any = any> = T; //string | number | symbol | null | undefined;

type PivotReducerResults<T = any> = Record<string, AggregationReducerResult<T>>;

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
  reducerResults: Record<string, AggregationReducerResult>;
  pivotDeepMap?: DeepMap<
    GroupKeyType<KeyType>,
    PivotGroupValueType<DataType, KeyType>
  >;
};

export type GroupBy<DataType, KeyType> = {
  field: keyof DataType;
  toKey?: (value: any, data: DataType) => GroupKeyType<KeyType>;
  column?: Partial<InfiniteTableGroupColumnBase<DataType>>;
};

export type PivotBy<DataType, KeyType> = Omit<
  GroupBy<DataType, KeyType>,
  'column'
> & {
  column?:
    | InfiniteTableColumn<DataType>
    | (({
        column,
      }: {
        column: InfiniteTablePivotFinalColumnVariant<DataType, KeyType>;
      }) => Partial<InfiniteTablePivotColumn<DataType>>);
  columnGroup?:
    | InfiniteTableColumnGroup
    | (({
        columnGroup,
      }: {
        columnGroup: InfiniteTablePivotFinalColumnGroup<DataType, KeyType>;
      }) => Partial<InfiniteTablePivotFinalColumnGroup<DataType>>);
};

type GroupParams<DataType, KeyType> = {
  groupBy: GroupBy<DataType, KeyType>[];
  defaultToKey?: (value: any, item: DataType) => GroupKeyType<KeyType>;
  pivot?: PivotBy<DataType, KeyType>[];
  reducers?: Record<string, DataSourceAggregationReducer<DataType, any>>;
};

type LazyGroupParams = {
  mappings?: DataSourceMappings;
};

export type DataGroupResult<DataType, KeyType extends any> = {
  deepMap: DeepMap<
    GroupKeyType<KeyType>,
    DeepMapGroupValueType<DataType, KeyType>
  >;
  groupParams: GroupParams<DataType, KeyType>;
  initialData: DataType[];
  reducerResults?: Record<string, AggregationReducerResult>;
  topLevelPivotColumns?: DeepMap<GroupKeyType<KeyType>, boolean>;
  pivot?: PivotBy<DataType, KeyType>[];
};

function initReducers<DataType>(
  reducers?: Record<string, DataSourceAggregationReducer<DataType, any>>,
): Record<string, AggregationReducerResult> {
  if (!reducers || !Object.keys(reducers).length) {
    return {};
  }

  const result: Record<string, AggregationReducerResult> = {};

  for (let key in reducers)
    if (reducers.hasOwnProperty(key)) {
      result[key] = reducers[key].initialValue;
    }

  return result;
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
  reducers: Record<string, DataSourceAggregationReducer<DataType, any>>,
  reducerResults: Record<string, AggregationReducerResult>,
) {
  if (!reducers || !Object.keys(reducers).length) {
    return;
  }

  for (let key in reducers)
    if (reducers.hasOwnProperty(key)) {
      const reducer = reducers[key];
      if (typeof reducer.reducer !== 'function') {
        continue;
      }
      const currentValue = reducerResults[key];

      const value = reducer.field
        ? data[reducer.field]
        : reducer.getter?.(data) ?? null;

      reducerResults[key] = reducer.reducer(currentValue, value, data);
    }
}

type LazyPivotContainer = {
  values: Record<string, any>;
  totals?: Record<string, any>;
};

export function lazyGroup<DataType, KeyType extends string = string>(
  groupParams: GroupParams<DataType, KeyType> & LazyGroupParams,
  rootData: LazyGroupDataDeepMap<DataType>,
): DataGroupResult<DataType, KeyType> {
  const {
    reducers = {},
    pivot,
    groupBy,

    mappings,
  } = groupParams;

  const deepMap = new DeepMap<
    GroupKeyType<KeyType>,
    DeepMapGroupValueType<DataType, KeyType>
  >();

  function traverseValues(
    pivotDeepMap: DeepMap<
      GroupKeyType<KeyType>,
      PivotGroupValueType<DataType, KeyType>
    >,
    container: LazyPivotContainer,
    pivot: PivotBy<DataType, KeyType>[],
    pivotIndex: number = 0,
    currentPivotKeys: KeyType[] = [],
  ) {
    const last = pivotIndex === pivot.length - 1;
    const values = container[(mappings?.values || 'values') as 'values'] || {};
    for (var k in values)
      if (values.hasOwnProperty(k)) {
        const pivotKey = k;
        currentPivotKeys.push(pivotKey as any as KeyType);

        topLevelPivotColumns!.set(currentPivotKeys, true);
        pivotDeepMap.set(currentPivotKeys, {
          reducerResults: values[k][mappings?.totals || 'totals'] || {},
          items: [],
        });

        if (!last) {
          traverseValues(
            pivotDeepMap,
            values[k],
            pivot,
            pivotIndex + 1,
            currentPivotKeys,
          );
        }

        currentPivotKeys.pop();
      }
  }

  const topLevelPivotColumns = pivot
    ? new DeepMap<GroupKeyType<KeyType>, boolean>()
    : undefined;

  let currentPivotKeys: GroupKeyType<KeyType>[] = [];

  const initialReducerValue = initReducers<DataType>(reducers);

  const globalReducerResults = { ...initialReducerValue };

  rootData.visitDepthFirst(
    (lazyGroupRowInfo: LazyGroupRowInfo<DataType>, keys, _index, next) => {
      const [_rootKey, ...currentGroupKeys] = keys;
      // const currentPivotKeys = [...currentGroupKeys] as KeyType[];

      const dataArray = lazyGroupRowInfo.items;
      for (let i = 0, len = dataArray.length; i < len; i++) {
        if (!dataArray[i]) {
          // we're in the case of lazy loading, so some records might not be available just yet
          const deepMapGroupValue: DeepMapGroupValueType<DataType, KeyType> = {
            items: [],
            reducerResults: {},
          };
          deepMap.set(
            [...currentGroupKeys, `not-loaded-yet-${i}`] as KeyType[],
            deepMapGroupValue,
          );
          continue;
        }
        const dataObject = dataArray[i].data;
        const dataKeys = dataArray[i].keys;
        let item = dataObject as Partial<DataType>;

        const { field: groupByProperty } = groupBy[dataKeys.length - 1];
        const key = item[groupByProperty]! as any as GroupKeyType<KeyType>;

        currentGroupKeys.push(key);

        const deepMapGroupValue: DeepMapGroupValueType<DataType, KeyType> = {
          items: [],
          reducerResults: dataArray[i].aggregations || {},
        };
        deepMap.set(currentGroupKeys as KeyType[], deepMapGroupValue);
        if (pivot) {
          const pivotDeepMap = (deepMapGroupValue.pivotDeepMap = new DeepMap<
            GroupKeyType<KeyType>,
            PivotGroupValueType<DataType, KeyType>
          >());

          const pivotContainer = dataArray[i]
            .pivot as any as LazyPivotContainer;

          traverseValues(
            pivotDeepMap,
            pivotContainer,
            pivot,
            0,
            currentPivotKeys,
          );
        }

        currentGroupKeys.pop();
      }

      next?.();
    },
  );

  const result: DataGroupResult<DataType, KeyType> = {
    deepMap,
    groupParams,
    //@ts-ignore
    initialData: rootData,

    reducerResults: globalReducerResults,
  };

  if (pivot) {
    result.topLevelPivotColumns = topLevelPivotColumns;
    result.pivot = pivot;
  }

  return result;
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

  const globalReducerResults = { ...initialReducerValue };

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
          reducerResults: { ...initialReducerValue },
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
              reducerResults: { ...initialReducerValue },
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
    deepMap.visitDepthFirst(
      (deepMapValue, _keys: KeyType[], _indexInGroup, next) => {
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
              _indexInGroup,
              next,
            ) => {
              completeReducers(reducers, pivotReducerResults, items);
              next?.();
            },
          );
        }
        next?.();
      },
    );
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
  parents: InfiniteTableEnhancedGroupInfo<DataType>[];
  indexInParentGroups: number[];
  indexInGroup: number;
  indexInAll: number;
  reducers: Record<string, DataSourceAggregationReducer<DataType, any>>;
};

function getEnhancedGroupData<DataType>(
  options: GetEnhancedGroupDataOptions<DataType>,
  deepMapValue: DeepMapGroupValueType<DataType, any>,
) {
  const { groupBy, groupKeys, collapsed, parents, reducers } = options;
  const groupNesting = groupKeys.length;
  const { items: groupItems, reducerResults, pivotDeepMap } = deepMapValue;

  let data = null as Partial<DataType> | null;

  if (Object.keys(reducerResults).length > 0) {
    data = {} as Partial<DataType>;
    for (let key in reducers)
      if (reducers.hasOwnProperty(key)) {
        const reducer = reducers[key];

        const field = reducer.field as keyof DataType;
        if (field) {
          data[field] = reducerResults[key] as any;
        }
      }
  }

  const enhancedGroupData: InfiniteTableEnhancedGroupInfo<DataType> = {
    data,
    groupCount: groupItems.length,
    groupData: groupItems,
    groupKeys,
    id: groupKeys,
    collapsed,
    parents,
    collapsedChildrenCount: 0,
    collapsedGroupsCount: 0,
    indexInParentGroups: options.indexInParentGroups,
    indexInGroup: options.indexInGroup,
    indexInAll: options.indexInAll,
    value: groupKeys[groupKeys.length - 1],
    rootGroupBy: groupBy,
    groupBy:
      groupNesting === groupBy.length
        ? groupBy
        : (groupBy.slice(0, groupNesting) as (keyof DataType)[]),
    isGroupRow: true,
    pivotValuesMap: pivotDeepMap,
    groupNesting,
    reducerResults,
  };

  return enhancedGroupData;
}

function completeReducers<DataType>(
  reducers: Record<string, DataSourceAggregationReducer<DataType, any>>,
  reducerResults: Record<string, AggregationReducerResult>,
  items: DataType[],
) {
  if (reducers) {
    for (let key in reducers)
      if (reducers.hasOwnProperty(key)) {
        const reducer = reducers[key];
        if (reducer.done) {
          reducerResults[key] = reducer.done!(reducerResults[key], items);
        }
      }
  }

  return reducerResults;
}

export type EnhancedFlattenParam<DataType, KeyType = any> = {
  groupResult: DataGroupResult<DataType, KeyType>;
  toPrimaryKey: (data: DataType) => any;
  groupRowsState?: GroupRowsState;
  reducers?: Record<string, DataSourceAggregationReducer<DataType, any>>;
  generateGroupRows: boolean;
};
export function enhancedFlatten<DataType, KeyType = any>(
  param: EnhancedFlattenParam<DataType, KeyType>,
): { data: InfiniteTableRowInfo<DataType>[] } {
  const {
    groupResult,
    toPrimaryKey,
    groupRowsState,
    generateGroupRows,
    reducers = {},
  } = param;
  const { groupParams, deepMap, pivot } = groupResult;
  const { groupBy } = groupParams;

  const groupByStrings = groupBy.map((g) => g.field);

  const result: InfiniteTableRowInfo<DataType>[] = [];

  const parents: InfiniteTableEnhancedGroupInfo<DataType>[] = [];
  const indexInParentGroups: number[] = [];

  deepMap.visitDepthFirst(
    (deepMapValue, groupKeys: any[], indexInGroup, next?: () => void) => {
      const items = deepMapValue.items;

      const groupNesting = groupKeys.length;

      const collapsed = groupRowsState?.isGroupRowCollapsed(groupKeys) ?? false;

      const enhancedGroupData: InfiniteTableEnhancedGroupInfo<DataType> =
        getEnhancedGroupData(
          {
            groupBy: groupByStrings,
            parents: Array.from(parents),
            reducers,
            indexInGroup,
            indexInParentGroups: Array.from(indexInParentGroups),
            indexInAll: result.length,
            groupKeys,
            collapsed,
          },
          deepMapValue,
        );

      const include = generateGroupRows || collapsed;
      if (include) {
        result.push(enhancedGroupData);
      }

      if (collapsed) {
        parents.forEach((parent) => {
          parent.collapsedChildrenCount += enhancedGroupData.groupCount;
          parent.collapsedGroupsCount += 1;
        });
      }

      indexInParentGroups.push(indexInGroup);
      parents.push(enhancedGroupData);

      if (!collapsed) {
        if (!next) {
          if (!pivot) {
            const startIndex = result.length;

            result.push(
              ...items.map((item, index) => {
                return {
                  id: toPrimaryKey(item),
                  data: item,
                  isGroupRow: false,
                  collapsed: false,
                  groupKeys,
                  parents: Array.from(parents),
                  indexInParentGroups: [...indexInParentGroups, index],
                  indexInGroup: index,
                  indexInAll: startIndex + index,
                  groupBy: groupByStrings,
                  groupNesting,
                  groupCount: enhancedGroupData.groupCount,
                };
              }),
            );
          }
        } else {
          next();
        }
      }
      parents.pop();
      indexInParentGroups.pop();
    },
  );

  return {
    data: result,
  };
}
