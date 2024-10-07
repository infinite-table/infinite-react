export type DataSourceMutation<T> =
  | {
      type: 'delete';
      primaryKey: any;
      originalData: T;
      metadata: any;
    }
  | {
      type: 'update';
      primaryKey: any;
      data: Partial<T>;
      originalData: T;
      metadata: any;
    }
  | {
      type: 'insert';
      primaryKey: any;
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
export class DataSourceCache<DataType, PrimaryKeyType = string> {
  private affectedFields: Set<keyof DataType> = new Set();
  private allFieldsAffected: boolean = false;

  private primaryKeyToData: DataSourceMutationMap<PrimaryKeyType, DataType> =
    new Map();

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
    return this.primaryKeyToData.size === 0;
  };

  removeInfo = (primaryKey: PrimaryKeyType) => {
    this.primaryKeyToData.delete(primaryKey);
  };

  getMutationsForPrimaryKey = (
    primaryKey: PrimaryKeyType,
  ): DataSourceMutation<DataType>[] | undefined => {
    const data = this.primaryKeyToData.get(primaryKey);

    return data;
  };

  getMutationsCount = () => {
    return this.primaryKeyToData.size;
  };

  getMutations = () => {
    return new Map(this.primaryKeyToData);
  };

  getMutationsArray = () => {
    return Array.from(this.primaryKeyToData.values()).flat();
  };
}
