import { group, flatten } from '@src/utils/groupAndPivot';
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

export default describe('List', () => {
  it('should group on single field', async () => {
    const arr: Person[] = [john, bill, bob, marrie, espania];

    const result = group(
      {
        groupBy: ['country'],
      },
      arr,
    );

    expect(Array.from(result.deepMap.entries())).toEqual([
      [['uk'], [john, bill, bob]],
      [['fr'], [marrie]],
      [['es'], [espania]],
    ]);
  });
  it('should group on two fields', async () => {
    const arr: Person[] = [john, bill, bob, marrie, espania];

    const result = Array.from(
      group(
        {
          groupBy: ['country', 'age'],
        },
        arr,
      ).deepMap.entries(),
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
          groupBy: ['country', 'age'],
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
          groupBy: ['department', 'country', 'age'],
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
          groupBy: ['department', 'age', 'country'],
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
});
