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
import { sharedValueGetterParamsFlyweightObject } from './sharedValueGetterParamsFlyweightObject';
import { TreeSelectionState } from '../../components/DataSource/TreeSelectionState';

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
  | InfiniteTable_NoGrouping_RowInfoNormal<T>
  | InfiniteTable_Tree_RowInfoLeafNode<T>
  | InfiniteTable_Tree_RowInfoParentNode<T>;

export type InfiniteTable_Tree_RowInfoLeafNode<T> = {
  dataSourceHasGrouping: false;
  isTreeNode: true;
  isParentNode: false;
  isGroupRow: false;

  data: T;
} & InfiniteTable_RowInfoBase<T> &
  InfiniteTable_Tree_RowInfoBase<T>;

export type InfiniteTable_Tree_RowInfoBase<T> = {
  isTreeNode: true;
  isParentNode: boolean;
  indexInParent: number;

  nodePath: any[];

  parentNodes: InfiniteTable_Tree_RowInfoParentNode<T>[];

  /**
   * Available when using a tree data, this will be set for both parent and leaf nodes
   * Italy  - country         - indexInParentGroups: [0]
   *    Rome - city           - indexInParentGroups: [0,0]
   *      Marco    - person   - indexInParentGroups: [0,0,0]
   *      Luca     - person   - indexInParentGroups: [0,0,1]
   *      Giuseppe  - person  - indexInParentGroups: [0,0,2]
   * USA - country            - indexInParentGroups: [1]
   *    LA - city             - indexInParentGroups: [1,0]
   *      Bob  - person       - indexInParentGroups: [1,0,2]
   */
  indexInParentNodes: number[];

  /**
   * how many leaf nodes are under the current parent node.
   * if this node is a leaf node, it will be 0,
   * if this is a parent node, this will be the count of all the leaf nodes under this parent node (including the ones
   * not visible due to collapsing).
   */
  totalLeafNodesCount: number;

  /**
   * The count of all leaf nodes (normal ) inside the parent node that are not being visible
   * due to collapsing (either the current node is collapsed or any of its direct children)
   */
  collapsedLeafNodesCount: number;

  // collapsedParentNodesCount: number;

  treeNesting: number;

  selfLoaded: boolean;
};

export type InfiniteTable_Tree_RowInfoNode<T> =
  | InfiniteTable_Tree_RowInfoLeafNode<T>
  | InfiniteTable_Tree_RowInfoParentNode<T>;
export type InfiniteTable_Tree_RowInfoParentNode<T> = {
  dataSourceHasGrouping: false;

  isParentNode: true;
  isGroupRow: false;

  nodeExpanded: boolean;
  selfExpanded: boolean;

  data: T;

  selectedLeafNodesCount: number;

  /**
   * This array contains all the (uncollapsed, so visible) row infos under this group, at any level of nesting,
   * in the order in which they are visible in the table
   */
  deepRowInfoArray: InfiniteTable_Tree_RowInfoNode<T>[];

  deselectedLeafNodesCount: number;

  duplicateOf?: InfiniteTable_Tree_RowInfoParentNode<T>['id'];
} & InfiniteTable_RowInfoBase<T> &
  InfiniteTable_Tree_RowInfoBase<T>;

export type InfiniteTableRowInfoDataDiscriminator_RowInfoNormal<T> = {
  data: T;
  isGroupRow: false;
  isTreeNode: false;
  isParentNode: false;
  rowActive: boolean;
  rowDetailState: false | 'expanded' | 'collapsed';
  rowInfo:
    | InfiniteTable_NoGrouping_RowInfoNormal<T>
    | InfiniteTable_HasGrouping_RowInfoNormal<T>;
  field?: keyof T;
  value: any;
  rawValue: any;
  rowSelected: boolean | null;
};

export type InfiniteTableRowInfoDataDiscriminator_ParentNode<T> = {
  data: T;
  isGroupRow: false;
  isTreeNode: true;
  isParentNode: true;
  nodeExpanded: boolean;
  rowActive: boolean;
  rowDetailState: false | 'expanded' | 'collapsed';
  rowInfo: InfiniteTable_Tree_RowInfoParentNode<T>;
  field?: keyof T;
  value: any;
  rawValue: any;
  rowSelected: boolean | null;
};

export type InfiniteTableRowInfoDataDiscriminator_LeafNode<T> = {
  data: T;
  isGroupRow: false;
  isTreeNode: true;
  isParentNode: false;
  nodeExpanded: boolean;
  rowActive: boolean;
  rowDetailState: false | 'expanded' | 'collapsed';
  rowInfo: InfiniteTable_Tree_RowInfoLeafNode<T>;
  field?: keyof T;
  value: any;
  rawValue: any;
  rowSelected: boolean | null;
};

export type InfiniteTableRowInfoDataDiscriminator_RowInfoGroup<T> = {
  rowActive: boolean;
  data: Partial<T> | null;
  rowInfo: InfiniteTable_HasGrouping_RowInfoGroup<T>;
  rowDetailState: false | 'expanded' | 'collapsed';
  isGroupRow: true;
  isTreeNode: false;
  field?: keyof T;
  value: any;
  rawValue: any;
  rowSelected: boolean | null;
};
export type InfiniteTableRowInfoDataDiscriminator<T> =
  | InfiniteTableRowInfoDataDiscriminator_RowInfoNormal<T>
  | InfiniteTableRowInfoDataDiscriminator_RowInfoGroup<T>
  | InfiniteTableRowInfoDataDiscriminator_Node<T>;

export type InfiniteTableRowInfoDataDiscriminator_Node<T> =
  | InfiniteTableRowInfoDataDiscriminator_ParentNode<T>
  | InfiniteTableRowInfoDataDiscriminator_LeafNode<T>;
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
  rowDisabled: boolean;
  isCellSelected: (columnId: string) => boolean;
  hasSelectedCells: (columnIds: string[]) => boolean;
};

export type InfiniteTable_RowInfoCellSelection = {
  isCellSelected: (columnId: string) => boolean;
} & (
  | {
      selectedCells: true;
      deselectedCells: Set<string>;
    }
  | {
      selectedCells: Set<string>;
      deselectedCells: true;
    }
);

export type InfiniteTable_HasGrouping_RowInfoNormal<T> = {
  dataSourceHasGrouping: true;
  isTreeNode: false;
  data: T;
  isGroupRow: false;
} & InfiniteTable_HasGrouping_RowInfoBase<T> &
  InfiniteTable_RowInfoBase<T>;

export type InfiniteTable_HasGrouping_RowInfoGroup<T> = {
  dataSourceHasGrouping: true;
  isTreeNode: false;
  data: Partial<T> | null;
  reducerData?: Partial<Record<keyof T, any>>;
  isGroupRow: true;

  duplicateOf?: InfiniteTable_HasGrouping_RowInfoGroup<T>['id'];

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
  isTreeNode: false;
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
   * Italy  - country         - groupBy: [{field: 'country'}]
   *    Rome - city           - groupBy: [{field: 'country'}, {field: 'city'} ]
   *      Marco    - person   - groupBy: [{field: 'country'}, {field: 'city'} ]
   *      Luca     - person   - groupBy: [{field: 'country'}, {field: 'city'} ]
   *      Giuseppe  - person  - groupBy: [{field: 'country'}, {field: 'city'} ]
   */
  groupBy: GroupBy<T, any>[];

  /**
   * The groupBy value of the DataSource component, mapped to the groupBy.field
   */
  rootGroupBy: GroupBy<T, any>[];

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
export type TreeKeyType<T extends any = any> = T; //string | number | symbol | null | undefined;

type PivotReducerResults<T = any> = Record<string, AggregationReducerResult<T>>;

type PivotGroupValueType<DataType, KeyType> = {
  reducerResults: PivotReducerResults<KeyType>;
  items: DataType[];
};

export type PivotValuesDeepMap<DataType, KeyType> = DeepMap<
  GroupKeyType<KeyType>,
  PivotGroupValueType<DataType, KeyType>
>;

export type DeepMapTreeValueType<DataType, _KeyType> = {
  items: DataType[];

  node: DataType | null;
  reducerResults: Record<string, AggregationReducerResult>;
  cache: boolean;
  childrenLoading: boolean;
  childrenAvailable: boolean;

  treeNesting: number;

  totalLeafNodesCount: number;
  leavesAvailableCount: number;

  isTree: true;
  isGroupBy: false;

  error?: string;
};
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
  isTree: false;
  isGroupBy: true;
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

type TreeParams<DataType, _KeyType> = {
  isLeafNode: (item: DataType) => boolean;
  getNodeChildren: (item: DataType) => null | DataType[];
  toKey: (item: DataType) => any;

  reducers?: Record<string, DataSourceAggregationReducer<DataType, any>>;
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

export type DataTreeResult<DataType, KeyType extends any> = {
  deepMap: DeepMap<
    TreeKeyType<KeyType>,
    DeepMapTreeValueType<DataType, KeyType>
  >;
  treePaths: DeepMap<TreeKeyType<KeyType>, true>;
  treeParams: TreeParams<DataType, KeyType>;
  initialData: DataType[];
  reducerResults?: Record<string, AggregationReducerResult>;
};

function returnFalse() {
  return false;
}

function initReducers<DataType>(
  reducers?: Record<string, DataSourceAggregationReducer<DataType, any>>,
): Record<string, AggregationReducerResult> {
  if (!reducers || !Object.keys(reducers).length) {
    return {};
  }

  const result: Record<string, AggregationReducerResult> = {};

  for (const key in reducers)
    if (reducers.hasOwnProperty(key)) {
      const initialValue = reducers[key].initialValue;
      result[key] =
        typeof initialValue === 'function' ? initialValue() : initialValue;
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
      let dataArray = lazyGroupRowInfo.children;

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

          const res = indexer.indexArray(dataArray as any as DataType[], {
            toPrimaryKey,
            cache,
          });
          //@ts-ignore
          dataArray = res;
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
            isTree: false,
            isGroupBy: true,
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
          isTree: false,
          isGroupBy: true,
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
      const {
        field: pivotField,
        valueGetter: pivotValueGetter,
        toKey: pivotToKey,
      } = pivot[pivotIndex];

      let pivotValue = pivotField ? item[pivotField] : null;

      if (pivotValueGetter) {
        sharedValueGetterParamsFlyweightObject.data = item;
        sharedValueGetterParamsFlyweightObject.field = pivotField;
        pivotValue = pivotValueGetter(sharedValueGetterParamsFlyweightObject);
      }
      const pivotKey: GroupKeyType<KeyType> = (pivotToKey || defaultToKey)(
        pivotValue,
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

function processTreeNode<DataType, KeyType>(
  treeParams: TreeParams<DataType, KeyType>,
  deepMap: DeepMap<
    TreeKeyType<KeyType>,
    DeepMapTreeValueType<DataType, KeyType>
  >,
  treePaths: DeepMap<TreeKeyType<KeyType>, true>,
  parentPath: KeyType[],
  item: DataType,
  itemIndex: number,
  reducers: TreeParams<DataType, KeyType>['reducers'],
  initialReducerValue: Record<string, AggregationReducerResult>,
) {
  const { isLeafNode, getNodeChildren, toKey } = treeParams;

  const nodePath = [...parentPath, toKey(item)];
  const isLeaf = isLeafNode(item);

  treePaths.set(nodePath, true);
  if (isLeaf) {
    for (let i = 0, len = parentPath.length; i <= len; i++) {
      const currentPath = parentPath.slice(0, i);
      const currentTreeValue = deepMap.get(currentPath)!;

      const { reducerResults, items: currentLeafItems } = currentTreeValue;

      currentLeafItems.push(item);

      currentTreeValue.leavesAvailableCount++;
      currentTreeValue.totalLeafNodesCount++;
      if (reducers) {
        computeReducersFor<DataType>(
          item,
          itemIndex,
          reducers,
          reducerResults,
          currentPath,
        );
      }
    }

    return;
  }
  const reducerResults = deepClone(initialReducerValue);

  const items: DataType[] = [];
  deepMap.set(nodePath, {
    items,
    isTree: true,
    isGroupBy: false,
    node: item,
    reducerResults,
    cache: false,
    childrenLoading: false,
    childrenAvailable: true,
    totalLeafNodesCount: 0,
    leavesAvailableCount: 0,
    treeNesting: parentPath.length,
  });

  const children = getNodeChildren(item);
  if (!children || !Array.isArray(children)) {
    return;
  }

  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i];

    processTreeNode(
      treeParams,
      deepMap,
      treePaths,
      nodePath,
      child,
      i,
      reducers,
      initialReducerValue,
    );
  }

  if (reducers) {
    // complete the reducers for the current node
    // as all leaf nodes have been processed
    completeReducers(reducers, reducerResults, items);
  }
}

export function tree<DataType, KeyType = any>(
  treeParams: TreeParams<DataType, KeyType>,
  data: DataType[],
): DataTreeResult<DataType, KeyType> {
  const { reducers } = treeParams;

  const initialReducerValue = initReducers<DataType>(reducers);
  const globalReducerResults = deepClone(initialReducerValue);

  const deepMap = new DeepMap<
    TreeKeyType<KeyType>,
    DeepMapTreeValueType<DataType, KeyType>
  >();
  const treePaths = new DeepMap<TreeKeyType<KeyType>, true>();

  deepMap.set([], {
    items: [],
    isTree: true,
    isGroupBy: false,
    reducerResults: globalReducerResults,
    cache: false,
    childrenLoading: false,
    childrenAvailable: true,
    totalLeafNodesCount: 0,
    leavesAvailableCount: 0,
    node: null,
    treeNesting: -1,
  });

  for (let i = 0, len = data.length; i < len; i++) {
    processTreeNode(
      treeParams,
      deepMap,
      treePaths,
      [],
      data[i],
      i,
      reducers,
      initialReducerValue,
    );
  }

  if (reducers) {
    completeReducers(reducers, globalReducerResults, data);
  }

  const result: DataTreeResult<DataType, KeyType> = {
    deepMap,
    treeParams,
    treePaths,
    initialData: data,
    reducerResults: globalReducerResults,
  };

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

  const currentGroupKeys: GroupKeyType<KeyType>[] = [];
  const currentPivotKeys: GroupKeyType<KeyType>[] = [];

  const initialReducerValue = initReducers<DataType>(reducers);

  const globalReducerResults = deepClone(initialReducerValue);

  if (!groupByLength) {
    const deepMapGroupValue: DeepMapGroupValueType<DataType, KeyType> = {
      items: [],
      isTree: false,
      isGroupBy: true,
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
      const {
        field: groupByProperty,
        groupField,
        valueGetter,
        toKey: groupToKey,
      } = groupBy[groupByIndex];

      let value = groupByProperty ? item[groupByProperty] : null;

      if (valueGetter) {
        sharedValueGetterParamsFlyweightObject.data = item;
        sharedValueGetterParamsFlyweightObject.field = groupByProperty;
        value = valueGetter(sharedValueGetterParamsFlyweightObject);
      }

      const key: GroupKeyType<KeyType> = (groupToKey || defaultToKey)(
        value,
        item,
      );

      //@ts-ignore
      commonData[groupByProperty || groupField] =
        key as any as DataType[KeyOfNoSymbol<DataType>];

      currentGroupKeys.push(key);

      if (!deepMap.has(currentGroupKeys)) {
        const deepMapGroupValue: DeepMapGroupValueType<DataType, KeyType> = {
          items: [],
          isTree: false,
          isGroupBy: true,
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
  groupBy: GroupBy<DataType, any>[];

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
  let reducerData: Partial<Record<keyof DataType, any>> | undefined;

  if (Object.keys(reducerResults).length > 0) {
    data = { ...commonData } as Partial<DataType>;
    reducerData = {};

    for (const key in reducers)
      if (reducers.hasOwnProperty(key)) {
        const reducer = reducers[key];

        const field = reducer.field as keyof DataType;
        if (field) {
          reducerData[field] = reducerResults[key] as any;
        }
        if (field && data[field] == null) {
          // we might have an aggregation for an already existing groupBy.field - in that case, data[field] is not null
          // so we don't want to reassign it - see https://github.com/infinite-table/infinite-react/issues/170
          // the fix for this issue was to add the if(data[field] == null) check
          data[field] = reducerResults[key] as any;
        }
      }
  }

  let selfLoaded = true;

  let defaultValue = groupKeys[groupKeys.length - 1];
  let theValue: any = defaultValue;

  if (data != null) {
    const currentGroupBy = groupBy[groupKeys.length - 1];

    if (currentGroupBy && currentGroupBy.field) {
      theValue = data[currentGroupBy.field];
    }
    if (currentGroupBy && currentGroupBy.toKey) {
      theValue = currentGroupBy.toKey(theValue, data as DataType);
    }
    theValue = theValue ?? defaultValue;
  }

  if (
    typeof theValue === 'string' &&
    theValue.startsWith(NOT_LOADED_YET_KEY_PREFIX)
  ) {
    selfLoaded = false;
    theValue = null;
  }

  const enhancedGroupData: InfiniteTable_HasGrouping_RowInfoGroup<DataType> = {
    data,
    reducerData,
    groupCount: groupItems.length,
    groupData: groupItems,
    groupKeys,

    isTreeNode: false,
    rowSelected: false,
    selectedChildredCount: 0,
    deselectedChildredCount: 0,
    id: `${groupKeys}`, //TODO improve this
    collapsed: false,
    dataSourceHasGrouping: true,
    rowDisabled: false,
    isCellSelected: returnFalse,
    hasSelectedCells: returnFalse,
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
    // rootGroupBy: groupBy.map((g) => g.field),
    rootGroupBy: groupBy,
    groupBy:
      groupNesting === groupBy.length
        ? groupBy
        : groupBy.slice(0, groupNesting),
    // ).map((g) => g.field),
    isGroupRow: true,
    pivotValuesMap: pivotDeepMap,
    groupNesting,
    reducerResults,
  };

  return enhancedGroupData;
}

function toDuplicateRow<DataType>(
  parent:
    | InfiniteTable_HasGrouping_RowInfoGroup<DataType>
    | InfiniteTable_Tree_RowInfoParentNode<DataType>,
  indexInAll: number,
  currentPage: number,
) {
  return {
    ...parent,
    id: `duplicate_row_on_page_${currentPage}_for__${parent.id}`,
    indexInAll,
    duplicateOf: parent.id,
  };
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

export type EnhancedTreeFlattenParam<DataType, KeyType = any> = {
  dataArray: DataType[];
  treeResult: DataTreeResult<DataType, KeyType>;
  treeParams: TreeParams<DataType, KeyType>;
  rowsPerPage?: number | null;
  repeatWrappedGroupRows?: boolean;
  toPrimaryKey: (data: DataType, index: number) => any;

  withRowInfo?: (rowInfo: InfiniteTableRowInfo<DataType>) => void;

  isNodeExpanded?: (
    rowInfo: InfiniteTable_Tree_RowInfoNode<DataType>,
  ) => boolean;
  isNodeSelected?: (
    rowInfo: InfiniteTable_Tree_RowInfoNode<DataType>,
  ) => boolean | null;
  isRowDisabled?: (rowInfo: InfiniteTableRowInfo<DataType>) => boolean;

  reducers?: Record<string, DataSourceAggregationReducer<DataType, any>>;
  treeSelectionState?: TreeSelectionState;
};

function flattenTreeNodes<DataType>(
  dataArray: DataType[],
  parentPath: any[],
  parents: InfiniteTable_Tree_RowInfoParentNode<DataType>[],
  indexInParentNodes: number[],
  params: EnhancedTreeFlattenParam<DataType, any>,
  result: InfiniteTableRowInfo<DataType>[],
) {
  const treeNesting = parentPath.length;

  const { isLeafNode, getNodeChildren } = params.treeParams;
  const {
    toPrimaryKey,
    treeResult,
    isRowDisabled,
    isNodeSelected,
    withRowInfo,
    isNodeExpanded,
    treeSelectionState,
  } = params;
  const { deepMap } = treeResult;

  const len = dataArray.length;

  const currentParent = parents[parents.length - 1];

  const parentExpanded = currentParent ? currentParent.nodeExpanded : true;

  for (let i = 0; i < len; i++) {
    const item = dataArray[i];

    const key = toPrimaryKey(item, i);
    const nodePath = [...parentPath, key];
    const isLeaf = isLeafNode(item);

    const indexInAll = result.length;

    if (isLeaf) {
      const rowInfo: InfiniteTable_Tree_RowInfoLeafNode<DataType> = {
        id: key,
        nodePath,
        isGroupRow: false,

        data: item,
        treeNesting,
        totalLeafNodesCount: 0,
        collapsedLeafNodesCount: 0,
        isTreeNode: true,
        isParentNode: false,
        selfLoaded: true,
        rowSelected: false,
        rowDisabled: false,
        isCellSelected: returnFalse,
        hasSelectedCells: returnFalse,
        dataSourceHasGrouping: false,
        parentNodes: Array.from(parents),
        indexInParentNodes: [...indexInParentNodes, i],
        indexInParent: i,
        indexInAll: result.length,
      };
      if (isNodeSelected) {
        rowInfo.rowSelected = isNodeSelected(rowInfo);
      }
      if (isRowDisabled) {
        rowInfo.rowDisabled = isRowDisabled(rowInfo);
      }
      if (withRowInfo) {
        withRowInfo(rowInfo);
      }

      for (let j = 0, len = parents.length; j < len; j++) {
        const parent = parents[j];
        if (!parentExpanded) {
          parent.collapsedLeafNodesCount += 1;
        }
        parent.deepRowInfoArray.push(rowInfo);
      }

      if (parentExpanded) {
        result[indexInAll] = rowInfo;
      }
      continue;
    }

    const deepMapValue = deepMap.get(nodePath);
    const totalLeafNodesCount = deepMapValue?.totalLeafNodesCount ?? 0;

    const rowInfo: InfiniteTable_Tree_RowInfoParentNode<DataType> = {
      dataSourceHasGrouping: false,
      nodeExpanded: false,
      selfExpanded: false,
      nodePath,
      id: key,
      data: item,
      indexInAll,
      indexInParent: i,
      indexInParentNodes: [...indexInParentNodes, i],
      totalLeafNodesCount,
      treeNesting,
      selfLoaded: true,
      isParentNode: true,
      isTreeNode: true,
      isGroupRow: false,
      deepRowInfoArray: [],
      parentNodes: Array.from(parents),
      collapsedLeafNodesCount: 0,
      rowSelected: false,
      rowDisabled: false,
      isCellSelected: returnFalse,
      hasSelectedCells: returnFalse,
      selectedLeafNodesCount: 0,
      deselectedLeafNodesCount: 0,
      // selectedLeafNodesCount: 0,
      // deselectedLeafNodesCount: 0,
    };

    if (isNodeSelected) {
      rowInfo.rowSelected = isNodeSelected(rowInfo);

      if (treeSelectionState) {
        const selectionCount = treeSelectionState.getSelectionCountFor(
          rowInfo.nodePath,
        );
        rowInfo.selectedLeafNodesCount = selectionCount.selectedCount;
        rowInfo.deselectedLeafNodesCount = selectionCount.deselectedCount;
      }
    }
    if (isRowDisabled) {
      rowInfo.rowDisabled = isRowDisabled(rowInfo);
    }
    if (withRowInfo) {
      withRowInfo(rowInfo);
    }
    let expanded = true;
    if (isNodeExpanded) {
      rowInfo.selfExpanded = expanded = isNodeExpanded(rowInfo);
    }
    if (!parentExpanded) {
      expanded = false;
    }
    rowInfo.nodeExpanded = expanded;

    if (parentExpanded) {
      result[indexInAll] = rowInfo;
    }

    const children = getNodeChildren(item);

    if (Array.isArray(children)) {
      flattenTreeNodes(
        children,
        nodePath,
        [...parents, rowInfo],
        rowInfo.indexInParentNodes,
        params,
        result,
      );
    }
  }

  return result;
}

export function enhancedTreeFlatten<DataType, KeyType = any>(
  param: EnhancedTreeFlattenParam<DataType, KeyType>,
): { data: InfiniteTableRowInfo<DataType>[] } {
  const { dataArray } = param;

  const result: InfiniteTableRowInfo<DataType>[] = [];

  flattenTreeNodes(dataArray, [], [], [], param, result);

  return { data: result };
}

export type EnhancedFlattenParam<DataType, KeyType = any> = {
  lazyLoad: boolean;

  groupResult: DataGroupResult<DataType, KeyType>;
  rowsPerPage?: number | null;
  repeatWrappedGroupRows?: boolean;
  toPrimaryKey: (data: DataType, index: number) => any;
  groupRowsState?: GroupRowsState;
  isRowSelected?: (rowInfo: InfiniteTableRowInfo<DataType>) => boolean | null;
  isRowDisabled?: (rowInfo: InfiniteTableRowInfo<DataType>) => boolean;

  withRowInfo?: (rowInfo: InfiniteTableRowInfo<DataType>) => void;

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
    rowsPerPage,
    repeatWrappedGroupRows,

    withRowInfo,
    toPrimaryKey,
    groupRowsState,
    isRowDisabled,
    isRowSelected,
    rowSelectionState,
    generateGroupRows,
    reducers = {},
  } = param;
  const { groupParams, deepMap, pivot } = groupResult;
  const { groupBy } = groupParams;

  // const groupByStrings = groupBy.map((g) => g.field);

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
            // groupBy: groupByStrings,
            groupBy,
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
              groupKeys.length === groupBy.length
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
      if (isRowDisabled) {
        enhancedGroupData.rowDisabled = isRowDisabled(enhancedGroupData);
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
        if (repeatWrappedGroupRows && rowsPerPage != null && rowsPerPage > 0) {
          const indexInAll = enhancedGroupData.indexInAll;
          const currentParents = enhancedGroupData.parents;

          if (currentParents.length > 0 && indexInAll % rowsPerPage === 0) {
            const currentPage = indexInAll / rowsPerPage;

            // this is not a top-level group, so we can insert duplicate parents
            currentParents.forEach((parent, i) => {
              result.push(toDuplicateRow(parent, indexInAll + i, currentPage));
            });
            enhancedGroupData.indexInAll += currentParents.length;
          }
        }
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

      if (withRowInfo) {
        withRowInfo(enhancedGroupData);
      }
      parents.push(enhancedGroupData);

      const continueWithChildren = true; //!collapsed || lazyLoad;

      if (continueWithChildren) {
        if (!next) {
          if (!pivot) {
            let startIndex = result.length;

            // using items.map would have been easier
            // but we have sparse arrays, and if the last items are sparse
            // eg: var a = Array(10); a[0] = 1;  a[1] = 2 but the rest of the positions
            // are not assigned
            // then iterating over it with `.map` or `.forEach` wont get to the end
            // which we need

            // this is a use-case we have when there is server-side batching

            // we prefer index assignment, so we have to increment the length
            // of the result array
            // by the number of items we want to add
            // this is in order to make the whole loop a tiny bit faster
            if (!collapsed) {
              result.length += items.length;
            }

            let extraArtificialGroupRows = 0;

            for (let index = 0, len = items.length; index < len; index++) {
              const item = items[index];

              if (
                !collapsed &&
                repeatWrappedGroupRows &&
                rowsPerPage != null &&
                rowsPerPage > 0
              ) {
                const currentInsertIndex =
                  startIndex + index + extraArtificialGroupRows;

                if (currentInsertIndex % rowsPerPage === 0) {
                  const currentPage = currentInsertIndex / rowsPerPage;

                  result.length += parents.length;
                  // for each group, we want to repeat it
                  parents.forEach((parent) => {
                    const i = startIndex + index + extraArtificialGroupRows;
                    result[i] = toDuplicateRow(parent, i, currentPage);
                    extraArtificialGroupRows++;
                  });
                }
              }
              const indexInAll = startIndex + index + extraArtificialGroupRows;

              const itemId = item
                ? toPrimaryKey(item, indexInAll)
                : `${groupKeys}-${index}`;
              const rowInfo: InfiniteTable_HasGrouping_RowInfoNormal<DataType> =
                {
                  id: itemId,
                  data: item,
                  isCellSelected: returnFalse,
                  hasSelectedCells: returnFalse,
                  dataSourceHasGrouping: true,
                  isTreeNode: false,
                  isGroupRow: false,
                  selfLoaded: !!item,
                  rowSelected: false,
                  rowDisabled: false,
                  rootGroupBy: groupBy,
                  collapsed,
                  groupKeys,
                  parents: Array.from(parents),
                  indexInParentGroups: [...indexInParentGroups, index],
                  indexInGroup: index,
                  indexInAll,
                  groupBy: groupBy,
                  groupNesting: groupNesting + 1,
                  groupCount: enhancedGroupData.groupCount,
                };
              if (isRowSelected) {
                rowInfo.rowSelected = isRowSelected(rowInfo);
              }
              if (isRowDisabled) {
                rowInfo.rowDisabled = isRowDisabled(rowInfo);
              }

              if (withRowInfo) {
                withRowInfo(rowInfo);
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
                result[startIndex + index + extraArtificialGroupRows] = rowInfo;
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
