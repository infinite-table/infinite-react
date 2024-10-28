import { toTreeDataArray } from '@src/utils/groupAndPivot/treeUtils';
import { test, expect } from '@testing';

export default test.describe('toTreeDataArray', () => {
  test('works as expected', async ({}) => {
    const data = toTreeDataArray(
      [
        {
          id: '1',
          path: ['1'],
        },
        {
          id: '3',
          path: ['1', '2', '3'],
        },
      ],
      {
        nodesKey: 'children',
        pathKey: 'path',
        emptyGroup: (path, children) => ({
          id: path.join(','),
          children,
        }),
      },
    );

    expect(data).toEqual([
      {
        id: '1',
        children: [
          {
            id: '1,2',
            children: [
              {
                id: '3',
                path: ['1', '2', '3'],
              },
            ],
          },
        ],
        path: ['1'],
      },
    ]);
  });
});
