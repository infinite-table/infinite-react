import {
  DataSourceApi,
  DataSourceComponentActions,
  DataSourceCRUDParam,
  DataSourceSingleSortInfo,
  DataSourceState,
} from '.';
import { raf } from '../../utils/raf';
import { InfiniteTableRowInfo } from '../InfiniteTable/types';
import { DataSourceCache } from './DataSourceCache';

import { DataSourceInsertParam } from './types';

type GetDataSourceApiParam<T> = {
  getState: () => DataSourceState<T>;
  actions: DataSourceComponentActions<T>;
};

export function getDataSourceApi<T>(
  param: GetDataSourceApiParam<T>,
): DataSourceApi<T> {
  return new DataSourceApiImpl<T>(param);
}

type DataSourceOperation<T> =
  | {
      type: 'update';
      primaryKeys: any[];
      array: Partial<T>[];
      metadata: any;
    }
  | {
      type: 'delete';
      primaryKeys: any[];
      metadata: any;
    }
  | {
      type: 'insert';
      array: T[];
      position: 'before' | 'after';
      // here the primary key is the primary key of the item relative to which
      // the insert is being made - so before or after this primaryKey
      primaryKey: any;
      metadata: any;
    };

class DataSourceApiImpl<T> implements DataSourceApi<T> {
  private pendingOperations: DataSourceOperation<T>[] = [];

  private getState: () => DataSourceState<T>;
  private actions: DataSourceComponentActions<T>;

  constructor(param: GetDataSourceApiParam<T>) {
    this.getState = param.getState;
    this.actions = param.actions;
  }

  private pendingPromise: Promise<boolean> | null = null;
  private resolvePendingPromise: ((value: boolean) => void) | null = null;

  toPrimaryKey(data: T): any {
    return this.getState().toPrimaryKey(data);
  }

  batchOperation(operation: DataSourceOperation<T>) {
    if (!this.pendingPromise) {
      this.pendingPromise = new Promise((resolve) => {
        this.resolvePendingPromise = resolve;
      });
      raf(() => {
        this.commit();
      });
    }
    this.pendingOperations.push(operation);

    return this.pendingPromise;
  }

  batchOperations(operations: DataSourceOperation<T>[]) {
    this.pendingOperations.push(...operations);
  }

  private commitOperations(operations: DataSourceOperation<T>[]) {
    if (!operations.length) {
      return;
    }

    const currentCache = this.getState().cache;

    let cache = currentCache
      ? DataSourceCache.clone(currentCache, { light: true })
      : new DataSourceCache<T>();

    operations.forEach((operation) => {
      switch (operation.type) {
        case 'update':
          operation.array.forEach((data, index) => {
            const key = operation.primaryKeys[index];
            const rowInfo = this.getRowInfoByPrimaryKey(key);
            if (rowInfo && !rowInfo.isGroupRow) {
              cache.update(
                operation.primaryKeys[index],
                data,
                rowInfo.data,
                operation.metadata,
              );
            }
          });
          break;
        case 'delete':
          operation.primaryKeys.forEach((key) => {
            const rowInfo = this.getRowInfoByPrimaryKey(key);
            if (rowInfo && !rowInfo.isGroupRow) {
              cache.delete(key, rowInfo.data, operation.metadata);
            }
          });
          break;
        case 'insert':
          let pk = operation.primaryKey;
          let position = operation.position;
          operation.array.forEach((data) => {
            cache.insert(pk, data, position, operation.metadata);

            // in order to respect the order of the insertions, we need to
            // update the pk to the primary key of the last inserted item
            pk = this.toPrimaryKey(data);
            // and we need to change the position to 'after' for the next
            position = 'after';
          });
          break;
      }
    });

    // this.actions.originalLazyGroupDataChangeDetect = getChangeDetect();
    this.actions.cache = cache;
  }

  commit() {
    this.commitOperations(this.pendingOperations);
    this.pendingOperations.length = 0;

    if (this.pendingPromise && this.resolvePendingPromise) {
      const resolve = this.resolvePendingPromise;
      // let's resolve the promise in the next frame
      // so we give the DataSource reducer the chance to pick up the commited operations
      // and recompute the dataSource array (the row infos)
      // so the updated data is available when the promise is resolved
      requestAnimationFrame(() => {
        resolve(true);
      });
      this.pendingPromise = null;
      this.resolvePendingPromise = null;
    }
  }

  getRowInfoArray() {
    return this.getState().dataArray;
  }
  getRowInfoByIndex(index: number): InfiniteTableRowInfo<T> | null {
    return this.getRowInfoArray()[index] ?? null;
  }
  getRowInfoByPrimaryKey(id: any): InfiniteTableRowInfo<T> | null {
    const index = this.getIndexByPrimaryKey(id);
    return this.getRowInfoByIndex(index);
  }
  getIndexByPrimaryKey(id: any) {
    const map = this.getState().idToIndexMap;
    return map.get(id) ?? -1;
  }
  getPrimaryKeyByIndex(index: number) {
    const rowInfo = this.getRowInfoByIndex(index);

    return rowInfo ? rowInfo.id : undefined;
  }

  getOriginalDataArray = () => {
    return this.getState().originalDataArray;
  };

  getDataByPrimaryKey(id: any): T | null {
    const { indexer } = this.getState();
    return indexer.getDataForPrimaryKey(id) ?? null;
  }

  updateData(data: Partial<T>, options?: DataSourceCRUDParam) {
    return this.updateDataArray([data], options);
  }
  updateDataArray(data: Partial<T>[], options?: DataSourceCRUDParam) {
    const result = this.batchOperation({
      type: 'update',
      array: data,
      primaryKeys: data.map((d) => {
        return this.toPrimaryKey(d as T);
      }),
      metadata: options?.metadata,
    });

    if (options?.flush) {
      this.commit();
    }

    return result;
  }

  removeDataByPrimaryKey(id: any, options?: DataSourceCRUDParam) {
    const result = this.batchOperation({
      type: 'delete',
      primaryKeys: [id],
      metadata: options?.metadata,
    });

    if (options?.flush) {
      this.commit();
    }
    return result;
  }
  removeData(data: T, options?: DataSourceCRUDParam) {
    const result = this.batchOperation({
      type: 'delete',
      primaryKeys: [this.toPrimaryKey(data)],
      metadata: options?.metadata,
    });

    if (options?.flush) {
      this.commit();
    }

    return result;
  }

  removeDataArrayByPrimaryKeys(ids: any[], options?: DataSourceCRUDParam) {
    const result = this.batchOperation({
      type: 'delete',
      primaryKeys: ids,
      metadata: options?.metadata,
    });

    if (options?.flush) {
      this.commit();
    }

    return result;
  }
  removeDataArray(data: T[], options?: DataSourceCRUDParam) {
    const result = this.batchOperation({
      type: 'delete',
      primaryKeys: data.map(this.toPrimaryKey),
      metadata: options?.metadata,
    });

    if (options?.flush) {
      this.commit();
    }

    return result;
  }

  addData(data: T, options?: DataSourceCRUDParam) {
    return this.addDataArray([data], options);
  }
  addDataArray(data: T[], options?: DataSourceCRUDParam) {
    return this.insertDataArray(data, {
      ...options,
      position: 'end',
    });
  }

  insertData(data: T, options: DataSourceInsertParam) {
    return this.insertDataArray([data], options);
  }

  insertDataArray(data: T[], options: DataSourceInsertParam) {
    let position: 'before' | 'after' = 'before';
    let primaryKey: any = undefined;

    if (options.position === 'before' || options.position === 'after') {
      position = options.position;
      primaryKey = options.primaryKey;
    } else {
      const arr = this.getOriginalDataArray();

      if (options.position === 'start') {
        position = 'before';
        primaryKey = this.toPrimaryKey(arr[0]);
      } else {
        position = 'after';
        primaryKey = this.toPrimaryKey(arr[arr.length - 1]);
      }
    }
    const result = this.batchOperation({
      type: 'insert',
      array: data,
      position,
      metadata: options?.metadata,
      primaryKey: primaryKey!,
    });

    if (options?.flush) {
      this.commit();
    }

    return result;
  }

  setSortInfo(sortInfo: null | DataSourceSingleSortInfo<T>[]) {
    const multiSort = this.getState().multiSort;

    if (Array.isArray(sortInfo)) {
      //@ts-ignore - ignore for now. The type of dataSourceState.sortInfo is either null or []
      // but the signature of onSortInfoChange is different (info|info[]|null)
      // we'll need to fix this later TODO
      this.actions.sortInfo = sortInfo.length
        ? multiSort
          ? sortInfo
          : sortInfo[0]
        : null;
      return;
    }

    //@ts-ignore
    this.actions.sortInfo = sortInfo;
    return;
  }
}

export function getCacheAffectedParts<T>(state: DataSourceState<T>): {
  sortInfo: boolean;
  groupBy: boolean;
  filterValue: boolean;
  aggregationReducers: boolean;
} {
  const cache: DataSourceCache<T> | undefined = state.cache;
  if (!cache) {
    return {
      sortInfo: false,
      groupBy: false,
      filterValue: false,
      aggregationReducers: false,
    };
  }

  let sortInfoAffected = false;
  let groupByAffected = false;
  let filterAffected = false;
  let aggregationsAffected = false;

  const keys = cache.getAffectedFields();

  const { sortInfo, groupBy, filterValue, aggregationReducers } = state;

  if (sortInfo && sortInfo.length) {
    if (keys === true) {
      sortInfoAffected = true;
    } else {
      for (const sort of sortInfo) {
        let field = sort.field;
        if (field) {
          field = (Array.isArray(field) ? field : [field]) as (keyof T)[];
          sortInfoAffected = field.reduce((result: boolean, f) => {
            return result || typeof f !== 'function'
              ? keys.has(f as keyof T)
              : false;
          }, false);
          if (sortInfoAffected) {
            break;
          }
        }
      }
    }
  }
  if (groupBy && groupBy.length) {
    if (keys === true) {
      groupByAffected = true;
    } else {
      for (const group of groupBy) {
        if (group.field && keys.has(group.field)) {
          groupByAffected = true;
          break;
        }
      }
    }
  }

  if (filterValue && filterValue.length) {
    if (keys === true) {
      filterAffected = true;
    } else {
      for (const filter of filterValue) {
        if (filter.id) {
          filterAffected = true;
          break;
        }
        if (filter.field && keys.has(filter.field)) {
          filterAffected = true;
          break;
        }
      }
    }
  }

  if (aggregationReducers && Object.keys(aggregationReducers).length) {
    if (keys === true) {
      aggregationsAffected = true;
    } else {
      for (const key in aggregationReducers)
        if (aggregationReducers.hasOwnProperty(key)) {
          const reducer = aggregationReducers[key];

          if (!reducer.field) {
            aggregationsAffected = true;
            break;
          } else {
            if (keys.has(reducer.field)) {
              aggregationsAffected = true;
              break;
            }
          }
        }
    }
  }

  return {
    sortInfo: sortInfoAffected,
    groupBy: groupByAffected,
    filterValue: filterAffected,
    aggregationReducers: aggregationsAffected,
  };
}
