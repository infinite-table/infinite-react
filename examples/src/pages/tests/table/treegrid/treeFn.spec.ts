import { test, expect } from '@testing';

import { tree as treeFn } from '@src/utils/groupAndPivot';
type FileSystemNode = {
  name: string;
  sizeKB?: number;
  children?: FileSystemNode[];
};
const treeParams = {
  toKey: (item: FileSystemNode) => item.name,
  isLeafNode: (item: FileSystemNode) => !item.children,
  getNodeChildren: (item: FileSystemNode) => item.children ?? null,
};

export default test.describe('Tree reducers', () => {
  test('should be correctly in the most basic case', () => {
    const nodes: FileSystemNode[] = [
      { name: 'node11', sizeKB: 50 },
      { name: 'node12', sizeKB: 20 },
    ];

    const result = treeFn(
      {
        ...treeParams,
        reducers: {
          sum: {
            field: 'sizeKB',
            initialValue: 0,
            reducer: (acc, value) => acc + value,
          },
        },
      },
      nodes,
    );

    expect(result.reducerResults!.sum).toBe(70);
  });

  test('should be correctly computed', () => {
    const nodes: FileSystemNode[] = [
      {
        name: 'node1',
        children: [
          { name: 'node11', sizeKB: 50 },
          { name: 'node12', sizeKB: 20 },
        ],
      },
      {
        name: 'node2',

        children: [
          { name: 'node21', sizeKB: 100 },
          {
            name: 'node22',
            children: [{ name: 'node221', sizeKB: 10 }],
          },
        ],
      },
    ];

    const result = treeFn(
      {
        ...treeParams,
        reducers: {
          sum: {
            field: 'sizeKB',
            initialValue: 0,
            reducer: (acc, value) => acc + value,
          },
        },
      },
      nodes,
    );

    expect(result.reducerResults!.sum).toBe(180);
    expect(result.deepMap.get(['node1'])!.reducerResults.sum).toBe(70);
    expect(result.deepMap.get(['node2'])!.reducerResults.sum).toBe(110);
  });
});
