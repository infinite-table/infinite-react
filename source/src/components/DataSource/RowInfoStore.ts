import { InfiniteTableRowInfo } from '../../utils/groupAndPivot';

// Properties to skip during comparison
const SKIP_PROPERTIES = new Set([
  // Function properties (recreated every time)
  'isCellSelected',
  'hasSelectedCells',
  // Recursive/derived properties (would cause circular refs)
  'parents',
  'deepRowInfoArray',
  'parentNodes',
]);

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
    for (let i = 0; i < a.length; i++) {
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
  if (!oldRowInfo || !newRowInfo) return false;

  // Early exit: check id first (fast primitive comparison)
  if (oldRowInfo.id !== newRowInfo.id) return false;

  // Early exit: check data reference first, then deep compare if different
  if (oldRowInfo.data !== newRowInfo.data) {
    if (!deepEqual(oldRowInfo.data, newRowInfo.data)) {
      return false;
    }
  }

  // Compare all other properties except skipped ones
  const allKeys = new Set([
    ...Object.keys(oldRowInfo),
    ...Object.keys(newRowInfo),
  ]);
  allKeys.delete('id');
  allKeys.delete('data');
  SKIP_PROPERTIES.forEach((key) => allKeys.delete(key));

  for (const key of allKeys) {
    const oldValue = (oldRowInfo as any)[key];
    const newValue = (newRowInfo as any)[key];

    // Skip function values (in case there are other functions we didn't list)
    if (typeof oldValue === 'function' || typeof newValue === 'function') {
      continue;
    }

    if (!deepEqual(oldValue, newValue)) {
      // DEBUG: Log which property caused the mismatch
      // console.log(`rowInfo[${oldRowInfo.id}] mismatch on key "${key}":`, {
      //   old: oldValue,
      //   new: newValue,
      // });
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
  setDataArray(newDataArray: InfiniteTableRowInfo<T>[]): void;

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

  const setDataArray = (newDataArray: InfiniteTableRowInfo<T>[]) => {
    const oldDataArray = dataArray;

    // Determine the max length to check
    const maxLength = Math.max(oldDataArray.length, newDataArray.length);

    // Find all indices that have changed
    const changedIndices: number[] = [];

    // Build the merged array, preserving old references for unchanged rows
    // This is critical for useSyncExternalStore which uses Object.is() comparison
    const mergedArray: InfiniteTableRowInfo<T>[] = new Array(
      newDataArray.length,
    );

    for (let i = 0; i < maxLength; i++) {
      const oldRowInfo = oldDataArray[i];
      const newRowInfo = newDataArray[i];

      // If the row was removed (newRowInfo is undefined), don't add to merged array
      if (newRowInfo === undefined) {
        // This index existed in old but not in new - it's a removed row
        changedIndices.push(i);
        continue;
      }

      // If not equal, this index changed - use new reference
      if (!deepEqualRowInfo(oldRowInfo, newRowInfo)) {
        changedIndices.push(i);
        mergedArray[i] = newRowInfo;
      } else {
        // Equal - preserve the old reference so useSyncExternalStore doesn't re-render
        mergedArray[i] = oldRowInfo!;
      }
    }

    // Update dataArray with the merged result
    dataArray = mergedArray;

    // Notify subscribers only for changed indices
    // Use queueMicrotask to defer notifications and avoid
    // "Cannot update a component while rendering a different component" error
    if (changedIndices.length > 0) {
      queueMicrotask(() => {
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

  const getDataArray = (): InfiniteTableRowInfo<T>[] => {
    return dataArray;
  };

  const clear = (): void => {
    dataArray = [];
    subscribers.clear();
  };

  return {
    setDataArray,
    getRowInfoAtIndex,
    subscribeToRowIndex,
    getDataArray,
    clear,
  };
}
