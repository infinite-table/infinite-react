import { RowSelectionState } from '../../components/DataSource';
import { GroupRowsState } from '../../components/DataSource/GroupRowsState';
import { Indexer } from '../../components/DataSource/Indexer';

import {
  ColumnTypeWithInherit,
  DataSourceAggregationReducer,
  DataSourceMappings,
  LazyGroupDataDeepMap,
  LazyRowInfoGroup,
} from '../../components/DataSource/types';
import {
  InfiniteTableColumn,
  InfiniteTablePivotColumn,
  InfiniteTablePivotFinalColumnGroup,
  InfiniteTablePivotFinalColumnVariant,
} from '../../components/InfiniteTable/types/InfiniteTableColumn';
import type { InfiniteTableColumnGroup } from '../../components/InfiniteTable/types/InfiniteTableProps';
import type { GroupBy } from './types';
import { deepClone } from '../deepClone';
import { DeepMap } from '../DeepMap';
import { DEFAULT_TO_KEY } from './defaultToKey';
import { KeyOfNoSymbol } from '../../components/InfiniteTable/types/Utility';
import { DataSourceCache } from '../../components/DataSource/DataSourceCache';

export const LAZY_ROOT_KEY_FOR_GROUPS = '____root____';

export const NOT_LOADED_YET_KEY_PREFIX = '____not_loaded_yet____';

export type AggregationReducer<
  T,
  AggregationResultType = any,
> = DataSourceAggregationReducer<T, AggregationResultType> & {
  id: string;
};

export type AggregationReducerResult<AggregationResultType extends any = any> =
  AggregationResultType;
// {
//   value: AggregationResultType;
//   id: string;
// };

/**
 * InfiniteTableRowInfo can have different object shape depending on the presence or absence of grouping.
 *
 * You can use `dataSourceHasGrouping: boolean` as a discriminator to determine the shape of the object, to know
 * if the dataSource had grouping or not. Furthermore, for when the dataSource has grouping,
 * you can use `isGroupRow: boolean` to discriminate between group rows vs normal rows.
 *
 */
export type InfiniteTableRowInfo<T> =
  | InfiniteTable_HasGrouping_RowInfoNormal<T>
  | InfiniteTable_HasGrouping_RowInfoGroup<T>
  | InfiniteTable_NoGrouping_RowInfoNormal<T>;

export type InfiniteTableRowInfoDataDiscriminator_RowInfoNormal<T> = {
  data: T;
  isGroupRow: false;
  rowActive: boolean;
  rowInfo:
    | InfiniteTable_NoGrouping_RowInfoNormal<T>
    | InfiniteTable_HasGrouping_RowInfoNormal<T>;
  field?: keyof T;
  value: any;
  rawValue: any;
  rowSelected: boolean | null;
};

export type InfiniteTableRowInfoDataDiscriminator_RowInfoGroup<T> = {
  rowActive: boolean;
  data: Partial<T> | null;
  rowInfo: InfiniteTable_HasGrouping_RowInfoGroup<T>;
  isGroupRow: true;
  field?: keyof T;
  value: any;
  rawValue: any;
  rowSelected: boolean | null;
};
export type InfiniteTableRowInfoDataDiscriminator<T> =
  | InfiniteTableRowInfoDataDiscriminator_RowInfoNormal<T>
  | InfiniteTableRowInfoDataDiscriminator_RowInfoGroup<T>;

/**
 * This is the base row info for all scenarios - things every
 * rowInfo is guaranteed to have (be it group or normal row, or dataSource with or without grouping)
 *
 */
export type InfiniteTable_RowInfoBase<_T> = {
  id: any;
  value?: any;
  indexInAll: number;
  rowSelected: boolean | null;
};

export type InfiniteTable_HasGrouping_RowInfoNormal<T> = {
  dataSourceHasGrouping: true;
  data: T;
  isGroupRow: false;
} & InfiniteTable_HasGrouping_RowInfoBase<T> &
  InfiniteTable_RowInfoBase<T>;

export type InfiniteTable_HasGrouping_RowInfoGroup<T> = {
  dataSourceHasGrouping: true;
  data: Partial<T> | null;
  isGroupRow: true;

  /**
   * This array contains all the (uncollapsed, so visible) row infos under this group, at any level of nesting,
   * in the order in which they are visible in the table
   */
  deepRowInfoArray: (
    | InfiniteTable_HasGrouping_RowInfoNormal<T>
    | InfiniteTable_HasGrouping_RowInfoGroup<T>
  )[];

  error?: string;

  reducerResults?: Record<string, AggregationReducerResult>;

  /**
   * The count of all leaf nodes (normal rows) that are inside this group.
   * This count is the same as the length of the groupData array property.
   *
   */
  groupCount: number;

  /**
   * The array of all leaf nodes (normal rows) that are inside this group.
   */
  groupData: T[];

  /**
   * The count of all selected leaf nodes (normal rows) inside the group that are selected
   */
  selectedChildredCount: number;

  /**
   * The count of all deselected leaf nodes (normal rows) inside the group that are selected
   */
  deselectedChildredCount: number;

  /**
   * Will be used only with lazy loading, if the server provides this info on the data items.
   *
   * Represents the total count of all leaf nodes (normal rows) that are under this group
   * at any level (so not only direct children). This is needed for multiple selection to work properly,
   * so the table component knows how many rows are on the remote backend, and whether to show a group as selected or not
   * when it has a certain number of rows selected
   */
  totalChildrenCount?: number;

  /**
   * The count of all leaf nodes (normal rows) inside the group that are not being visible
   * due to collapsing (either the current row is collapsed or any of its children)
   */
  collapsedChildrenCount: number;

  // TODO document this
  collapsedGroupsCount: number;

  /**
   * The count of the direct children of the current group. Direct children can be either normal rows or groups.
   */
  directChildrenCount: number;

  directChildrenLoadedCount: number;

  /**
   *
   * A DeepMap of pivot values.
   *
   * For each pivot reducer result, it contains all the items that make up the pivot value.
   *
   */
  pivotValuesMap?: PivotValuesDeepMap<T, any>;

  /**
   * For non-lazy grouping, this is always true.
   * For lazy/batched grouping, this is true if the group has been expanded at least once (and if the remote call has been configured with cache: true),
   * since if the remote call is not cached, collapsing the row group should lose all the data that was loaded for it, and it's as if it was never loaded, so in that case, childrenAvailable is false.
   *
   * NOTE: if this is true, it doesn't mean that all the children have been loaded, it only means that some children have been loaded and are available
   *
   * Use directChildrenCount and directChildrenLoadedCount to know if all the children have been loaded or not.
   */
  childrenAvailable: boolean;

  /**
   * Boolean flag that will be true while lazy loading direct children of the current row group.
   *
   * NOTE: with batched loading, if the user is no longer scrolling, after everything
   * in the viewport has loaded (and thus for example a certain row group had childrenLoading: true)
   * if no new batches are being loaded, childrenLoading will be false again, even though
   * the current row group still has children that are not loaded yet.
   * Use directChildrenLoadedCount and directChildrenCount to know if all the children have been loaded or not.
   */
  childrenLoading: boolean;
} & InfiniteTable_HasGrouping_RowInfoBase<T> &
  InfiniteTable_RowInfoBase<T>;

export type InfiniteTable_NoGrouping_RowInfoNormal<T> = {
  dataSourceHasGrouping: false;
  data: T;
  isGroupRow: false;
  selfLoaded: boolean;
} & InfiniteTable_RowInfoBase<T>;

export type InfiniteTable_HasGrouping_RowInfoBase<T> = {
  indexInGroup: number;

  /**
   * Available on all rowInfo objects when the datasource is grouped, otherwise, it will be undefined.
   *
   * For group rows, the group keys will have all the keys starting from the topmost parent
   * down to the current group row (including the group row).
   * For normal rows, the group keys will have all the keys starting from the topmost parent
   * down to the last group row in the hierarchy (the direct parent of the current row).
   *
   * Example: People grouped by country and city
   *
   * Italy  - country         - groupKeys: ['Italy']
   *    Rome - city           - groupKeys: ['Italy', 'Rome']
   *      Marco    - person   - groupKeys: ['Italy', 'Rome']
   *      Luca     - person   - groupKeys: ['Italy', 'Rome']
   *      Giuseppe  - person  - groupKeys: ['Italy', 'Rome']
   *
   */
  groupKeys: any[];

  /**
   * Available on all rowInfo objects when the datasource is grouped, otherwise, it will be undefined.
   *
   * Has the same structure as groupKeys, but it will contain the fields used to group the rows.
   *
   * Example: People grouped by country and city
   *
   * Italy  - country         - groupKeys: ['country']
   *    Rome - city           - groupKeys: ['country', 'city']
   *      Marco    - person   - groupKeys: ['country', 'city']
   *      Luca     - person   - groupKeys: ['country', 'city']
   *      Giuseppe  - person  - groupKeys: ['country', 'city']
   */
  groupBy: (keyof T)[];

  /**
   * The groupBy value of the DataSource component, mapped to the groupBy.field
   */
  rootGroupBy: (keyof T)[];

  /**
   * Available on all rowInfo objects when the datasource is grouped.
   *
   * Italy  - country         - parent mapped to their ids will be: [] // rowInfo.parents.map((p: any) => p.id)
   *    Rome - city           - parent mapped to their ids will be: ['Italy']
   *      Marco    - person   - parent mapped to their ids will be: ['Italy','Italy,Rome']
   *      Luca     - person   - parent mapped to their ids will be: ['Italy','Italy,Rome']
   *      Giuseppe  - person  - parent mapped to their ids will be: ['Italy','Italy,Rome']
   * USA - country            - parent mapped to their ids will be: []
   *    LA - city             - parent mapped to their ids will be: ['USA']
   *      Bob  - person       - parent mapped to their ids will be: ['USA','USA,LA']
   */
  parents: InfiniteTable_HasGrouping_RowInfoGroup<T>[];

  /**
   * Available when the datasource is grouped, this will be set for both group and normal rows.
   * Italy  - country         - indexInParentGroups: [0]
   *    Rome - city           - indexInParentGroups: [0,0]
   *      Marco    - person   - indexInParentGroups: [0,0,0]
   *      Luca     - person   - indexInParentGroups: [0,0,1]
   *      Giuseppe  - person  - indexInParentGroups: [0,0,2]
   * USA - country            - indexInParentGroups: [1]
   *    LA - city             - indexInParentGroups: [1,0]
   *      Bob  - person       - indexInParentGroups: [1,0,2]
   */
  indexInParentGroups: number[];

  /**
   * Available on all rowInfo objects when the datasource is grouped.
   *
   * For every rowInfo object, it counts the number of leaf/normal rows that the group contains.
   * For normal rows, the groupCount represents the groupCount of the direct parent.
   *
   * Italy  - country         - groupCount: 3
   *    Rome - city           - groupCount: 2
   *      Marco    - person   - groupCount: 2
   *      Luca     - person   - groupCount: 2
   *    Napoli - city         - groupCount: 1
   *      Giuseppe  - person  - groupCount: 1
   * USA - country            - groupCount: 1
   *    LA - city             - groupCount: 1
   *      Bob  - person       - groupCount: 1
   */
  groupCount: number;

  groupNesting: number;

  collapsed: boolean;

  /**
   * This is false only when the DataSource is configured with lazy batching and the current
   * row has not been loaded yet. It has nothing to do with children, only with self.
   */
  selfLoaded: boolean;
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
  /**
   * These are leaf items. This array may be empty when there is batched lazy loading
   */
  items: DataType[];
  commonData?: Partial<DataType>;
  childrenLoading: boolean;
  childrenAvailable: boolean;
  totalChildrenCount?: number;
  cache: boolean;
  error?: string;
  reducerResults: Record<string, AggregationReducerResult>;
  pivotDeepMap?: DeepMap<
    GroupKeyType<KeyType>,
    PivotGroupValueType<DataType, KeyType>
  >;
};

export type PivotBy<DataType, KeyType> = Omit<
  GroupBy<DataType, KeyType>,
  'column'
> & {
  column?:
    | ColumnTypeWithInherit<Partial<InfiniteTableColumn<DataType>>>
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
      }) => ColumnTypeWithInherit<
        Partial<InfiniteTablePivotFinalColumnGroup<DataType>>
      >);
};

type GroupParams<DataType, KeyType> = {
  groupBy: GroupBy<DataType, KeyType>[];
  defaultToKey?: (value: any, item: DataType) => GroupKeyType<KeyType>;

  pivot?: PivotBy<DataType, KeyType>[];
  reducers?: Record<string, DataSourceAggregationReducer<DataType, any>>;
};

type LazyGroupParams<DataType> = {
  mappings?: DataSourceMappings;
  indexer: Indexer<DataType>;
  toPrimaryKey: (item: DataType) => any;
  cache?: DataSourceCache<DataType>;
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

  for (const key in reducers)
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
  index: number,
  reducers: Record<string, DataSourceAggregationReducer<DataType, any>>,
  reducerResults: Record<string, AggregationReducerResult>,
  groupKeys: any[] | undefined,
) {
  if (!reducers || !Object.keys(reducers).length) {
    return;
  }

  for (const key in reducers)
    if (reducers.hasOwnProperty(key)) {
      const reducer = reducers[key];
      if (typeof reducer.reducer !== 'function') {
        continue;
      }
      const currentValue = reducerResults[key];

      const value = reducer.getter
        ? reducer.getter(data) ?? null
        : reducer.field
        ? data[reducer.field]
        : null;

      reducerResults[key] = reducer.reducer(
        currentValue,
        value,
        data,
        index,
        groupKeys,
      );
    }
}

type LazyPivotContainer = {
  values: Record<string, any>;
  totals?: Record<string, any>;
};

export function lazyGroup<DataType, KeyType extends string = string>(
  groupParams: GroupParams<DataType, KeyType> & LazyGroupParams<DataType>,
  rootData: LazyGroupDataDeepMap<DataType>,
): DataGroupResult<DataType, KeyType> {
  const {
    reducers = {},
    pivot,
    groupBy,

    indexer,
    toPrimaryKey,
    cache,
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
    pivotIndex = 0,
    currentPivotKeys: KeyType[] = [],
  ) {
    const last = !pivot.length || pivotIndex === pivot.length - 1;
    const values = container[(mappings?.values || 'values') as 'values'] || {};
    for (const k in values)
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

  const currentPivotKeys: GroupKeyType<KeyType>[] = [];

  const initialReducerValue = initReducers<DataType>(reducers);

  const globalReducerResults = deepClone(initialReducerValue);

  rootData.visitDepthFirst(
    (lazyGroupRowInfo: LazyRowInfoGroup<DataType>, keys, _index, next) => {
      const [_rootKey, ...currentGroupKeys] = keys;
      const dataArray = lazyGroupRowInfo.children;

      const current = deepMap.get(currentGroupKeys as KeyType[]);
      if (current) {
        current.cache = lazyGroupRowInfo.cache;
        current.childrenLoading = lazyGroupRowInfo.childrenLoading;
        current.childrenAvailable = lazyGroupRowInfo.childrenAvailable;
        current.error = lazyGroupRowInfo.error;
      }
      if (currentGroupKeys.length == groupBy.length && groupBy.length) {
        if (current) {
          //@ts-ignore
          current.items = dataArray;

          for (let i = 0, len = currentGroupKeys.length; i < len; i++) {
            const currentKeys = currentGroupKeys.slice(0, i);
            const deepMapGroupValue = deepMap.get(
              currentKeys as KeyType[],
            ) as DeepMapGroupValueType<DataType, KeyType>;

            if (deepMapGroupValue) {
              deepMapGroupValue.items = deepMapGroupValue.items || [];
              deepMapGroupValue.items = deepMapGroupValue.items.concat(
                dataArray as any as DataType[],
              );
            }
          }

          indexer.indexArray(dataArray as any as DataType[], {
            toPrimaryKey,
            cache,
          });
        }
        return next?.();
      }

      for (let i = 0, len = dataArray.length; i < len; i++) {
        if (!dataArray[i]) {
          // we're in the case of lazy loading, so some records might not be available just yet
          const deepMapGroupValue: DeepMapGroupValueType<DataType, KeyType> = {
            items: [],
            reducerResults: {},
            cache: false,
            childrenLoading: false,
            childrenAvailable: false,
          };

          deepMap.set(
            [
              ...currentGroupKeys,
              `${NOT_LOADED_YET_KEY_PREFIX}${i}`,
            ] as KeyType[],
            deepMapGroupValue,
          );
          continue;
        }
        const dataObject = dataArray[i].data;
        const dataKeys = dataArray[i].keys || [];
        // const item = dataObject as Partial<DataType>;

        if (dataKeys.length) {
          // we need to take the key that comes from the server, and not from the property
          // although they should probably be the same
          const key = dataKeys[dataKeys.length - 1];
          currentGroupKeys.push(key);
        }

        const deepMapGroupValue: DeepMapGroupValueType<DataType, KeyType> = {
          items: [],
          cache: false,
          childrenLoading: false,
          childrenAvailable: false,
          commonData: dataObject,
          totalChildrenCount: dataArray[i].totalChildrenCount,
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

        if (dataKeys.length) {
          currentGroupKeys.pop();
        }
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

function processGroup<KeyType, DataType>(
  deepMap: DeepMap<
    GroupKeyType<KeyType>,
    DeepMapGroupValueType<DataType, KeyType>
  >,
  currentGroupKeys: KeyType[],
  currentPivotKeys: KeyType[],
  item: DataType,
  itemIndex: number,
  pivot: GroupParams<DataType, KeyType>['pivot'],
  reducers: GroupParams<DataType, KeyType>['reducers'],
  topLevelPivotColumns: DeepMap<GroupKeyType<KeyType>, boolean>,
  initialReducerValue: Record<string, AggregationReducerResult>,
  defaultToKey: GroupParams<DataType, KeyType>['defaultToKey'] = DEFAULT_TO_KEY,
) {
  const {
    items: currentGroupItems,
    reducerResults,
    pivotDeepMap,
  } = deepMap.get(currentGroupKeys)!;

  currentGroupItems.push(item);

  if (reducers) {
    computeReducersFor<DataType>(
      item,
      itemIndex,
      reducers,
      reducerResults,
      currentGroupKeys,
    );
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
          reducerResults: deepClone(initialReducerValue),
          items: [],
        });
      }
      const { reducerResults: pivotReducerResults, items: pivotGroupItems } =
        pivotDeepMap!.get(currentPivotKeys)!;

      pivotGroupItems.push(item);
      if (reducers) {
        computeReducersFor<DataType>(
          item,
          itemIndex,
          reducers,
          pivotReducerResults,
          currentGroupKeys,
        );
      }
    }
    currentPivotKeys.length = 0;
  }
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

  const currentGroupKeys: GroupKeyType<KeyType>[] = [];
  const currentPivotKeys: GroupKeyType<KeyType>[] = [];

  const initialReducerValue = initReducers<DataType>(reducers);

  const globalReducerResults = deepClone(initialReducerValue);

  if (!groupByLength) {
    const deepMapGroupValue: DeepMapGroupValueType<DataType, KeyType> = {
      items: [],
      cache: false,
      childrenLoading: false,
      childrenAvailable: false,
      reducerResults: deepClone(initialReducerValue),
    };

    if (pivot) {
      deepMapGroupValue.pivotDeepMap = new DeepMap<
        GroupKeyType<KeyType>,
        PivotGroupValueType<DataType, KeyType>
      >();
    }
    deepMap.set(currentGroupKeys, deepMapGroupValue);
  }

  for (let i = 0, len = data.length; i < len; i++) {
    const item = data[i];

    const commonData: Partial<DataType> = {};
    for (let groupByIndex = 0; groupByIndex < groupByLength; groupByIndex++) {
      const { field: groupByProperty, toKey: groupToKey } =
        groupBy[groupByIndex];
      const key: GroupKeyType<KeyType> = (groupToKey || defaultToKey)(
        item[groupByProperty],
        item,
      );

      commonData[groupByProperty] =
        key as any as DataType[KeyOfNoSymbol<DataType>];
      currentGroupKeys.push(key);

      if (!deepMap.has(currentGroupKeys)) {
        const deepMapGroupValue: DeepMapGroupValueType<DataType, KeyType> = {
          items: [],
          cache: false,
          commonData: { ...commonData },
          childrenLoading: false,
          childrenAvailable: false,
          reducerResults: deepClone(initialReducerValue),
        };
        if (pivot) {
          deepMapGroupValue.pivotDeepMap = new DeepMap<
            GroupKeyType<KeyType>,
            PivotGroupValueType<DataType, KeyType>
          >();
        }
        deepMap.set(currentGroupKeys, deepMapGroupValue);
      }

      processGroup(
        deepMap,
        currentGroupKeys,
        currentPivotKeys,
        item,
        i,
        pivot,
        reducers,
        topLevelPivotColumns!,
        initialReducerValue,
        defaultToKey,
      );
    }

    if (!groupByLength) {
      processGroup(
        deepMap,
        currentGroupKeys,
        currentPivotKeys,
        item,
        i,
        pivot,
        reducers,
        topLevelPivotColumns!,
        initialReducerValue,
        defaultToKey,
      );
    }

    if (reducers) {
      computeReducersFor<DataType>(
        item,
        i,
        reducers,
        globalReducerResults,
        currentGroupKeys,
      );
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
  lazyLoad: boolean;
  groupKeys: any[];
  groupBy: (keyof DataType)[];

  error?: string;
  parents: InfiniteTable_HasGrouping_RowInfoGroup<DataType>[];
  indexInParentGroups: number[];
  indexInGroup: number;
  indexInAll: number;
  childrenLoading: boolean;
  childrenAvailable: boolean;
  totalChildrenCount?: number;
  directChildrenCount: number;
  directChildrenLoadedCount: number;
  reducers: Record<string, DataSourceAggregationReducer<DataType, any>>;
};

function getEnhancedGroupData<DataType>(
  options: GetEnhancedGroupDataOptions<DataType>,
  deepMapValue: DeepMapGroupValueType<DataType, any>,
) {
  const { groupBy, groupKeys, parents, reducers, lazyLoad } = options;
  const groupNesting = groupKeys.length;
  const {
    items: groupItems,
    reducerResults,

    pivotDeepMap,
    commonData,
  } = deepMapValue;

  let data = commonData ?? (null as Partial<DataType> | null);

  if (Object.keys(reducerResults).length > 0) {
    data = { ...commonData } as Partial<DataType>;

    for (const key in reducers)
      if (reducers.hasOwnProperty(key)) {
        const reducer = reducers[key];

        const field = reducer.field as keyof DataType;
        if (field) {
          data[field] = reducerResults[key] as any;
        }
      }
  }

  let selfLoaded = true;

  let theValue =
    // if there is a value for the current groupBy in the data object, use it
    (data != null ? data[groupBy[groupKeys.length - 1]] : null) ??
    // otherwise just use the group key
    groupKeys[groupKeys.length - 1];

  if (
    typeof theValue === 'string' &&
    theValue.startsWith(NOT_LOADED_YET_KEY_PREFIX)
  ) {
    selfLoaded = false;
    theValue = null;
  }

  const enhancedGroupData: InfiniteTable_HasGrouping_RowInfoGroup<DataType> = {
    data,
    groupCount: groupItems.length,
    groupData: groupItems,
    groupKeys,

    rowSelected: false,
    selectedChildredCount: 0,
    deselectedChildredCount: 0,
    id: `${groupKeys}`, //TODO improve this
    collapsed: false,
    dataSourceHasGrouping: true,
    selfLoaded,
    error: options.error,

    parents,
    deepRowInfoArray: [],
    collapsedChildrenCount: 0,
    collapsedGroupsCount: 0,
    totalChildrenCount: options.totalChildrenCount,
    // childrenAvailable: collapsed ? (!lazyLoad ? false : cacheExists) : true,
    childrenAvailable: lazyLoad ? options.childrenAvailable : true,
    childrenLoading: options.childrenLoading,
    indexInParentGroups: options.indexInParentGroups,
    indexInGroup: options.indexInGroup,
    indexInAll: options.indexInAll,
    directChildrenCount: options.directChildrenCount,
    directChildrenLoadedCount: lazyLoad
      ? options.directChildrenLoadedCount
      : options.directChildrenCount,
    value: theValue,
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
    for (const key in reducers)
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
  lazyLoad: boolean;

  groupResult: DataGroupResult<DataType, KeyType>;
  toPrimaryKey: (data: DataType, index: number) => any;
  groupRowsState?: GroupRowsState;
  isRowSelected?: (rowInfo: InfiniteTableRowInfo<DataType>) => boolean | null;

  reducers?: Record<string, DataSourceAggregationReducer<DataType, any>>;
  rowSelectionState?: RowSelectionState;
  generateGroupRows: boolean;
};
export function enhancedFlatten<DataType, KeyType = any>(
  param: EnhancedFlattenParam<DataType, KeyType>,
): { data: InfiniteTableRowInfo<DataType>[]; groupRowsIndexes: number[] } {
  const {
    lazyLoad,
    groupResult,
    toPrimaryKey,
    groupRowsState,
    isRowSelected,
    rowSelectionState,
    generateGroupRows,
    reducers = {},
  } = param;
  const { groupParams, deepMap, pivot } = groupResult;
  const { groupBy } = groupParams;

  const groupByStrings = groupBy.map((g) => g.field);

  const result: InfiniteTableRowInfo<DataType>[] = [];
  const groupRowsIndexes: number[] = [];

  const parents: InfiniteTable_HasGrouping_RowInfoGroup<DataType>[] = [];
  const indexInParentGroups: number[] = [];

  deepMap.visitDepthFirst(
    (deepMapValue, groupKeys: any[], indexInGroup, next?: () => void) => {
      const items = deepMapValue.items;

      const groupNesting = groupKeys.length;

      let collapsed = groupRowsState?.isGroupRowCollapsed(groupKeys) ?? false;

      indexInParentGroups.push(indexInGroup);

      const enhancedGroupData: InfiniteTable_HasGrouping_RowInfoGroup<DataType> =
        getEnhancedGroupData(
          {
            lazyLoad,
            groupBy: groupByStrings,
            parents: Array.from(parents),
            reducers,
            indexInGroup,
            indexInParentGroups: Array.from(indexInParentGroups),
            indexInAll: result.length,
            groupKeys,
            error: deepMapValue.error,
            totalChildrenCount: deepMapValue.totalChildrenCount,
            childrenLoading:
              (deepMapValue.childrenLoading ||
                (!collapsed && !deepMapValue.childrenAvailable)) &&
              lazyLoad,
            childrenAvailable: deepMapValue.childrenAvailable,
            directChildrenCount:
              groupKeys.length === groupByStrings.length
                ? deepMapValue.items.length
                : deepMap.getDirectChildrenSizeFor(groupKeys),
            directChildrenLoadedCount: 0,
          },
          deepMapValue,
        );

      if (isRowSelected) {
        enhancedGroupData.rowSelected = isRowSelected(enhancedGroupData);
        if (rowSelectionState) {
          const selectionCount = rowSelectionState.getSelectionCountFor(
            enhancedGroupData.groupKeys,
          );
          enhancedGroupData.selectedChildredCount =
            selectionCount.selectedCount;
          enhancedGroupData.deselectedChildredCount =
            selectionCount.deselectedCount;
        }
      }

      const parent = parents[parents.length - 1];

      const parentCollapsed = parent?.collapsed ?? false;

      if (parentCollapsed) {
        collapsed = true;
      }
      enhancedGroupData.collapsed = collapsed;

      // const itemHidden = collapsed || parentCollapsed;

      let include = generateGroupRows || collapsed;

      if (parentCollapsed) {
        include = false;
      }

      if (include) {
        result.push(enhancedGroupData);
        groupRowsIndexes.push(result.length - 1);
      }

      enhancedGroupData.collapsedChildrenCount = 0;
      parents.forEach((parent) => {
        parent.deepRowInfoArray.push(enhancedGroupData);

        parent.collapsedGroupsCount += collapsed ? 1 : 0;
      });

      if (parent && enhancedGroupData.selfLoaded && lazyLoad) {
        parent.directChildrenLoadedCount += 1;
      }
      parents.push(enhancedGroupData);

      const continueWithChildren = true; //!collapsed || lazyLoad;

      if (continueWithChildren) {
        if (!next) {
          if (!pivot) {
            const startIndex = result.length;

            // using items.map would have been easier
            // but we have sparse arrays, and if the last items are sparse
            // eg: var a = Array(10); a[0] = 1;  a[1] = 2 but the rest of the positions
            // are not assigned
            // then iterating over it with `.map` or `.forEach` wont get to the end
            // which we need

            // this is a use-case we have when there is server-side batching

            // we prefer index assignment, see we have to increment the length
            // of the result array
            // by the number of items we want to add
            // this is in order to make the whole loop a tiny bit faster
            if (!collapsed) {
              result.length += items.length;
            }
            for (let index = 0, len = items.length; index < len; index++) {
              const item = items[index];
              const indexInAll = startIndex + index;
              const itemId = item
                ? toPrimaryKey(item, indexInAll)
                : `${groupKeys}-${index}`;
              const rowInfo: InfiniteTable_HasGrouping_RowInfoNormal<DataType> =
                {
                  id: itemId,
                  data: item,
                  dataSourceHasGrouping: true,
                  isGroupRow: false,
                  selfLoaded: !!item,
                  rowSelected: false,
                  rootGroupBy: groupByStrings,
                  collapsed,
                  groupKeys,
                  parents: Array.from(parents),
                  indexInParentGroups: [...indexInParentGroups, index],
                  indexInGroup: index,
                  indexInAll,
                  groupBy: groupByStrings,
                  groupNesting: groupNesting + 1,
                  groupCount: enhancedGroupData.groupCount,
                };
              if (isRowSelected) {
                rowInfo.rowSelected = isRowSelected(rowInfo);
              }

              parents.forEach((parent, i) => {
                const last = i === parents.length - 1;
                if (last && item) {
                  parent.directChildrenLoadedCount += 1;
                }

                if (collapsed) {
                  // if the current parent is collapsed - this will be true if there is any collapsed parent
                  parent.collapsedChildrenCount += 1;
                }

                parent.deepRowInfoArray.push(rowInfo);
              });

              if (!collapsed) {
                // we prefer index assignment, see above
                result[startIndex + index] = rowInfo;
              }
            }
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
    groupRowsIndexes,
  };
}
