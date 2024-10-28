import { DeepMap } from '../../utils/DeepMap';
import { TreeParams } from '../../utils/groupAndPivot';
import { DataSourceCache } from './DataSourceCache';
import { NodePath } from './TreeExpandState';

export class Indexer<DataType, PrimaryKeyType = string> {
  primaryKeyToData: Map<PrimaryKeyType, DataType> = new Map();
  nodePathsToData: DeepMap<PrimaryKeyType, DataType> = new DeepMap();

  private add = (primaryKey: PrimaryKeyType, data: DataType) => {
    this.primaryKeyToData.set(primaryKey, data);
  };

  private addNodePath = (nodePath: NodePath, data: DataType) => {
    this.nodePathsToData.set(nodePath, data);
    this.add(nodePath[nodePath.length - 1], data);
  };

  clear = () => {
    this.primaryKeyToData.clear();
    this.nodePathsToData.clear();
  };

  getDataForPrimaryKey = (primaryKey: PrimaryKeyType): DataType | undefined => {
    return this.primaryKeyToData.get(primaryKey);
  };
  getDataForNodePath = (nodePath: NodePath): DataType | undefined => {
    return this.nodePathsToData.get(nodePath);
  };

  indexArray = (
    arr: DataType[],
    options: {
      toPrimaryKey: (data: DataType) => PrimaryKeyType;
      cache?: DataSourceCache<DataType, PrimaryKeyType>;

      getNodeChildren?: TreeParams<DataType, PrimaryKeyType>['getNodeChildren'];
      isLeafNode?: TreeParams<DataType, PrimaryKeyType>['isLeafNode'];
      nodesKey: string | undefined;
    },
  ) => {
    const { cache, toPrimaryKey, getNodeChildren, isLeafNode, nodesKey } =
      options;

    const isTree = !!getNodeChildren && !!isLeafNode;

    if (cache && cache.shouldResetDataSource()) {
      this.clear();
      arr = [];
    }

    const shouldCloneArray = cache && !cache.isEmpty();

    if (shouldCloneArray) {
      // because of React.StrictMode, we need to clone the array and return a copy
      // not very efficient for large arrays
      // TODO IMPORTANT seek to improve this
      arr = arr.concat();
    }

    if (!arr.length && cache) {
      const cacheInfo = cache.getMutationsArray();

      if (cacheInfo && cacheInfo.length) {
        // we had inserts when the array was empty
        for (
          let cacheIndex = 0, cacheLength = cacheInfo.length;
          cacheIndex < cacheLength;
          cacheIndex++
        ) {
          const info = cacheInfo[cacheIndex];

          if (info.type === 'insert') {
            const insertPK = toPrimaryKey(info.data);
            if (isTree) {
              this.addNodePath([insertPK], info.data);
            } else {
              this.add(insertPK, info.data);
            }
            // just add them at the end
            arr.push(info.data);
          }
        }
        cache?.removeInfo(undefined as any as PrimaryKeyType);
      }
    } else {
      const indexArray = (arr: DataType[], parentPath: NodePath) => {
        for (let i = 0; i < arr.length; i++) {
          let item = arr[i];

          //@ts-ignore
          if (shouldCloneArray && isTree && Array.isArray(item[nodesKey])) {
            item = arr[i] = { ...item };
          }

          let deleted = false;
          if (item != null) {
            // we need this check because for lazy loading we have rows which are not loaded yet

            const pk = toPrimaryKey(item);
            const nodePath = isTree ? [...parentPath, pk] : undefined;

            let isTreeModeForNode = isTree && nodePath;
            let cacheInfo = isTreeModeForNode
              ? cache?.getMutationsForNodePath(nodePath!)
              : cache?.getMutationsForPrimaryKey(pk);

            // if (
            //   isTreeModeForNode &&
            //   !cacheInfo &&
            //   (cacheInfo = cache?.getMutationsForPrimaryKey(pk))
            // ) {
            //   isTreeModeForNode = false;
            // }

            if (cacheInfo && cacheInfo.length) {
              for (
                let cacheIndex = 0, cacheLength = cacheInfo.length;
                cacheIndex < cacheLength;
                cacheIndex++
              ) {
                const info = cacheInfo[cacheIndex];

                if (info.type === 'delete' && !deleted) {
                  if (isTreeModeForNode) {
                    this.nodePathsToData.delete(nodePath!);
                  } else {
                    this.primaryKeyToData.delete(pk);
                  }
                  deleted = true;
                  arr.splice(i, 1);
                  i--;
                }

                if (info.type === 'update' && !deleted) {
                  item = { ...item, ...info.data };
                  // we probably don't need to recompute the pk as part of the update, as it should stay the same?
                  arr[i] = item;
                }

                if (info.type === 'insert') {
                  const insertPK = toPrimaryKey(info.data);
                  if (isTreeModeForNode) {
                    const currentPath = [...parentPath, insertPK];
                    this.addNodePath(currentPath, info.data);
                  } else {
                    this.add(insertPK, info.data);
                  }

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
              if (isTreeModeForNode) {
                cache?.removeNodePathInfo(nodePath!);
              } else {
                cache?.removeInfo(pk);
              }
            }
            if (!deleted) {
              if (isTreeModeForNode) {
                const isLeaf = isLeafNode!(item);
                let children = isLeaf ? null : getNodeChildren!(item);

                if (!isLeaf && Array.isArray(children)) {
                  parentPath.push(pk);

                  if (shouldCloneArray) {
                    //@ts-ignore
                    item[nodesKey] = children = children.concat();
                  }

                  indexArray(children, parentPath);

                  parentPath.pop();
                }
                this.addNodePath(nodePath!, item);
              } else {
                this.add(pk, item);
              }
            }
          }
        }
      };

      indexArray(arr, []);
    }

    return arr;
  };
}
