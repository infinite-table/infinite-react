export class Indexer<DataType, PrimaryKeyType = string> {
  primaryKeyToData: Map<string, DataType> = new Map();

  add = (primaryKey: PrimaryKeyType, data: DataType) => {
    this.primaryKeyToData.set(`${primaryKey}`, data);
  };

  clear = () => {
    this.primaryKeyToData.clear();
  };

  getDataForPrimaryKey = (primaryKey: PrimaryKeyType): DataType | undefined => {
    return this.primaryKeyToData.get(`${primaryKey}`);
  };

  indexArray = (
    arr: DataType[],
    toPrimaryKey: (data: DataType) => PrimaryKeyType,
  ) => {
    arr.forEach((item) => {
      if (item != null) {
        // we need this check because for lazy loading we have rows which are not loaded yet
        this.add(toPrimaryKey(item), item);
      }
    });
  };
}
