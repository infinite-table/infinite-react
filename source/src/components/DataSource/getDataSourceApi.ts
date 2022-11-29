import { DataSourceApi, DataSourceCRUDParam, DataSourceState } from '.';
import { DataSourceCache } from './DataSourceCache';

type GetDataSourceApiParam<T> = {
  getState: () => DataSourceState<T>;
};

export function getDataSourceApi<T>(
  param: GetDataSourceApiParam<T>,
): DataSourceApi<T> {
  return new DataSourceApiImpl<T>(param);
}

type DataSourceOperation<T> =
  | {
      type: 'update';
      array: T[];
    }
  | {
      type: 'delete';
      primaryKeys: any[];
    }
  | {
      type: 'add';
      array: T[];
    };

class DataSourceApiImpl<T> implements DataSourceApi<T> {
  private pendingOperations: DataSourceOperation<T>[] = [];

  private getState: () => DataSourceState<T>;

  constructor(param: GetDataSourceApiParam<T>) {
    this.getState = param.getState;
  }

  toPrimaryKey(data: T): any {
    return this.getState().toPrimaryKey(data);
  }

  batchOperation(operation: DataSourceOperation<T>) {
    this.pendingOperations.push(operation);
  }

  batchOperations(operations: DataSourceOperation<T>[]) {
    this.pendingOperations.push(...operations);
  }

  commitOperations(operations: DataSourceOperation<T>[]) {
    if (!operations.length) {
      return;
    }

    let cache = this.getState().cache || new DataSourceCache<T>();

    operations.forEach((operation) => {
      switch (operation.type) {
        case 'update':
          operation.array.forEach((data) => {
            cache.update(this.toPrimaryKey(data), data);
          });
          break;
        case 'delete':
          operation.primaryKeys.forEach((key) => {
            cache.delete(key);
          });
          break;
        case 'add':
          operation.array.forEach((data) => {
            cache.add(this.toPrimaryKey(data), data);
          });
          break;
      }
    });
  }

  commit() {
    this.commitOperations(this.pendingOperations);
    this.pendingOperations.length = 0;
  }

  getRowInfoArray() {
    return this.getState().dataArray;
  }

  getDataByPrimaryKey(_id: any): T | null {
    return null;
  }

  updateData(data: T, options?: DataSourceCRUDParam) {
    this.updateDataArray([data], options);
  }
  updateDataArray(data: T[], options?: DataSourceCRUDParam) {
    this.batchOperation({
      type: 'update',
      array: data,
    });

    if (options?.flush) {
      this.commit();
    }
  }

  removeDataByPrimaryKey(id: any, options?: DataSourceCRUDParam) {
    this.batchOperation({
      type: 'delete',
      primaryKeys: [id],
    });

    if (options?.flush) {
      this.commit();
    }
  }
  removeData(data: T, options?: DataSourceCRUDParam) {
    this.batchOperation({
      type: 'delete',
      primaryKeys: [this.toPrimaryKey(data)],
    });

    if (options?.flush) {
      this.commit();
    }
  }

  removeDataArrayByPrimaryKeys(ids: any[], options?: DataSourceCRUDParam) {
    this.batchOperation({
      type: 'delete',
      primaryKeys: ids,
    });

    if (options?.flush) {
      this.commit();
    }
  }
  removeDataArray(data: T[], options?: DataSourceCRUDParam) {
    this.batchOperation({
      type: 'delete',
      primaryKeys: data.map(this.toPrimaryKey),
    });

    if (options?.flush) {
      this.commit();
    }
  }

  addData(data: T, options?: DataSourceCRUDParam) {
    this.addDataArray([data], options);
  }
  addDataArray(data: T[], options?: DataSourceCRUDParam) {
    this.batchOperation({
      type: 'add',
      array: data,
    });

    if (options?.flush) {
      this.commit();
    }
  }
}
