import {
  DataSourceApi,
  DataSourceComponentActions,
  DataSourceCRUDParam,
  DataSourceSingleSortInfo,
  DataSourceState,
  DataSourceUpdateParam,
  UpdateChildrenFn,
  WaitForNodeOptions,
} from '.';
import { InfiniteTableRowInfo } from '../InfiniteTable/types';
import { DataSourceCache } from './DataSourceCache';
import { getRowInfoAt, getRowInfoArray } from './dataSourceGetters';
import { TreeApi, TreeApiImpl } from './TreeApi';
import { RowDisabledState } from './RowDisabledState';
import { NodePath } from './TreeExpandState';
import { DataSourceInsertParam } from './types';

const DEFAULT_NODE_PATH_WAIT_TIMEOUT = 1000;

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
      nodePaths?: never;
      array: Partial<T>[];
      metadata: any;
    }
  | {
      type: 'update';
      primaryKeys?: never;
      nodePaths: NodePath[];
      array: (Partial<T> | UpdateChildrenFn<T>)[];
      metadata: any;
    }
  | {
      type: 'delete';
      primaryKeys: any[];
      nodePaths?: never;
      metadata: any;
    }
  | {
      type: 'delete';
      primaryKeys?: never;
      nodePaths: NodePath[];
      metadata: any;
    }
  | {
      type: 'insert';
      array: T[];
      position: 'before' | 'after';
      // here the primary key is the primary key of the item relative to which
      // the insert is being made - so before or after this primaryKey
      primaryKey: any;
      nodePath?: never;
      metadata: any;
    }
  | {
      type: 'insert';
      array: T[];
      position: 'before' | 'after';
      // here the primary key is the primary key of the item relative to which
      // the insert is being made - so before or after this primaryKey
      primaryKey?: never;
      nodePath: NodePath;
      metadata: any;
    }
  | {
      type: 'replace-all';
      array: T[];
      metadata: any;
    };

class DataSourceApiImpl<T> implements DataSourceApi<T> {
  private pendingOperations: DataSourceOperation<T>[] = [];

  public treeApi: TreeApi<T>;

  private getState: () => DataSourceState<T>;
  private actions: DataSourceComponentActions<T>;
  //@ts-ignore
  private batchOperationRafId: any = 0;
  //@ts-ignore
  private batchOperationTimeoutId: any = 0;

  constructor(param: GetDataSourceApiParam<T>) {
    this.getState = param.getState;
    this.getState().__apiRef.current = this;
    this.actions = param.actions;
    this.treeApi = new TreeApiImpl({ ...param, dataSourceApi: this });
  }

  private pendingPromise: Promise<boolean> | null = null;
  private resolvePendingPromise: ((value: boolean) => void) | null = null;

  toPrimaryKey = (data: T): any => {
    return this.getState().toPrimaryKey(data);
  };

  getPendingOperationPromise(): Promise<boolean> | null {
    return this.pendingPromise;
  }

  batchOperation(operation: DataSourceOperation<T>) {
    if (!this.pendingPromise) {
      this.pendingPromise = new Promise((resolve) => {
        this.resolvePendingPromise = resolve;
      });

      const delay = Math.max(0, this.getState().batchOperationDelay ?? 0);

      if (delay === 0) {
        this.batchOperationRafId = setTimeout(() => {
          this.commit();
        });
      } else {
        this.batchOperationTimeoutId = setTimeout(() => {
          this.batchOperationRafId = setTimeout(() => {
            this.commit();
          });
        }, delay);
      }
    }
    if (operation.type === 'replace-all') {
      this.pendingOperations.length = 0;
    }

    this.pendingOperations.push(operation);

    return this.pendingPromise;
  }

  private commitOperations(operations: DataSourceOperation<T>[]) {
    if (!operations.length) {
      return;
    }

    const currentCache = this.getState().cache;

    const { isTree, nodesKey } = this.getState();

    let cache = currentCache
      ? DataSourceCache.clone(currentCache, { light: true })
      : new DataSourceCache<T>({ nodesKey: isTree ? nodesKey : undefined });

    operations.forEach((operation) => {
      switch (operation.type) {
        case 'update':
          operation.array.forEach((data, index) => {
            if (operation.primaryKeys) {
              const key = operation.primaryKeys[index];
              const originalData = this.getDataByPrimaryKey(key);
              if (originalData) {
                cache.update(
                  operation.primaryKeys[index],
                  data as Partial<T>,
                  originalData,
                  operation.metadata,
                );
              }
            } else if (operation.nodePaths) {
              const originalData = this.getDataByNodePath(
                operation.nodePaths[index],
              );

              if (originalData) {
                if (typeof data === 'function') {
                  cache.updateChildren(
                    operation.nodePaths[index],
                    data,
                    originalData,
                    operation.metadata,
                  );
                } else {
                  cache.updateNodePath(
                    operation.nodePaths[index],
                    data,
                    originalData,
                    operation.metadata,
                  );
                }
              }
            }
          });
          break;
        case 'delete':
          if (operation.primaryKeys) {
            operation.primaryKeys.forEach((key) => {
              const originalData = this.getDataByPrimaryKey(key);
              if (originalData) {
                cache.delete(key, originalData, operation.metadata);
              }
            });
          } else if (operation.nodePaths) {
            operation.nodePaths.forEach((nodePath) => {
              const originalData = this.getDataByNodePath(nodePath);
              if (originalData) {
                cache.deleteNodePath(
                  nodePath,
                  originalData,
                  operation.metadata,
                );
              }
            });
          }
          break;
        case 'insert':
          let pk = operation.primaryKey;
          let position = operation.position;
          let nodePath = operation.nodePath;

          if (nodePath) {
            operation.array.forEach((data) => {
              cache.insertNodePath(
                [...nodePath!],
                data,
                position,
                operation.metadata,
              );
              // in order to respect the order of the insertions, we need to
              // update the nodePath to the nodePath of the last inserted item
              pk = this.toPrimaryKey(data);
              nodePath!.pop();
              nodePath!.push(pk);
              // and we need to change the position to 'after' for the next
              position = 'after';
            });
          } else {
            operation.array.forEach((data) => {
              cache.insert(pk, data, position, operation.metadata);

              // in order to respect the order of the insertions, we need to
              // update the pk to the primary key of the last inserted item
              pk = this.toPrimaryKey(data);
              // and we need to change the position to 'after' for the next
              position = 'after';
            });
          }
          break;
        case 'replace-all':
          cache.resetDataSource(operation.metadata);
          break;
      }
    });

    // this.actions.originalLazyGroupDataChangeDetect = getChangeDetect();
    this.actions.cache = cache;
  }

  flush() {
    return this.commit();
  }

  waitForNodePath(
    nodePath: NodePath,
    options?: { timeout?: number },
  ): Promise<boolean> {
    const state = this.getState();

    if (this.isNodePathAvailable(nodePath)) {
      return Promise.resolve(true);
    }

    const timeout = options?.timeout ?? DEFAULT_NODE_PATH_WAIT_TIMEOUT;

    const result = state.waitForNodePathPromises.get(nodePath);

    if (result) {
      return result.promise;
    }

    const timestamp = Date.now();
    let resolve: (value: boolean) => void = () => {};

    const promise = new Promise<boolean>((res) => {
      let resolved: boolean | undefined;
      let timeoutId: any;

      resolve = (value: boolean) => {
        clearTimeout(timeoutId);
        resolved = value;
        state.waitForNodePathPromises.delete(nodePath);
        res(value);
      };

      timeoutId = setTimeout(() => {
        if (resolved === undefined) {
          resolve(false);
        }
      }, timeout);
    });

    state.waitForNodePathPromises.set(nodePath, {
      timestamp,
      promise,
      resolve,
    });

    return promise;
  }

  commit() {
    this.commitOperations(this.pendingOperations);
    this.pendingOperations.length = 0;

    const pendingPromise = this.pendingPromise;
    if (pendingPromise && this.resolvePendingPromise) {
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

    return pendingPromise || Promise.resolve(true);
  }

  getRowInfoArray = () => {
    return getRowInfoArray(this.getState);
  };
  getRowInfoByIndex = (index: number): InfiniteTableRowInfo<T> | null => {
    return getRowInfoAt(index, this.getState) ?? null;
  };
  getRowInfoByPrimaryKey = (id: any): InfiniteTableRowInfo<T> | null => {
    const index = this.getIndexByPrimaryKey(id);
    return this.getRowInfoByIndex(index);
  };

  getRowInfoByNodePath = (
    nodePath: NodePath,
  ): InfiniteTableRowInfo<T> | null => {
    const index = this.getIndexByNodePath(nodePath);
    return this.getRowInfoByIndex(index);
  };

  getIndexByPrimaryKey = (id: any) => {
    const map = this.getState().idToIndexMap;
    return map.get(id) ?? -1;
  };
  getIndexByNodePath = (nodePath: NodePath) => {
    const map = this.getState().pathToIndexMap;
    return map.get(nodePath) ?? -1;
  };
  getNodePathById = (id: any): NodePath | null => {
    const map = this.getState().idToPathMap;
    return map.get(id) ?? null;
  };
  getNodePathByIndex = (index: number): NodePath | null => {
    const rowInfo = this.getRowInfoByIndex(index);
    return rowInfo && rowInfo.isTreeNode ? rowInfo.nodePath : null;
  };
  getPrimaryKeyByIndex = (index: number) => {
    const rowInfo = this.getRowInfoByIndex(index);

    return rowInfo ? rowInfo.id : undefined;
  };

  getOriginalDataArray = () => {
    return this.getState().originalDataArray;
  };

  getDataByIndex = (index: number): T | null => {
    const rowInfo = this.getRowInfoByIndex(index);
    if (!rowInfo) {
      return null;
    }
    return rowInfo.data as T;
  };

  getDataByPrimaryKey = (id: any): T | null => {
    const { indexer } = this.getState();
    return indexer.getDataForPrimaryKey(id) ?? null;
  };

  isNodePathAvailable = (nodePath: NodePath): boolean => {
    return this.getState().indexer.getDataForNodePath(nodePath) !== undefined;
  };

  getDataByNodePath = (nodePath: NodePath): T | null => {
    const { indexer } = this.getState();
    const data = indexer.getDataForNodePath(nodePath);

    if (!data) {
      if (__DEV__) {
        console.warn(
          `getDataByNodePath: no data found for nodePath: "${nodePath.join(
            ' / ',
          )}"`,
        );
      }
      return null;
    }

    return data;
  };

  /**
   * Replaces all data in the DataSource with the provided data.
   * @param data - The new data to replace the existing data with.
   * @param options - Additional options for the operation.
   * @param options.flush - If true, the mutations will be flushed immediately.
   * @param options.metadata - Additional metadata for the operation.
   * @returns A promise that resolves when the operation is complete.
   */
  replaceAllData = (data: T[], options?: DataSourceCRUDParam) => {
    this.batchOperation({
      type: 'replace-all',
      array: data,
      metadata: options?.metadata,
    });

    return this.addDataArray(data, options);
  };

  /**
   * Clears all data in the DataSource.
   * @param options - Additional options for the operation.
   * @param options.flush - If true, the mutations will be flushed immediately.
   * @param options.metadata - Additional metadata for the operation.
   * @returns A promise that resolves when the operation is complete.
   */
  clearAllData = (options?: DataSourceCRUDParam) => {
    return this.replaceAllData([], options);
  };

  updateData = (data: Partial<T>, options?: DataSourceUpdateParam) => {
    return this.updateDataArray([data], options);
  };
  updateDataArray = (data: Partial<T>[], options?: DataSourceCRUDParam) => {
    const isTree = this.getState().isTree;
    let primaryKeys: any[] | undefined = !isTree
      ? data.map((d) => {
          return this.toPrimaryKey(d as T);
        })
      : undefined;

    const nodePaths = isTree
      ? data.map((d) => {
          return this.getNodePathById(this.toPrimaryKey(d as T)) || [];
        })
      : null;

    const result = primaryKeys
      ? this.batchOperation({
          type: 'update',
          array: data,
          primaryKeys: data.map((d) => {
            return this.toPrimaryKey(d as T);
          }),
          metadata: options?.metadata,
        })
      : this.batchOperation({
          type: 'update',
          array: data,
          nodePaths: nodePaths || [],
          metadata: options?.metadata,
        });

    if (options?.flush) {
      this.commit();
    }

    return result;
  };

  private withWaitForNode = <X = boolean>(
    nodePath: NodePath,
    fn: (opts: {
      error?: string | true | Error;
      resolved: boolean | undefined;
    }) => X | Promise<X>,
    options?: WaitForNodeOptions,
  ): Promise<X> => {
    const waitForNode = options?.waitForNode ?? true;

    if (waitForNode === true || typeof waitForNode === 'number') {
      let timeout =
        waitForNode === true ? DEFAULT_NODE_PATH_WAIT_TIMEOUT : waitForNode;

      if (!isNaN(timeout)) {
        timeout = DEFAULT_NODE_PATH_WAIT_TIMEOUT;
      }

      return this.waitForNodePath(nodePath, { timeout }).then((okay) => {
        if (!okay) {
          const error = `Cannot find node path "${nodePath.join(
            '/',
          )}" (we waited for it ${timeout}ms)`;
          console.error(error);

          return fn({
            error,
            resolved: false,
          });
        }

        return fn({
          resolved: true,
        });
      });
    }

    const result = fn({
      resolved: undefined,
    });

    return result instanceof Promise ? result : Promise.resolve(result);
  };

  updateChildrenByNodePath = (
    childrenOrFn: T[] | undefined | null | UpdateChildrenFn<T>,
    nodePath: NodePath,
    options?: DataSourceUpdateParam,
  ) => {
    return this.withWaitForNode(
      nodePath,
      ({ error }) => {
        if (error) {
          return false;
        }

        return this.updateChildrenByNodePath_Internal(
          childrenOrFn,
          nodePath,
          options,
        );
      },
      options,
    );
  };

  private updateChildrenByNodePath_Internal = (
    childrenOrFn: T[] | undefined | null | UpdateChildrenFn<T>,
    nodePath: NodePath,
    options?: DataSourceUpdateParam,
  ) => {
    const children =
      typeof childrenOrFn === 'function' ? childrenOrFn : () => childrenOrFn;

    return this.updateDataArrayByNodePath_Internal(
      [
        {
          nodePath,
          children,
        },
      ],
      options,
    );
  };

  updateDataByNodePath = (
    data: Partial<T>,
    nodePath: NodePath,
    options?: DataSourceUpdateParam,
  ) => {
    if (!this.isNodePathAvailable(nodePath)) {
      return this.withWaitForNode(
        nodePath,
        ({ error }) => {
          if (error) {
            return false;
          }

          return this.updateDataArrayByNodePath_Internal(
            [
              {
                data,
                nodePath,
              },
            ],
            options,
          );
        },
        options,
      );
    }

    return this.updateDataArrayByNodePath_Internal(
      [
        {
          data,
          nodePath,
        },
      ],
      options,
    );
  };

  updateDataArrayByNodePath = (
    updateInfo: ({
      nodePath: NodePath;
    } & (
      | {
          data: Partial<T>;
          children?: never;
        }
      | {
          data?: never;
          children: UpdateChildrenFn<T>;
        }
    ))[],
    options?: DataSourceUpdateParam,
  ) => {
    if (
      options &&
      typeof options.waitForNode !== 'undefined' &&
      !options.waitForNode
    ) {
      return this.updateDataArrayByNodePath_Internal(updateInfo, options);
    }

    const allNodePaths = updateInfo.map((info) => info.nodePath);

    const promiseWithAll = Promise.allSettled(
      allNodePaths.map((nodePath) => {
        return this.withWaitForNode(nodePath, ({ error }) => !error, options);
      }),
    );

    return promiseWithAll.then((allGood) => {
      if (!allGood.every(Boolean)) {
        return false;
      }
      return this.updateDataArrayByNodePath_Internal(updateInfo, options);
    });
  };

  updateDataArrayByNodePath_Internal = (
    updateInfo: ({
      nodePath: NodePath;
    } & (
      | {
          data: Partial<T>;
          children?: never;
        }
      | {
          data?: never;
          children: UpdateChildrenFn<T>;
        }
    ))[],
    options?: DataSourceUpdateParam,
  ) => {
    const data: (Partial<T> | UpdateChildrenFn<T>)[] = [];
    const nodePaths: NodePath[] = [];

    updateInfo.forEach((info) => {
      if (info.data) {
        data.push(info.data);
      } else if (info.children) {
        data.push(info.children);
      }
      nodePaths.push(info.nodePath);
    });

    const result = this.batchOperation({
      type: 'update',
      array: data,
      nodePaths: nodePaths,
      metadata: options?.metadata,
    });

    if (options?.flush) {
      this.commit();
    }

    return result;
  };

  removeDataByPrimaryKey = (id: any, options?: DataSourceCRUDParam) => {
    const isTree = this.getState().isTree;
    if (isTree) {
      return this.removeDataByNodePath(this.getNodePathById(id) || [], options);
    }

    const result = this.batchOperation({
      type: 'delete',
      primaryKeys: [id],
      metadata: options?.metadata,
    });

    if (options?.flush) {
      this.commit();
    }
    return result;
  };
  removeDataByNodePath = (
    nodePath: NodePath,
    options?: DataSourceCRUDParam,
  ) => {
    return this.batchDeleteNodePaths([nodePath], options);
  };

  removeData = (data: T, options?: DataSourceCRUDParam) => {
    const isTree = this.getState().isTree;

    if (isTree) {
      const nodePath = this.getNodePathById(this.toPrimaryKey(data));
      return this.removeDataByNodePath(nodePath!, options);
    }

    return this.batchDeletePrimaryKeys([this.toPrimaryKey(data)], options);
  };

  removeDataArrayByPrimaryKeys = (
    ids: any[],
    options?: DataSourceCRUDParam,
  ) => {
    const isTree = this.getState().isTree;

    if (isTree) {
      const nodePaths = ids.map((id) => this.getNodePathById(id) || []);
      return this.batchDeleteNodePaths(nodePaths!, options);
    }

    return this.batchDeletePrimaryKeys(ids, options);
  };

  private batchDeleteNodePaths = (
    nodePaths: NodePath[],
    options?: DataSourceCRUDParam,
  ) => {
    const result = this.batchOperation({
      type: 'delete',
      nodePaths: nodePaths || [],
      metadata: options?.metadata,
    });

    if (options?.flush) {
      this.commit();
    }

    return result;
  };

  private batchDeletePrimaryKeys = (
    primaryKeys: any[],
    options?: DataSourceCRUDParam,
  ) => {
    const result = this.batchOperation({
      type: 'delete',
      primaryKeys,
      metadata: options?.metadata,
    });

    if (options?.flush) {
      this.commit();
    }

    return result;
  };
  removeDataArray = (data: T[], options?: DataSourceCRUDParam) => {
    const isTree = this.getState().isTree;

    if (isTree) {
      const nodePaths = data.map((d) => {
        return this.getNodePathById(this.toPrimaryKey(d)) || [];
      });

      return this.batchDeleteNodePaths(nodePaths, options);
    }

    const primaryKeys = data.map(this.toPrimaryKey);

    return this.batchDeletePrimaryKeys(primaryKeys, options);
  };

  addData = (data: T, options?: DataSourceCRUDParam) => {
    return this.addDataArray([data], options);
  };
  addDataArray = (data: T[], options?: DataSourceCRUDParam) => {
    return this.insertDataArray(data, {
      ...options,
      position: 'end',
    });
  };

  insertData = (data: T, options: DataSourceInsertParam) => {
    return this.insertDataArray([data], options);
  };

  insertDataArray = (data: T[], options: DataSourceInsertParam) => {
    const isTree = this.getState().isTree;

    let position: 'before' | 'after' = 'before';
    let primaryKey: any = undefined;
    let nodePath: NodePath | undefined = options.nodePath;

    if (isTree && nodePath?.length) {
      return this.withWaitForNode(
        nodePath,
        ({ error }) => {
          if (error) {
            return false;
          }

          if (options.position === 'before' || options.position === 'after') {
            return this.batchTreeInsert(
              data,
              options.position,
              nodePath!,
              options,
            );
          }

          const newChildren: UpdateChildrenFn<T> = (childrenOfNode) => {
            return options.position === 'start'
              ? [...data, ...(childrenOfNode || [])]
              : [...(childrenOfNode || []), ...data];
          };

          return this.updateChildrenByNodePath(newChildren, nodePath!, options);
        },
        options,
      );
    }

    if (options.position === 'before' || options.position === 'after') {
      position = options.position;
      primaryKey = options.primaryKey;
    } else {
      const arr = this.getOriginalDataArray();

      if (options.position === 'start') {
        position = 'before';

        if (!arr.length) {
          primaryKey = undefined;
        } else {
          primaryKey = this.toPrimaryKey(arr[0]);
        }
      } else {
        position = 'after';

        if (!arr.length) {
          primaryKey = undefined;
        } else {
          primaryKey = this.toPrimaryKey(arr[arr.length - 1]);
        }
      }
    }

    const result = this.batchOperation({
      type: 'insert',
      array: data,
      position,
      metadata: options?.metadata,
      nodePath: this.getNodePathById(primaryKey) || [],
      primaryKey,
    });

    if (options?.flush) {
      this.commit();
    }

    return result;
  };

  private batchTreeInsert = (
    data: T[],
    position: 'before' | 'after',
    nodePath: NodePath,
    options: DataSourceInsertParam,
  ) => {
    if (nodePath.length && !this.isNodePathAvailable(nodePath)) {
      return this.withWaitForNode(
        nodePath,
        ({ error }) => {
          if (error) {
            return false;
          }
          const result = this.batchOperation({
            type: 'insert',
            array: data,
            position,
            metadata: options?.metadata,
            nodePath,
          });

          if (options?.flush) {
            this.commit();
          }

          return result;
        },
        options,
      );
    }

    const result = this.batchOperation({
      type: 'insert',
      array: data,
      position,
      metadata: options?.metadata,
      nodePath,
    });

    if (options?.flush) {
      this.commit();
    }

    return result;
  };

  setSortInfo = (sortInfo: null | DataSourceSingleSortInfo<T>[]) => {
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
  };

  isRowDisabledAt = (rowIndex: number) => {
    const rowInfo = this.getRowInfoByIndex(rowIndex);

    return rowInfo?.rowDisabled ?? false;
  };

  isRowDisabled = (primaryKey: any) => {
    const rowInfo = this.getRowInfoByPrimaryKey(primaryKey);

    return rowInfo?.rowDisabled ?? false;
  };

  setRowEnabledAt = (rowIndex: number, enabled: boolean) => {
    const currentRowDisabledState = this.getState().rowDisabledState;

    const rowDisabledState = currentRowDisabledState
      ? new RowDisabledState<T>(currentRowDisabledState)
      : new RowDisabledState<T>({
          enabledRows: true,
          disabledRows: [],
        });

    const rowInfo = this.getRowInfoByIndex(rowIndex);
    if (!rowInfo) {
      return;
    }
    rowDisabledState.setRowEnabled(rowInfo.id, enabled);

    this.actions.rowDisabledState = rowDisabledState;
  };

  setRowEnabled = (primaryKey: any, enabled: boolean) => {
    const rowInfo = this.getRowInfoByPrimaryKey(primaryKey);
    if (!rowInfo) {
      return;
    }
    this.setRowEnabledAt(rowInfo.indexInAll, enabled);
  };

  enableAllRows = () => {
    const currentRowDisabledState = this.getState().rowDisabledState;

    if (!currentRowDisabledState) {
      this.actions.rowDisabledState = new RowDisabledState<T>({
        enabledRows: true,
        disabledRows: [],
      });
      return;
    }

    const rowDisabledState = new RowDisabledState(currentRowDisabledState);
    rowDisabledState.enableAll();
    this.actions.rowDisabledState = rowDisabledState;
  };
  disableAllRows = () => {
    const currentRowDisabledState = this.getState().rowDisabledState;

    if (!currentRowDisabledState) {
      this.actions.rowDisabledState = new RowDisabledState<T>({
        disabledRows: true,
        enabledRows: [],
      });
      return;
    }

    const rowDisabledState = new RowDisabledState(currentRowDisabledState);
    rowDisabledState.disableAll();
    this.actions.rowDisabledState = rowDisabledState;
  };

  areAllRowsEnabled = () => {
    const rowDisabledState = this.getState().rowDisabledState;
    return rowDisabledState ? rowDisabledState.areAllEnabled() : true;
  };

  areAllRowsDisabled = () => {
    const rowDisabledState = this.getState().rowDisabledState;
    return rowDisabledState ? rowDisabledState.areAllDisabled() : false;
  };
}

export function getCacheAffectedParts<T>(state: DataSourceState<T>): {
  sortInfo: boolean;
  groupBy: boolean;
  tree: boolean;
  filterValue: boolean;
  aggregationReducers: boolean;
} {
  const cache: DataSourceCache<T> | undefined = state.cache;
  if (!cache) {
    return {
      sortInfo: false,
      groupBy: false,
      tree: false,
      filterValue: false,
      aggregationReducers: false,
    };
  }

  let sortInfoAffected = false;
  let groupByAffected = false;
  let treeAffected = false;
  let filterAffected = false;
  let aggregationsAffected = false;

  const keys = cache.getAffectedFields();

  const {
    sortInfo,
    groupBy,
    filterValue,
    aggregationReducers,
    nodesKey,
    isTree,
  } = state;

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

  if (isTree) {
    if (keys === true) {
      treeAffected = true;
    } else {
      treeAffected = keys.has(nodesKey as keyof T);
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
    tree: treeAffected,
  };
}
