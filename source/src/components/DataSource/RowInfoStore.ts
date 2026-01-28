import { PerfMarker } from '../../utils/devTools';
import {
  InfiniteTableRowInfo,
  InfiniteTable_HasGrouping_RowInfoNormal,
  InfiniteTable_HasGrouping_RowInfoGroup,
  InfiniteTable_NoGrouping_RowInfoNormal,
  InfiniteTable_Tree_RowInfoLeafNode,
  InfiniteTable_Tree_RowInfoParentNode,
  InfiniteTable_RowInfoBase,
  InfiniteTable_HasGrouping_RowInfoBase,
  InfiniteTable_Tree_RowInfoBase,
} from '../../utils/groupAndPivot';

/**
 * Deep equality check for two values
 */
function deepEqual(a: any, b: any): boolean {
  // Same reference or both primitives with same value
  if (a === b) return true;

  // One is null/undefined
  if (a == null || b == null) return a === b;

  // Different types
  if (typeof a !== typeof b) return false;

  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0, len = a.length; i < len; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Objects (but not arrays)
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  // Primitives that aren't equal
  return false;
}

function isSameRowInfoType<T>(
  one: InfiniteTableRowInfo<T> | undefined,
  two: InfiniteTableRowInfo<T> | undefined,
): boolean {
  if (one === undefined || two === undefined) return false;
  if (one.isGroupRow !== two.isGroupRow) return false;
  if (one.dataSourceHasGrouping !== two.dataSourceHasGrouping) return false;
  if (one.isTreeNode !== two.isTreeNode) return false;

  if (one.isTreeNode) {
    if (
      one.isParentNode !==
      (two as InfiniteTable_Tree_RowInfoParentNode<T>).isParentNode
    )
      return false;
  }

  return true;
}

const rowInfoBase_KeysRecord: Record<
  keyof InfiniteTable_RowInfoBase<any>,
  boolean
> = {
  id: true,
  value: true,
  indexInAll: true,
  rowSelected: true,
  rowDisabled: true,
  isCellSelected: false,
  hasSelectedCells: false,
};

const rowInfo_NoGrouping_RowInfoNormal_KeysRecord: Record<
  keyof InfiniteTable_NoGrouping_RowInfoNormal<any>,
  boolean
> = {
  ...rowInfoBase_KeysRecord,
  dataSourceHasGrouping: true,
  isTreeNode: true,
  data: false,
  isGroupRow: true,
  selfLoaded: true,
};

const rowInfo_HasGrouping_RowInfoBase_KeysRecord: Record<
  keyof InfiniteTable_HasGrouping_RowInfoBase<any>,
  boolean
> = {
  indexInGroup: true,
  groupKeys: true,
  groupBy: true,
  rootGroupBy: true,
  parents: false,
  indexInParentGroups: true,
  groupCount: true,
  groupNesting: true,
  collapsed: true,
  selfLoaded: true,
};

const rowInfo_HasGrouping_RowInfoGroup_KeysRecord: Record<
  keyof InfiniteTable_HasGrouping_RowInfoGroup<any>,
  boolean
> = {
  ...rowInfoBase_KeysRecord,
  ...rowInfo_HasGrouping_RowInfoBase_KeysRecord,
  dataSourceHasGrouping: true,
  isTreeNode: true,
  data: false,
  reducerData: true,
  isGroupRow: true,
  duplicateOf: false,
  deepRowInfoArray: false,
  error: true,
  reducerResults: true,
  groupCount: true,
  groupData: true,
  selectedChildredCount: true,
  deselectedChildredCount: true,
  totalChildrenCount: true,
  collapsedChildrenCount: true,
  collapsedGroupsCount: true,
  directChildrenCount: true,
  directChildrenLoadedCount: true,
  pivotValuesMap: true,
  childrenAvailable: true,
  childrenLoading: true,
};

const rowInfo_Tree_RowInfoBase_KeysRecord: Record<
  keyof InfiniteTable_Tree_RowInfoBase<any>,
  boolean
> = {
  isTreeNode: true,
  isParentNode: true,
  indexInParent: true,

  nodePath: true,
  parentNodes: false,

  indexInParentNodes: true,

  totalLeafNodesCount: true,

  collapsedLeafNodesCount: true,
  treeNesting: true,
  selfLoaded: true,
};

const rowInfo_Tree_RowInfoLeafNode_KeysRecord: Record<
  keyof InfiniteTable_Tree_RowInfoLeafNode<any>,
  boolean
> = {
  ...rowInfoBase_KeysRecord,
  ...rowInfo_Tree_RowInfoBase_KeysRecord,
  dataSourceHasGrouping: true,
  isTreeNode: true,
  isGroupRow: true,
  isParentNode: true,
  data: false,
};

const rowInfo_Tree_RowInfoParentNode_KeysRecord: Record<
  keyof InfiniteTable_Tree_RowInfoParentNode<any>,
  boolean
> = {
  ...rowInfoBase_KeysRecord,
  ...rowInfo_Tree_RowInfoBase_KeysRecord,
  dataSourceHasGrouping: true,

  isParentNode: true,
  isGroupRow: true,

  nodeExpanded: true,
  selfExpanded: true,
  data: false,

  selectedLeafNodesCount: true,
  deepRowInfoArray: false,
  deselectedLeafNodesCount: true,
  duplicateOf: false,
};

const rowInfoKeys_noGrouping = Object.entries(
  rowInfo_NoGrouping_RowInfoNormal_KeysRecord,
)
  .map(([key, value]) => (value ? key : undefined))
  .filter(Boolean) as (keyof InfiniteTable_NoGrouping_RowInfoNormal<any>)[];
const rowInfoKeys_hasGrouping_normalRow = Object.entries(
  rowInfo_NoGrouping_RowInfoNormal_KeysRecord,
).map(([key, value]) =>
  value ? key : undefined,
) as (keyof InfiniteTable_HasGrouping_RowInfoNormal<any>)[];

const rowInfoKeys_hasGrouping_groupRow = Object.entries(
  rowInfo_HasGrouping_RowInfoGroup_KeysRecord,
).map(([key, value]) =>
  value ? key : undefined,
) as (keyof InfiniteTable_HasGrouping_RowInfoGroup<any>)[];

const rowInfoKeys_tree_leafNode = Object.entries(
  rowInfo_Tree_RowInfoLeafNode_KeysRecord,
).map(([key, value]) =>
  value ? key : undefined,
) as (keyof InfiniteTable_Tree_RowInfoLeafNode<any>)[];

const rowInfoKeys_tree_parentNode = Object.entries(
  rowInfo_Tree_RowInfoParentNode_KeysRecord,
).map(([key, value]) =>
  value ? key : undefined,
) as (keyof InfiniteTable_Tree_RowInfoParentNode<any>)[];

/**
 * Check if two rowInfo objects are equal (for change detection)
 * Returns true if they are EQUAL (no change needed)
 */
function deepEqualRowInfo<T>(
  oldRowInfo: InfiniteTableRowInfo<T> | undefined,
  newRowInfo: InfiniteTableRowInfo<T> | undefined,
): boolean {
  // Same reference = equal
  if (oldRowInfo === newRowInfo) return true;

  // One is undefined = not equal
  if (!oldRowInfo || !newRowInfo) {
    return false;
  }

  if (!isSameRowInfoType(oldRowInfo, newRowInfo)) {
    return false;
  }

  // Early exit: check id first (fast primitive comparison)
  if (oldRowInfo.id !== newRowInfo.id) return false;

  // Early exit: check data reference first, then deep compare if different
  if (oldRowInfo.data !== newRowInfo.data) {
    if (!deepEqual(oldRowInfo.data, newRowInfo.data)) {
      return false;
    }
  }

  let allKeys: string[] = [];

  if (!oldRowInfo.dataSourceHasGrouping) {
    if (oldRowInfo.isTreeNode) {
      allKeys =
        oldRowInfo.isTreeNode && oldRowInfo.isParentNode
          ? rowInfoKeys_tree_parentNode
          : rowInfoKeys_tree_leafNode;
    } else {
      allKeys = rowInfoKeys_noGrouping;
    }
  } else {
    allKeys = oldRowInfo.isGroupRow
      ? rowInfoKeys_hasGrouping_groupRow
      : rowInfoKeys_hasGrouping_normalRow;
  }

  for (const key of allKeys) {
    const oldValue = (oldRowInfo as any)[key];
    const newValue = (newRowInfo as any)[key];

    // Skip function values (in case there are other functions we didn't list)
    if (typeof oldValue === 'function' || typeof newValue === 'function') {
      continue;
    }

    if (!deepEqual(oldValue, newValue)) {
      return false;
    }
  }

  return true;
}

export interface RowInfoStore<T> {
  /**
   * Update the entire dataArray (called from reducer)
   * Compares old vs new rowInfo at each index and notifies subscribers for changed indices
   */
  notifyDataArray(
    newDataArray: InfiniteTableRowInfo<T>[],
    params?: { marker?: PerfMarker },
  ): void;

  /**
   * Get current rowInfo at index (snapshot for useSyncExternalStore)
   */
  getRowInfoAtIndex(index: number): InfiniteTableRowInfo<T> | undefined;

  /**
   * Subscribe to changes at a specific row index
   * Returns unsubscribe function
   */
  subscribeToRowIndex(rowIndex: number, callback: () => void): () => void;

  /**
   * Get current dataArray (for components that need full array)
   */
  getDataArray(): InfiniteTableRowInfo<T>[];

  /**
   * Clear the store (reset dataArray and remove all subscribers)
   */
  clear(): void;
}

type RowSubscribers = Map<number, Set<() => void>>;

export function createRowInfoStore<T>(): RowInfoStore<T> {
  let dataArray: InfiniteTableRowInfo<T>[] = [];
  const subscribers: RowSubscribers = new Map();

  const notifyDataArray = (
    newDataArray: InfiniteTableRowInfo<T>[],
    params?: { marker?: PerfMarker },
  ) => {
    const oldDataArray = dataArray;
    const marker = params?.marker;

    if (marker) {
      marker.start({
        details: [
          { name: 'new dataArray length', value: newDataArray.length },
          {
            name: 'old dataArray length',
            value: oldDataArray.length,
          },
        ],
      });
    }

    // Find all indices that have changed
    const changedIndices: number[] = [];

    const subscribedRowIndexes = getSubscribedRowIndexes();

    for (const index of subscribedRowIndexes) {
      const oldRowInfo = oldDataArray[index];
      const newRowInfo = newDataArray[index];

      // If the row was removed (newRowInfo is undefined)
      if (newRowInfo === undefined) {
        // This index existed in old but not in new - it's a removed row
        changedIndices.push(index);
        continue;
      }

      // If not equal, this index changed - use new reference
      if (!deepEqualRowInfo(oldRowInfo, newRowInfo)) {
        changedIndices.push(index);
      }
    }
    dataArray = newDataArray;

    // Notify subscribers only for changed indices
    // Use queueMicrotask to defer notifications and avoid
    // "Cannot update a component while rendering a different component" error
    if (changedIndices.length > 0) {
      queueMicrotask(() => {
        console.log('notify', changedIndices);
        for (let i = 0, len = changedIndices.length; i < len; i++) {
          const index = changedIndices[i];
          const indexSubscribers = subscribers.get(index);
          if (indexSubscribers) {
            for (const callback of indexSubscribers) {
              callback();
            }
          }
        }
      });
    }

    if (marker) {
      marker.end({
        details: [{ name: 'updated row infos', value: changedIndices.length }],
      });
    }
  };

  const getRowInfoAtIndex = (
    index: number,
  ): InfiniteTableRowInfo<T> | undefined => {
    return dataArray[index];
  };

  const subscribeToRowIndex = (
    rowIndex: number,
    callback: () => void,
  ): (() => void) => {
    let indexSubscribers = subscribers.get(rowIndex);
    if (!indexSubscribers) {
      indexSubscribers = new Set();
      subscribers.set(rowIndex, indexSubscribers);
    }
    indexSubscribers.add(callback);

    // Return unsubscribe function
    return () => {
      const subs = subscribers.get(rowIndex);
      if (subs) {
        subs.delete(callback);
        // Clean up empty sets
        if (subs.size === 0) {
          subscribers.delete(rowIndex);
        }
      }
    };
  };

  const getSubscribedRowIndexes = (): number[] => {
    return Array.from(subscribers.keys());
  };

  const getDataArray = (): InfiniteTableRowInfo<T>[] => {
    return dataArray;
  };

  const clear = (): void => {
    dataArray = [];
    subscribers.clear();
  };

  return {
    notifyDataArray,
    getRowInfoAtIndex,
    subscribeToRowIndex,

    getDataArray,
    clear,
  };
}
