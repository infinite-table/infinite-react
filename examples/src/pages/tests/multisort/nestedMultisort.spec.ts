import { test, expect } from '@playwright/test';
import { multisortNested } from '@src/utils/multisort';

const options = {
  nodesKey: 'children',
  isLeafNode: (item: any) => !item.children,
  getNodeChildren: (item: any) => item.children,
  toKey: (item: any) => item.id,
};
export default test.describe.parallel('Nested multisort', () => {
  test('should sort empty array', () => {
    expect(multisortNested([], [], options)).toEqual([]);
  });

  test('should not sort when no sort info provided', () => {
    expect(multisortNested([], [3, 1, 2], options)).toEqual([3, 1, 2]);
  });

  test('should sort well', () => {
    const data = [
      {
        id: 1,
        size: 130,
        name: 'Documents',
        children: [
          {
            id: 2,
            size: 110,
            name: 'Work',
          },
          {
            id: 3,
            size: 20,
            name: 'Vacation',
          },
        ],
      },
      {
        id: 4,
        size: 100,
        name: 'Downloads',
      },
    ];

    expect(
      multisortNested(
        [
          {
            dir: 1,
            type: 'number',
            field: 'size',
          },
        ],
        data,
        options,
      ),
    ).toEqual([
      {
        id: 4,
        size: 100,
        name: 'Downloads',
      },
      {
        id: 1,
        size: 130,
        name: 'Documents',
        children: [
          {
            id: 3,
            size: 20,
            name: 'Vacation',
          },
          {
            id: 2,
            size: 110,
            name: 'Work',
          },
        ],
      },
    ]);
  });
});
