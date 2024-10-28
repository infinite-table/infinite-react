import { DeepMap } from '../DeepMap';
import { once } from '../DeepMap/once';

const emptyFn = () => {};
type ToPath<T> = (data: T) => string[];

type ToTreeDataArrayOptions<T, RESULT_T> = {
  nodesKey: keyof RESULT_T;
  pathKey: keyof T | string | ToPath<T>;
  emptyGroup?: object | ((path: string[], children: T[]) => object);
};

export function toTreeDataArray<T = any, RESULT_T = any>(
  data: T[],
  options: ToTreeDataArrayOptions<T, RESULT_T>,
) {
  const treeMap = new DeepMap<string, any>();

  const nodesKey = options.nodesKey ?? 'children';
  const emptyGroup = options.emptyGroup ?? {};

  const toPath: ToPath<T> =
    typeof options.pathKey === 'function'
      ? options.pathKey
      : (data: T) => data[options.pathKey as keyof T] as any as string[];

  for (const item of data) {
    const path = toPath(item);

    // this for-loop is to create all the intermediate nodes in the tree
    // so we can visit them using getKeysStartingWith
    //
    // not the best for perf, but can be optimized later
    for (let i = 0; i < path.length; i++) {
      const p = path.slice(0, i);
      if (!treeMap.has(p)) {
        treeMap.set(p, undefined);
      }
    }
    treeMap.set(path, item);
  }

  function traverse(path: string[], arr: RESULT_T[]) {
    const nextLevelKeys = treeMap.getKeysStartingWith(path, true, 1);

    for (const nextLevelKey of nextLevelKeys) {
      const p = [...path, nextLevelKey[nextLevelKey.length - 1]];
      let item = treeMap.get(p);

      // @ts-ignore
      const children: RESULT_T[] = item ? item[nodesKey] ?? [] : [];

      traverse(p, children);

      if (children.length) {
        if (!item) {
          item =
            typeof emptyGroup === 'function'
              ? emptyGroup(p, children)
              : emptyGroup;
        }
        // @ts-ignore
        item[nodesKey as keyof T] = children;
      }
      arr.push(item);
    }

    return arr;
  }
  return traverse([], []);
}

type TreeOptions<DataType, _KeyType> = {
  isLeafNode: (item: DataType) => boolean;
  getNodeChildren: (item: DataType) => null | DataType[];
  toKey: (item: DataType) => any;
};

export type TreeTraverseOptions<DataType> = {
  onParentNode?: (
    item: DataType,
    next: () => void,
    children: DataType[],
  ) => void;
  onNode?: (item: DataType, next: () => void) => void;
  onLeafNode?: (item: DataType) => void;
};

function traverseTreeNode<DataType, KeyType>(
  traverseParams: TreeOptions<DataType, KeyType>,
  treeTraverseOptions: TreeTraverseOptions<DataType>,
  parentPath: KeyType[],
  item: DataType,
) {
  const { isLeafNode, getNodeChildren, toKey } = traverseParams;
  const { onParentNode, onNode, onLeafNode } = treeTraverseOptions;

  const id = toKey(item);
  const nodePath = [...parentPath, id];
  const isLeaf = isLeafNode(item);

  const next = once(() => {
    const children = getNodeChildren(item);

    if (!children || !Array.isArray(children)) {
      return;
    }

    for (let i = 0, len = children.length; i < len; i++) {
      const child = children[i];

      traverseTreeNode(traverseParams, treeTraverseOptions, nodePath, child);
    }
  });

  if (isLeaf) {
    onLeafNode?.(item);
    onNode?.(item, emptyFn);
  } else {
    onParentNode?.(item, next, getNodeChildren(item)!);
    onNode?.(item, next);
  }
}

export function treeTraverse<DataType, KeyType = any>(
  treeParams: TreeOptions<DataType, KeyType>,
  traverseOptions: TreeTraverseOptions<DataType>,
  data: DataType[],
) {
  for (let i = 0, len = data.length; i < len; i++) {
    traverseTreeNode(treeParams, traverseOptions, [], data[i]);
  }
}
