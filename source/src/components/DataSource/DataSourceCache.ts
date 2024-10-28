import { DeepMap } from '../../utils/DeepMap';
import { NodePath } from './TreeExpandState';

export type DataSourceMutation<T> =
  | {
      type: 'delete';
      primaryKey: any;
      nodePath?: never;
      originalData: T;
      metadata: any;
    }
  | {
      type: 'delete';
      primaryKey?: never;
      nodePath: NodePath;
      originalData: T;
      metadata: any;
    }
  | {
      type: 'update';
      primaryKey: any;
      nodePath?: never;
      data: Partial<T>;
      originalData: T;
      metadata: any;
    }
  | {
      type: 'update';
      primaryKey?: never;
      nodePath: NodePath;
      data: Partial<T>;
      originalData: T;
      metadata: any;
    }
  | {
      type: 'insert';
      primaryKey: any;
      nodePath?: never;
      position: 'before' | 'after';
      originalData: null;
      data: T;
      metadata: any;
    }
  | {
      type: 'insert';
      primaryKey?: never;
      nodePath: NodePath;
      position: 'before' | 'after';
      originalData: null;
      data: T;
      metadata: any;
    }
  | {
      type: 'clear-all';
      primaryKey: undefined;
      metadata: any;
    };

const CLEAR_SYMBOL = Symbol('CLEAR');

export type DataSourceMutationMap<PrimaryKeyType, DataType> = Map<
  PrimaryKeyType,
  DataSourceMutation<DataType>[]
>;

export type DataSourceNodePathMutationMap<PrimaryKeyType, DataType> = DeepMap<
  PrimaryKeyType,
  DataSourceMutation<DataType>[]
>;
export class DataSourceCache<DataType, PrimaryKeyType = string> {
  private affectedFields: Set<keyof DataType> = new Set();
  private allFieldsAffected: boolean = false;

  private primaryKeyToData: DataSourceMutationMap<PrimaryKeyType, DataType> =
    new Map();

  private nodePathToData: DataSourceNodePathMutationMap<NodePath, DataType> =
    new DeepMap();

  static clone<DataType, PrimaryKeyType = string>(
    cache: DataSourceCache<DataType, PrimaryKeyType>,
    { light = false }: { light?: boolean } = {},
  ): DataSourceCache<DataType, PrimaryKeyType> {
    const clone = new DataSourceCache<DataType, PrimaryKeyType>();

    clone.allFieldsAffected = cache.allFieldsAffected;

    clone.affectedFields = new Set(cache.affectedFields);
    clone.primaryKeyToData = light
      ? cache.primaryKeyToData
      : new Map<PrimaryKeyType, DataSourceMutation<DataType>[]>(
          cache.primaryKeyToData,
        );

    clone.nodePathToData = light
      ? cache.nodePathToData
      : DeepMap.clone(cache.nodePathToData);

    return clone;
  }

  getAffectedFields = (): true | Set<keyof DataType> => {
    if (this.allFieldsAffected) {
      return true;
    }

    return this.affectedFields;
  };

  delete = (
    primaryKey: PrimaryKeyType,
    originalData: DataType,
    metadata: any,
  ) => {
    this.allFieldsAffected = true;
    const pk = primaryKey;
    const value = this.primaryKeyToData.get(pk) || [];
    value.push({
      type: 'delete',
      primaryKey,
      originalData,
      metadata,
    });
    this.primaryKeyToData.set(pk, value);
  };

  deleteNodePath = (
    nodePath: NodePath,
    originalData: DataType,
    metadata: any,
  ) => {
    this.allFieldsAffected = true;
    const value = this.nodePathToData.get(nodePath) || [];
    value.push({
      type: 'delete',
      nodePath,
      originalData,
      metadata,
    });
    this.nodePathToData.set(nodePath, value);
  };

  insert = (
    primaryKey: PrimaryKeyType,
    data: DataType,
    position: 'before' | 'after',
    metadata: any,
  ) => {
    const pk = primaryKey;
    const value = this.primaryKeyToData.get(pk) || [];

    this.allFieldsAffected = true;

    value.push({
      type: 'insert',
      primaryKey,
      data,
      position,
      originalData: null,
      metadata,
    });
    this.primaryKeyToData.set(pk, value);
  };

  insertNodePath = (
    nodePath: NodePath,
    data: DataType,
    position: 'before' | 'after',
    metadata: any,
  ) => {
    const value = this.nodePathToData.get(nodePath) || [];

    this.allFieldsAffected = true;

    value.push({
      type: 'insert',
      nodePath,
      data,
      position,
      originalData: null,
      metadata,
    });
    this.nodePathToData.set(nodePath, value);
  };

  update = (
    primaryKey: PrimaryKeyType,
    data: Partial<DataType>,
    originalData: DataType,
    metadata: any,
  ) => {
    if (!this.allFieldsAffected) {
      const keys = Object.keys(data) as (keyof DataType)[];
      keys.forEach((key) => this.affectedFields.add(key));
    }

    const pk = primaryKey;
    const value = this.primaryKeyToData.get(pk) || [];

    value.push({
      type: 'update',
      primaryKey,
      data,
      originalData,
      metadata,
    });
    this.primaryKeyToData.set(primaryKey, value);
  };

  updateNodePath = (
    nodePath: NodePath,
    data: Partial<DataType>,
    originalData: DataType,
    metadata: any,
  ) => {
    if (!this.allFieldsAffected) {
      const keys = Object.keys(data) as (keyof DataType)[];
      keys.forEach((key) => this.affectedFields.add(key));
    }

    const value = this.nodePathToData.get(nodePath) || [];

    value.push({
      type: 'update',
      nodePath,
      data,
      originalData,
      metadata,
    });
    this.nodePathToData.set(nodePath, value);
  };

  resetDataSource = (metadata: any) => {
    this.clear();
    this.allFieldsAffected = true;

    const pk = CLEAR_SYMBOL as any as PrimaryKeyType;
    const value = this.primaryKeyToData.get(pk) || [];

    value.push({
      type: 'clear-all',
      primaryKey: undefined,
      metadata,
    });
    this.primaryKeyToData.set(pk, value);
  };

  shouldResetDataSource = () => {
    return this.primaryKeyToData.has(CLEAR_SYMBOL as any as PrimaryKeyType);
  };

  clear = () => {
    this.allFieldsAffected = false;
    this.affectedFields.clear();
    this.primaryKeyToData.clear();
  };

  isEmpty = () => {
    return this.primaryKeyToData.size === 0 && this.nodePathToData.size === 0;
  };

  removeInfo = (primaryKey: PrimaryKeyType) => {
    this.primaryKeyToData.delete(primaryKey);
  };

  removeNodePathInfo = (nodePath: NodePath) => {
    this.nodePathToData.delete(nodePath);
  };

  getMutationsForPrimaryKey = (
    primaryKey: PrimaryKeyType,
  ): DataSourceMutation<DataType>[] | undefined => {
    const data = this.primaryKeyToData.get(primaryKey);

    return data;
  };
  getMutationsForNodePath = (
    nodePath: NodePath,
  ): DataSourceMutation<DataType>[] | undefined => {
    const data = this.nodePathToData.get(nodePath);

    return data;
  };

  getMutationsCount = () => {
    return this.primaryKeyToData.size;
  };

  getMutations = () => {
    return new Map(this.primaryKeyToData);
  };

  getTreeMutations = () => {
    return DeepMap.clone(this.nodePathToData);
  };

  getMutationsArray = () => {
    return Array.from(this.primaryKeyToData.values()).flat();
  };
}
