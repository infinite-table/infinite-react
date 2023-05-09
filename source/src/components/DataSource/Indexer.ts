import { DataSourceCache } from './DataSourceCache';

export class Indexer<DataType, PrimaryKeyType = string> {
  primaryKeyToData: Map<string, DataType> = new Map();

  private add = (primaryKey: PrimaryKeyType | string, data: DataType) => {
    this.primaryKeyToData.set(`${primaryKey}`, data);
  };

  clear = () => {
    this.primaryKeyToData.clear();
  };

  getDataForPrimaryKey = (
    primaryKey: PrimaryKeyType | string,
  ): DataType | undefined => {
    return this.primaryKeyToData.get(`${primaryKey}`);
  };

  indexArray = (
    arr: DataType[],
    options: {
      toPrimaryKey: (data: DataType) => PrimaryKeyType;
      cache?: DataSourceCache<DataType>;
    },
  ) => {
    const { cache, toPrimaryKey } = options;

    if (cache) {
      // because of React.StrictMode, we need to clone the array and return a copy
      // not very efficient for large arrays
      // TODO IMPORTANT seek to improve this
      arr = arr.concat();
    }

    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      let deleted = false;
      if (item != null) {
        // we need this check because for lazy loading we have rows which are not loaded yet

        const pk = `${toPrimaryKey(item)}`;
        const cacheInfo = cache?.getMutationsForPrimaryKey(pk);

        if (cacheInfo && cacheInfo.length) {
          for (
            let cacheIndex = 0, cacheLength = cacheInfo.length;
            cacheIndex < cacheLength;
            cacheIndex++
          ) {
            const info = cacheInfo[cacheIndex];

            if (info.type === 'delete' && !deleted) {
              this.primaryKeyToData.delete(pk);
              deleted = true;
              arr.splice(i, 1);
            }

            if (info.type === 'update' && !deleted) {
              item = { ...item, ...info.data };
              // we probably don't need to recompute the pk as part of the update, as it should stay the same?
              arr[i] = item;
            }

            if (info.type === 'insert') {
              const insertPK = `${toPrimaryKey(info.data)}`;
              this.add(insertPK, info.data);

              if (info.position === 'before') {
                arr.splice(i, 0, info.data);
                // we intentionally decrement here
                // so on next loop, we can have elements inserted based on the position
                // of this newly inserted element
                i--;
              } else {
                arr.splice(i + 1, 0, info.data);
              }
            }
          }
          cache?.removeInfo(pk);
        }
        if (!deleted) {
          this.add(pk, item);
        }
      }
    }

    return arr;
  };
}
