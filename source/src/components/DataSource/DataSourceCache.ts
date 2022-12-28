export type DataSourceMutation<T> =
  | {
      type: 'delete';
      primaryKey: any;
    }
  | {
      type: 'update';
      primaryKey: any;
      data: Partial<T>;
    }
  | {
      type: 'insert';
      primaryKey: any;
      position: 'before' | 'after';
      data: T;
    };

export class DataSourceCache<DataType, PrimaryKeyType = string> {
  private affectedFields: Set<keyof DataType> = new Set();
  private allFieldsAffected: boolean = false;

  private primaryKeyToData: Map<string, DataSourceMutation<DataType>[]> =
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
      : new Map<string, DataSourceMutation<DataType>[]>(cache.primaryKeyToData);

    return clone;
  }

  getAffectedFields = (): true | Set<keyof DataType> => {
    if (this.allFieldsAffected) {
      return true;
    }

    return this.affectedFields;
  };

  delete = (primaryKey: PrimaryKeyType) => {
    this.allFieldsAffected = true;
    const pk = `${primaryKey}`;
    const value = this.primaryKeyToData.get(pk) || [];
    value.push({
      type: 'delete',
      primaryKey,
    });
    this.primaryKeyToData.set(pk, value);
  };

  insert = (
    primaryKey: PrimaryKeyType,
    data: DataType,
    position: 'before' | 'after',
  ) => {
    const pk = `${primaryKey}`;
    const value = this.primaryKeyToData.get(pk) || [];

    this.allFieldsAffected = true;

    value.push({
      type: 'insert',
      primaryKey,
      data,
      position,
    });
    this.primaryKeyToData.set(pk, value);
  };

  update = (primaryKey: PrimaryKeyType, data: Partial<DataType>) => {
    if (!this.allFieldsAffected) {
      const keys = Object.keys(data) as (keyof DataType)[];
      keys.forEach((key) => this.affectedFields.add(key));
    }

    const pk = `${primaryKey}`;
    const value = this.primaryKeyToData.get(pk) || [];

    value.push({
      type: 'update',
      primaryKey,
      data,
    });
    this.primaryKeyToData.set(`${primaryKey}`, value);
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
    this.primaryKeyToData.delete(`${primaryKey}`);
  };

  getMutationsForPrimaryKey = (
    primaryKey: PrimaryKeyType,
  ): DataSourceMutation<DataType>[] | undefined => {
    const data = this.primaryKeyToData.get(`${primaryKey}`);

    return data;
  };

  getMutations = () => {
    return new Map(this.primaryKeyToData);
  };
}
