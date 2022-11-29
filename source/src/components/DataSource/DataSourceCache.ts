type DataSourceCacheInfo<T> =
  | {
      type: 'delete';
      primaryKey: any;
    }
  | {
      type: 'add';
      primaryKey: any;
      index?: number;
      data: T;
    }
  | {
      type: 'update';
      primaryKey: any;
      data: Partial<T>;
    };
export class DataSourceCache<DataType, PrimaryKeyType = string> {
  // a null value means the data item has been marked as deleted

  primaryKeyToData: Map<string, DataSourceCacheInfo<DataType>> = new Map();

  delete = (primaryKey: PrimaryKeyType) => {
    this.primaryKeyToData.set(`${primaryKey}`, {
      type: 'delete',
      primaryKey,
    });
  };

  add = (primaryKey: PrimaryKeyType, data: DataType, index?: number) => {
    const pk = `${primaryKey}`;

    this.primaryKeyToData.set(pk, {
      type: 'add',
      primaryKey,
      data,
      index,
    });
  };

  update = (primaryKey: PrimaryKeyType, data: Partial<DataType>) => {
    this.primaryKeyToData.set(`${primaryKey}`, {
      type: 'update',
      primaryKey,
      data,
    });
  };

  clear = () => {
    this.primaryKeyToData.clear();
  };

  getInfo = (
    primaryKey: PrimaryKeyType,
  ): DataSourceCacheInfo<DataType> | undefined => {
    const data = this.primaryKeyToData.get(`${primaryKey}`);

    return data;
  };
}
