import {
  buildColumnAndGroupTree,
  ColGroupTreeGroupItem,
} from '@src/components/InfiniteTable/components/InfiniteTableHeader/buildColumnAndGroupTree';
import {
  InfiniteTableComputedColumn,
  InfiniteTableColumnGroup,
} from '@src/components/InfiniteTable/types';
import { computeColumnGroupsDepths } from '@src/components/InfiniteTable/state/computeColumnGroupsDepths';

function getComputedColumn<T>(config: {
  field: keyof T;
  computedWidth?: number;
  columnGroup?: string;
}): InfiniteTableComputedColumn<T> {
  return {
    computedAbsoluteOffset: 0,
    computedDraggable: true,
    computedFirst: false,
    computedFirstInCategory: false,
    computedLast: false,
    computedLastInCategory: false,
    computedOffset: 0,
    computedPinned: false,
    computedPinningOffset: 0,
    computedSortInfo: null,
    computedSortable: false,
    computedSorted: false,
    computedSortedAsc: false,
    computedSortedDesc: false,
    computedVisibleIndex: 0,
    computedWidth: 100,

    toggleSort: () => {},
    id: config.field as string,
    ...config,
  };
}

type Person = {
  firstName: string;
  country: string;
  region: string;
  city: string;
  streetName: string;
  streetNo: number;
  phone: string;
  email: string;
  id: number;
};

export default describe('buildColumnAndGroupTree', () => {
  it('should work correctly for groups that dont repeat twice', () => {
    const columnGroups: Map<string, InfiniteTableColumnGroup> = new Map([
      ['contact info', { header: 'Contact info' }],
      ['street', { header: 'street', columnGroup: 'address' }],
      ['address', { header: 'Address' }],
    ]);
    const columns: InfiniteTableComputedColumn<Person>[] = [
      getComputedColumn({
        field: 'id',
        computedWidth: 10,
      }),
      getComputedColumn({
        field: 'firstName',
        computedWidth: 20,
      }),
      getComputedColumn({
        field: 'streetName',
        columnGroup: 'street',
        computedWidth: 30,
      }),
      getComputedColumn({
        field: 'streetNo',
        columnGroup: 'street',
        computedWidth: 50,
      }),
      getComputedColumn({
        field: 'country',
        columnGroup: 'address',
        computedWidth: 70,
      }),
      getComputedColumn({
        field: 'city',
        columnGroup: 'address',
        computedWidth: 100,
      }),
      getComputedColumn({
        field: 'email',
        columnGroup: 'contact info',
        computedWidth: 200,
      }),
      getComputedColumn({
        field: 'phone',
        columnGroup: 'contact info',
        computedWidth: 500,
      }),
    ];
    const columnGroupsDepthsMap = computeColumnGroupsDepths(columnGroups);
    /****
     *
     *  ------------------------------------------------------------------------------
     *  |     |           |                 A D D R E S S         |   contact info  |
     *  |     |           |_______________________________________|_________________|
     *  .     |           |          street       |        |      |                 |
     *  .     |           |_______________________|        |      |                 |
     *  |  id | firstName | streetName | streetNo |country | city |  email  | phone |
     *
     * widths
     *    10       20         30           50        70      100      200      500
     *
     *
     *
     */

    const tree = buildColumnAndGroupTree<Person>(
      columns,
      columnGroups,
      columnGroupsDepthsMap,
    );

    expect(tree.length).toEqual(4);

    expect(tree[0]).toMatchObject({
      id: 'id',
      type: 'column',
      depth: 0,
      groupOffset: 0,
    });
    expect(tree[1]).toMatchObject({
      id: 'firstName',
      type: 'column',
      depth: 0,
      groupOffset: 10,
    });
    expect(tree[2]).toMatchObject({
      id: 'address',
      type: 'group',
      depth: 0,
      groupOffset: 30,
      computedWidth: 250,

      columnItems: [
        {
          id: 'streetName',
          type: 'column',
        },
        {
          id: 'streetNo',
          type: 'column',
        },
        {
          id: 'country',
          type: 'column',
        },
        {
          id: 'city',
          type: 'column',
        },
      ],
      children: [
        {
          id: 'street',
          depth: 1,
          type: 'group',
          groupOffset: 0,
          computedWidth: 80,
          columnItems: [
            {
              id: 'streetName',
              type: 'column',
            },
            {
              id: 'streetNo',
              type: 'column',
            },
          ],
          children: [
            {
              id: 'streetName',
              groupOffset: 0,
              depth: 2,
              type: 'column',
            },
            {
              id: 'streetNo',
              depth: 2,
              groupOffset: 30,
              type: 'column',
            },
          ],
        },
        {
          depth: 1,
          groupOffset: 80,
          id: 'country',
          type: 'column',
        },
        {
          groupOffset: 150,
          depth: 1,
          id: 'city',
          type: 'column',
        },
      ],
    });

    expect(tree[3]).toMatchObject({
      id: 'contact info',
      type: 'group',
      depth: 0,
      groupOffset: 280,
      computedWidth: 700,
      columnItems: [
        {
          id: 'email',
          type: 'column',
          groupOffset: 0,
        },
        {
          id: 'phone',
          type: 'column',
          groupOffset: 200,
        },
      ],
      children: [
        {
          id: 'email',
          depth: 1,
          type: 'column',
          groupOffset: 0,
        },
        {
          id: 'phone',
          depth: 1,
          type: 'column',
          groupOffset: 200,
        },
      ],
    });
  });

  it('should work correctly for groups that are repeated', () => {
    const columnGroups: Map<string, InfiniteTableColumnGroup> = new Map([
      ['contact info', { header: 'Contact info' }],
      ['street', { header: 'street', columnGroup: 'address' }],
      ['location', { header: 'location', columnGroup: 'address' }],
      ['address', { header: 'Address' }],
    ]);
    const columns: InfiniteTableComputedColumn<Person>[] = [
      getComputedColumn({
        field: 'streetNo',
        columnGroup: 'street',
        computedWidth: 50,
      }),
      getComputedColumn({
        field: 'city',
        columnGroup: 'location',
        computedWidth: 100,
      }),
      getComputedColumn({
        field: 'firstName',
        computedWidth: 20,
      }),
      getComputedColumn({
        field: 'streetName',
        columnGroup: 'street',
        computedWidth: 30,
      }),
      getComputedColumn({
        field: 'country',
        columnGroup: 'location',
        computedWidth: 100,
      }),
      getComputedColumn({
        field: 'region',
        columnGroup: 'location',
        computedWidth: 120,
      }),
      getComputedColumn({
        field: 'email',
        columnGroup: 'contact info',
        computedWidth: 200,
      }),
      getComputedColumn({
        field: 'phone',
        columnGroup: 'contact info',
        computedWidth: 500,
      }),
    ];
    const columnGroupsDepthsMap = computeColumnGroupsDepths(columnGroups);
    /****
     *
     *
     *  -----------------------------------------------------------------------------------------------
     *  |         ADDRESS       |           |                 A D D R E S S         |   contact info  |
     *  |_______________________|           |_______________________________________|_________________|
     *  |    street   | LOCATION|           |          street       |   LOCATION    |                 |
     *  |_____________|_________|___________|_______________________|_______________|                 |
     *  |   streetNo  | city    | firstName | streetName            |country|region |  email  | phone |
     *
     * widths
     *       50           100       20         30                     100      120      200      500
     */

    const tree = buildColumnAndGroupTree<Person>(
      columns,
      columnGroups,
      columnGroupsDepthsMap,
    );

    expect(tree.length).toEqual(4);

    expect(tree[0]).toMatchObject({
      type: 'group',
      id: 'address',
      depth: 0,
      groupOffset: 0,
      computedWidth: 150,
      children: [
        {
          type: 'group',
          id: 'street',
          depth: 1,
          groupOffset: 0,
          computedWidth: 50,
          children: [
            {
              type: 'column',
              id: 'streetNo',
              depth: 2,
              groupOffset: 0,
            },
          ],
        },
        {
          type: 'group',
          id: 'location',
          depth: 1,
          groupOffset: 50,
          children: [
            {
              type: 'column',
              id: 'city',
              depth: 2,
              groupOffset: 0,
            },
          ],
        },
      ],
      columnItems: [
        {
          type: 'column',
          id: 'streetNo',
          depth: 2,
          groupOffset: 0,
        },
        {
          type: 'column',
          id: 'city',
          depth: 2,
          groupOffset: 0,
        },
      ],
    });

    expect(tree[1]).toMatchObject({
      type: 'column',
      id: 'firstName',
      depth: 0,
      groupOffset: 150,
    });

    expect(tree[2]).toMatchObject({
      type: 'group',
      id: 'address',
      depth: 0,
      groupOffset: 170,
      computedWidth: 250,
      columnItems: [
        {
          type: 'column',
          id: 'streetName',
          depth: 2,
        },
        {
          type: 'column',
          id: 'country',
          depth: 2,
        },
        {
          type: 'column',
          id: 'region',
          depth: 2,
          groupOffset: 100,
        },
      ],
      children: [
        {
          type: 'group',
          id: 'street',
          depth: 1,
          groupOffset: 0,
          computedWidth: 30,
          children: [
            {
              type: 'column',
              id: 'streetName',
              depth: 2,
            },
          ],
        },
        {
          type: 'group',
          id: 'location',
          depth: 1,
          groupOffset: 30,
          children: [
            {
              type: 'column',
              id: 'country',
              depth: 2,
            },
            {
              type: 'column',
              id: 'region',
              depth: 2,
              groupOffset: 100,
            },
          ],
        },
      ],
    });

    expect(tree[3]).toMatchObject({
      type: 'group',
      id: 'contact info',
      groupOffset: 420,
      computedWidth: 700,
      depth: 0,
      children: [
        {
          type: 'column',
          id: 'email',
          depth: 1,
        },
        {
          type: 'column',
          id: 'phone',
          depth: 1,
          groupOffset: 200,
        },
      ],
    });
  });

  it('should work correctly for groups that are repeated - case 2', () => {
    const columnGroups: Map<string, InfiniteTableColumnGroup> = new Map([
      ['contact info', { header: 'Contact info' }],
      ['street', { header: 'street', columnGroup: 'address' }],
      ['location', { header: 'location', columnGroup: 'address' }],
      ['address', { header: 'Address' }],
    ]);
    const columns: InfiniteTableComputedColumn<Person>[] = [
      getComputedColumn({
        field: 'streetNo',
        columnGroup: 'street',
        computedWidth: 50,
      }),
      getComputedColumn({
        field: 'city',
        columnGroup: 'location',
        computedWidth: 100,
      }),

      getComputedColumn({
        field: 'streetName',
        columnGroup: 'street',
        computedWidth: 30,
      }),
      getComputedColumn({
        field: 'firstName',
        computedWidth: 20,
      }),
      getComputedColumn({
        field: 'country',
        columnGroup: 'location',
        computedWidth: 100,
      }),
      getComputedColumn({
        field: 'region',
        columnGroup: 'location',
        computedWidth: 120,
      }),
      getComputedColumn({
        field: 'email',
        columnGroup: 'contact info',
        computedWidth: 200,
      }),
      getComputedColumn({
        field: 'phone',
        columnGroup: 'contact info',
        computedWidth: 500,
      }),
    ];
    const columnGroupsDepthsMap = computeColumnGroupsDepths(columnGroups);
    /****
     *
     *
     *  -----------------------------------------------------------------------------------------------
     *  |         ADDRESS                   |                       | A D D R E S S |   contact info  |
     *  |___________________________________|                       |_______________|_________________|
     *  |    street   | LOCATION|  street   |                       |   LOCATION    |                 |
     *  |_____________|_________|___________|                       |_______________|                 |
     *  |   streetNo  | city    | streetName|  firstName            |country|region |  email  | phone |
     *
     * widths
     *       50           100       30         20                     100      120      200      500
     */
    const tree = buildColumnAndGroupTree<Person>(
      columns,
      columnGroups,
      columnGroupsDepthsMap,
    );

    expect(tree.length).toEqual(4);

    expect(tree[0]).toMatchObject({
      type: 'group',
      id: 'address',
      depth: 0,
      groupOffset: 0,
      computedWidth: 180,
      children: [
        {
          type: 'group',
          id: 'street',
          depth: 1,
          groupOffset: 0,
          computedWidth: 50,
          children: [
            {
              type: 'column',
              id: 'streetNo',
              depth: 2,
              groupOffset: 0,
            },
          ],
        },
        {
          type: 'group',
          id: 'location',
          depth: 1,
          groupOffset: 50,
          children: [
            {
              type: 'column',
              id: 'city',
              depth: 2,
              groupOffset: 0,
            },
          ],
        },
        {
          type: 'group',
          id: 'street',
          depth: 1,
          groupOffset: 150,
          children: [
            {
              type: 'column',
              id: 'streetName',
              depth: 2,
              groupOffset: 0,
            },
          ],
        },
      ],
    });
  });

  it('should work for very complicated scenario', () => {
    type Alphabet = {
      d: string;
      e: string;
      f: string;
      l: string;
      k: string;
    };
    const columnGroups: Map<string, InfiniteTableColumnGroup> = new Map([
      ['c', { header: 'c', columnGroup: 'b' }],
      ['b', { header: 'b', columnGroup: 'a' }],
      ['a', { header: 'a', columnGroup: 'x' }],
      ['x', { header: 'x' }],
      ['h', { header: 'h', columnGroup: 'g' }],
      ['g', { header: 'g', columnGroup: 'x' }],
    ]);
    const columns: InfiniteTableComputedColumn<Alphabet>[] = [
      getComputedColumn({
        field: 'd',
        columnGroup: 'c',
        computedWidth: 10,
      }),
      getComputedColumn({
        field: 'e',
        columnGroup: 'b',
        computedWidth: 20,
      }),
      getComputedColumn({
        field: 'f',
        columnGroup: 'a',
        computedWidth: 30,
      }),
      getComputedColumn({
        field: 'l',
        columnGroup: 'h',
        computedWidth: 40,
      }),
      getComputedColumn({
        field: 'k',
        columnGroup: 'a',
        computedWidth: 50,
      }),
    ];
    const columnGroupsDepthsMap = computeColumnGroupsDepths(columnGroups);

    /****
     *
     *
     *
     * _________________________________
     * |              x                 |
     * ---------------------------------|
     * |   A              |   G   |  A  |
     * -------------------|-------------|
     * |  B          |    |   H   |     |
     * --------------|    |_______|     |
     * |  C    |     |    |       |     |
     * --------|     |    |       |     |
     * |       |     |    |       |     |
     * |  D    |   E |  F |    L  |   K |
     *
     */

    const tree = buildColumnAndGroupTree<Alphabet>(
      columns,
      columnGroups,
      columnGroupsDepthsMap,
    );

    expect(tree.length).toEqual(1);
    expect(
      (tree[0] as ColGroupTreeGroupItem<Alphabet>).children.length,
    ).toEqual(3);

    expect(
      (tree[0] as ColGroupTreeGroupItem<Alphabet>).children[0],
    ).toMatchObject({
      type: 'group',
      id: 'a',
      depth: 1,
      computedWidth: 60,
      children: [
        {
          type: 'group',
          id: 'b',
          depth: 2,
          computedWidth: 30,
          children: [
            {
              type: 'group',
              id: 'c',
              depth: 3,
              children: [
                {
                  type: 'column',
                  id: 'd',
                  depth: 4,
                },
              ],
            },
            {
              type: 'column',
              id: 'e',
              depth: 3,
            },
          ],
        },
        {
          type: 'column',
          id: 'f',
          depth: 2,
        },
      ],
    });

    expect(
      (tree[0] as ColGroupTreeGroupItem<Alphabet>).children[1],
    ).toMatchObject({
      type: 'group',
      id: 'g',
      depth: 1,
      children: [
        {
          type: 'group',
          id: 'h',
          depth: 2,
          children: [
            {
              type: 'column',
              id: 'l',
              depth: 3,
            },
          ],
        },
      ],
    });

    expect(
      (tree[0] as ColGroupTreeGroupItem<Alphabet>).children[2],
    ).toMatchObject({
      type: 'group',
      id: 'a',
      depth: 1,
      children: [
        {
          type: 'column',
          id: 'k',
          depth: 2,
        },
      ],
    });
  });
});
