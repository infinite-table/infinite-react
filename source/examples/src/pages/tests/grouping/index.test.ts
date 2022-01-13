import { GroupRowsState } from '@src/components/DataSource/GroupRowsState';
import { group, flatten, enhancedFlatten } from '@src/utils/groupAndPivot';
import { groupToItems } from './helpers';

type Person = {
  id: number;
  country: string;
  name: string;
  age: number;
};
const john = {
  id: 1,
  country: 'uk',
  age: 20,
  department: 'it',
  name: 'john',
};
const bill = {
  id: 2,
  country: 'uk',
  age: 20,
  department: 'it',
  name: 'bill',
};
const bob = {
  id: 3,
  country: 'uk',
  age: 25,
  department: 'it',
  name: 'bob',
};
const marrie = {
  id: 4,
  age: 20,
  country: 'fr',
  department: 'it',
  name: 'marrie',
};
const espania = {
  department: 'devops',
  id: 5,
  country: 'es',
  age: 50,
  name: 'espania',
};

export default xdescribe('Grouping', () => {
  it('should group on single field', async () => {
    const arr: Person[] = [john, bill, bob, marrie, espania];

    const result = group(
      {
        groupBy: [{ field: 'country' }],
      },
      arr,
    );

    expect(groupToItems(result)).toEqual([
      [['uk'], [john, bill, bob]],
      [['fr'], [marrie]],
      [['es'], [espania]],
    ]);
  });
  it('should group on two fields', async () => {
    const arr: Person[] = [john, bill, bob, marrie, espania];

    const result = groupToItems(
      group(
        {
          groupBy: [{ field: 'country' }, { field: 'age' }],
        },
        arr,
      ),
    );

    expect(result).toEqual([
      [['uk'], [john, bill, bob]],
      [
        ['uk', 20],
        [john, bill],
      ],
      [['uk', 25], [bob]],
      [['fr'], [marrie]],
      [['fr', 20], [marrie]],
      [['es'], [espania]],
      [['es', 50], [espania]],
    ]);
  });
  it('should group and flatten correctly', () => {
    const arr = [john, marrie, bob, espania, bill];
    const result = flatten(
      group(
        {
          groupBy: [{ field: 'country' }, { field: 'age' }],
        },
        arr,
      ),
    );

    expect(result).toEqual([
      john,
      bill, //uk, 20
      //----
      bob, //uk, 25
      //----
      marrie, // fr 20

      //---
      espania, // es, 50
    ]);
  });

  it('should group and flatten in correct order', () => {
    const arr = [john, marrie, espania, bob, bill];
    const result = flatten(
      group(
        {
          groupBy: [
            { field: 'department' },
            { field: 'country' },
            { field: 'age' },
          ],
        },
        arr,
      ),
    );

    expect(result).toEqual([
      // department: it

      john,
      bill, //uk, 20
      //----
      bob, //uk, 25
      //----

      marrie, // fr 20
      // department: devops
      //---
      espania, // es, 50
    ]);
  });

  it('should group and flatten in correct order - 2', () => {
    const arr = [bob, john, marrie, espania, bill];
    const result = flatten(
      group(
        {
          groupBy: [
            { field: 'department' },
            { field: 'age' },
            { field: 'country' },
          ],
        },
        arr,
      ),
    );

    expect(result).toEqual([
      // department: it

      bob, //25 uk

      john, // 20 uk
      bill, //20 uk
      marrie, // 20 fr

      // department: devops
      //---
      espania, //  50, es
    ]);
  });

  it('should enhancedFlatten with collapsed rows', () => {
    const arr = [
      john /*uk*/,
      marrie /*fr */,
      bob /*uk*/,
      espania /*es*/,
      bill /*uk*/,
    ];
    const groupResult = group(
      {
        groupBy: [{ field: 'country' }],
      },
      arr,
    );

    const result = enhancedFlatten({
      groupResult,
      toPrimaryKey: (data) => data.id,
      groupRowsState: new GroupRowsState({
        expandedRows: true,
        collapsedRows: [['uk']],
      }),
      generateGroupRows: true,
    });

    expect(result.data[0]).toMatchObject({
      data: null,
      groupCount: 3,
      collapsed: true,
      groupData: [john, bob, bill],
      groupKeys: ['uk'],
      groupBy: ['country'],
      groupNesting: 1,
      isGroupRow: true,
      value: 'uk',
      reducerResults: [],
      pivotValuesMap: undefined,
    });
    expect(result.data[1]).toMatchObject({
      data: null,
      groupCount: 1,
      collapsed: false,
      groupData: [marrie],
      groupKeys: ['fr'],
      groupBy: ['country'],
      groupNesting: 1,
      isGroupRow: true,
      value: 'fr',
      reducerResults: [],
      pivotValuesMap: undefined,
    });
    expect(result.data[2]).toMatchObject({
      data: marrie,
    });
  });

  it('should enhancedFlatten correctly', () => {
    const arr = [john, marrie, bob, espania, bill];
    const groupResult = group(
      {
        groupBy: [{ field: 'country' }, { field: 'age' }],
        reducers: {
          agg: {
            initialValue: 0,
            getter: (person: Person) => person.age,
            reducer: (a, b) => {
              return a + b;
            },
            done: (value: number) => {
              return value * 100;
            },
          },
        },
      },
      arr,
    );

    // john,
    // bill, //uk, 20
    // //----
    // bob, //uk, 25
    // //----
    // marrie, // fr 20

    // //---
    // espania, // es, 50

    expect(groupResult.reducerResults).toEqual([
      arr.reduce((acc, p) => acc + p.age, 0) * 100,
    ]);
    const result = enhancedFlatten({
      groupResult,
      toPrimaryKey: (data) => data.id,
      generateGroupRows: true,
    });

    expect(result.data).toEqual([
      {
        data: null,
        groupCount: 3,
        // 20, 25, 20
        groupData: [john, bob, bill],
        groupKeys: ['uk'],
        groupBy: ['country'],
        id: ['uk'],
        pivotValuesMap: undefined,
        indexInGroup: 0,
        indexInAll: 0,
        collapsed: false,
        groupNesting: 1,
        isGroupRow: true,
        value: 'uk',
        reducerResults: [(20 + 25 + 20) * 100],
      },

      {
        data: null,
        groupCount: 2,
        groupData: [john, bill],
        groupBy: ['country', 'age'],
        indexInGroup: 0,
        indexInAll: 1,
        groupKeys: ['uk', 20],
        id: ['uk', 20],
        groupNesting: 2,
        collapsed: false,
        isGroupRow: true,
        value: 20,
        reducerResults: [(20 + 20) * 100],
      },

      {
        data: john,
        isGroupRow: false,
        groupNesting: 2,
        indexInGroup: 0,

        id: john.id,
        indexInAll: 2,
        collapsed: false,
        groupBy: ['country', 'age'],
        parentGroupKeys: ['uk', 20],
      },

      {
        data: bill,
        isGroupRow: false,
        groupNesting: 2,
        indexInGroup: 1,
        id: bill.id,
        collapsed: false,
        pivotValuesMap: undefined,
        indexInAll: 3,
        groupBy: ['country', 'age'],
        parentGroupKeys: ['uk', 20],
      },

      {
        data: null,
        groupCount: 1,
        groupData: [bob],
        groupKeys: ['uk', 25],
        groupBy: ['country', 'age'],
        id: ['uk', 25],
        groupNesting: 2,
        indexInGroup: 1,
        indexInAll: 4,
        pivotValuesMap: undefined,
        collapsed: false,
        isGroupRow: true,
        reducerResults: [25 * 100],
        value: 25,
      },

      {
        data: bob,
        isGroupRow: false,
        groupBy: ['country', 'age'],
        id: bob.id,
        indexInGroup: 0,
        indexInAll: 5,
        collapsed: false,
        groupNesting: 2,
        parentGroupKeys: ['uk', 25],
      },
      {
        data: null,
        groupCount: 1,
        groupData: [marrie],
        groupKeys: ['fr'],
        id: ['fr'],
        groupBy: ['country'],
        groupNesting: 1,
        collapsed: false,
        isGroupRow: true,
        indexInGroup: 1,
        indexInAll: 6,
        pivotValuesMap: undefined,
        value: 'fr',
        reducerResults: [20 * 100],
      },

      {
        data: null,
        groupCount: 1,
        groupData: [marrie],
        collapsed: false,
        groupBy: ['country', 'age'],
        groupKeys: ['fr', 20],
        id: ['fr', 20],
        pivotValuesMap: undefined,
        groupNesting: 2,
        indexInGroup: 0,
        indexInAll: 7,
        reducerResults: [20 * 100],
        isGroupRow: true,
        value: 20,
      },

      {
        data: marrie,
        isGroupRow: false,
        indexInGroup: 0,
        collapsed: false,
        groupNesting: 2,
        id: marrie.id,
        indexInAll: 8,
        groupBy: ['country', 'age'],
        parentGroupKeys: ['fr', 20],
      },

      {
        data: null,
        groupCount: 1,
        groupData: [espania],
        groupKeys: ['es'],
        id: ['es'],
        pivotValuesMap: undefined,
        groupBy: ['country'],
        collapsed: false,
        groupNesting: 1,
        isGroupRow: true,
        indexInGroup: 2,
        indexInAll: 9,
        reducerResults: [50 * 100],
        value: 'es',
      },
      {
        data: null,
        groupCount: 1,
        groupData: [espania],
        groupKeys: ['es', 50],
        id: ['es', 50],
        groupBy: ['country', 'age'],
        groupNesting: 2,
        collapsed: false,
        isGroupRow: true,
        indexInGroup: 0,
        indexInAll: 10,
        pivotValuesMap: undefined,
        reducerResults: [50 * 100],
        value: 50,
      },
      {
        data: espania,
        id: espania.id,
        isGroupRow: false,
        indexInGroup: 0,
        indexInAll: 11,
        groupNesting: 2,
        collapsed: false,
        groupBy: ['country', 'age'],
        parentGroupKeys: ['es', 50],
      },
    ]);
  });
});
