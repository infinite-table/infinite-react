import { DeepMap } from '../../utils/DeepMap';
import { TreeParams } from '../../utils/groupAndPivot';
import { DataSourceCache } from './DataSourceCache';
import { NodePath } from './TreeExpandState';

type IndexerOptions<DataType, PrimaryKeyType> = {
  toPrimaryKey: (data: DataType) => PrimaryKeyType;
  cache?: DataSourceCache<DataType, PrimaryKeyType>;

  getNodeChildren?: TreeParams<DataType, PrimaryKeyType>['getNodeChildren'];
  isLeafNode?: TreeParams<DataType, PrimaryKeyType>['isLeafNode'];
  nodesKey: string | undefined;
};

export class Indexer<DataType, PrimaryKeyType = string> {
  primaryKeyToData: Map<PrimaryKeyType, DataType> = new Map();
  nodePathsToData: DeepMap<PrimaryKeyType, DataType> = new DeepMap();

  private removeNodePath = (
    nodePath: NodePath,
    options?: IndexerOptions<DataType, PrimaryKeyType>,
  ) => {
    this.nodePathsToData.delete(nodePath);
    this.remove(nodePath[nodePath.length - 1]);

    if (!options) {
      return;
    }

    const data = this.nodePathsToData.get(nodePath);

    if (data) {
      const children = options.getNodeChildren
        ? options.getNodeChildren(data)
        : options.nodesKey
        ? //@ts-ignore
          data[options.nodesKey]
        : null;

      if (children && Array.isArray(children)) {
        for (let i = 0, len = children.length; i < len; i++) {
          const child = children[i];
          const childPath = [...nodePath, options.toPrimaryKey(child)];
          this.removeNodePath(childPath, options);
        }
      }
    }
  };

  private remove = (primaryKey: PrimaryKeyType) => {
    this.primaryKeyToData.delete(primaryKey);
  };

  private add = (primaryKey: PrimaryKeyType, data: DataType) => {
    this.primaryKeyToData.set(primaryKey, data);
  };

  private addNodePath = (
    nodePath: NodePath,
    data: DataType,
    options?: IndexerOptions<DataType, PrimaryKeyType>,
  ) => {
    if (__DEV__) {
      if (this.nodePathsToData.has(nodePath)) {
        console.warn(
          `There is a problem! The node at path [${nodePath.join(
            '/',
          )}] is already in the indexer! You're doing too much work!`,
        );
      }
    }
    this.nodePathsToData.set(nodePath, data);
    this.add(nodePath[nodePath.length - 1], data);

    if (!options) {
      return;
    }

    const children = options.getNodeChildren
      ? options.getNodeChildren(data)
      : options.nodesKey
      ? //@ts-ignore
        data[options.nodesKey]
      : null;

    if (children && Array.isArray(children)) {
      for (let i = 0, len = children.length; i < len; i++) {
        const child = children[i];
        const childPath = [...nodePath, options.toPrimaryKey(child)];
        this.addNodePath(childPath, child, options);
      }
    }
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
    options: IndexerOptions<DataType, PrimaryKeyType>,
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
      if (!cache.isEmpty()) {
        const cacheInfo = [
          ...cache.getMutationsArray(),
          ...cache.getTreeMutationsArray(),
        ];
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
              this.addNodePath([insertPK], info.data, options);
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

            let isTreeModeForNode = isTree && !!nodePath;
            let cacheInfo = isTreeModeForNode
              ? cache?.getMutationsForNodePath(nodePath!)
              : cache?.getMutationsForPrimaryKey(pk);

            if (cacheInfo && cacheInfo.length) {
              for (
                let cacheIndex = 0, cacheLength = cacheInfo.length;
                cacheIndex < cacheLength;
                cacheIndex++
              ) {
                const info = cacheInfo[cacheIndex];

                if (info.type === 'delete' && !deleted) {
                  if (isTreeModeForNode) {
                    this.removeNodePath(nodePath!, options);
                  } else {
                    this.remove(pk);
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
                if (info.type === 'update-children' && !deleted) {
                  const children = info.children(
                    (item as any)[nodesKey!],
                    item,
                  );
                  item = { ...item };
                  if (children !== undefined) {
                    //@ts-ignore
                    item[nodesKey] = children;
                  } else {
                    //@ts-ignore
                    delete item[nodesKey];
                  }
                  arr[i] = item;
                }

                if (info.type === 'insert') {
                  // there's no need for this this.add/this.addNodePath at this point
                  // since it's anyways done below
                  // const insertPK = toPrimaryKey(info.data);
                  // if (isTreeModeForNode) {
                  //   const currentPath = [...parentPath, insertPK];
                  //   this.addNodePath(currentPath, info.data);
                  // } else {
                  //   this.add(insertPK, info.data);
                  // }

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
                this.addNodePath(nodePath!, item);

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
