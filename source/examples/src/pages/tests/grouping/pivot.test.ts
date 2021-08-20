import { group, DataGroupResult } from '@src/utils/groupAndPivot';

type Person = {
  id: number;
  country: string;
  name: string;
  age: number;
  salary: number;
  team: string;
  department: string;
};

export const data: Person[] = [
  {
    id: 1,
    name: 'john',
    country: 'UK',
    department: 'it',
    age: 20,
    salary: 50000,
    team: 'backend',
  },
  {
    id: 2,
    name: 'bill',
    country: 'UK',
    department: 'it',
    age: 20,
    salary: 55000,
    team: 'backend',
  },
  {
    id: 3,
    name: 'bob',
    country: 'UK',
    department: 'it',
    age: 25,
    salary: 45000,
    team: 'components',
  },
  {
    id: 4,
    name: 'marrie',
    country: 'France',
    department: 'it',
    age: 20,
    salary: 60000,
    team: 'components',
  },
  {
    id: 5,
    name: 'espania',
    country: 'Italy',
    department: 'devops',
    age: 20,
    salary: 70000,
    team: 'infrastructure',
  },
  {
    id: 6,
    name: 'roberta',
    country: 'Spain',
    department: 'it',
    age: 20,
    salary: 30000,
    team: 'frontend',
  },
  {
    id: 7,
    name: 'marrio',
    country: 'Italy',
    department: 'devops',
    age: 25,
    salary: 40000,
    team: 'deployments',
  },
  {
    id: 8,
    name: 'juliano',
    country: 'Italy',
    department: 'devops',
    age: 20,
    salary: 39000,
    team: 'deployments',
  },
  {
    id: 9,
    name: 'fabricio',
    country: 'Italy',
    department: 'it',
    age: 25,
    salary: 100000,
    team: 'frontend',
  },
  {
    id: 10,
    name: 'matthew',
    country: 'USA',
    department: 'marketing',
    age: 44,
    salary: 80000,
    team: 'customer-satisfaction',
  },
  {
    id: 11,
    name: 'briana',
    country: 'USA',
    department: 'marketing',
    age: 50,
    salary: 90000,
    team: 'customer-satisfaction',
  },
  {
    id: 12,
    name: 'maya',
    country: 'Spain',
    department: 'devops',
    age: 44,
    salary: 85000,
    team: 'infrastructure',
  },
  {
    id: 13,
    name: 'jonathan',
    country: 'UK',
    department: 'it',
    age: 20,
    salary: 60000,
    team: 'backend',
  },
  {
    id: 14,
    name: 'Marino',
    country: 'Italy',
    department: 'devops',
    age: 21,
    salary: 60000,
    team: 'infrastructure',
  },
];

function groupToItems(result: DataGroupResult<Person, any>) {
  return Array.from(
    Array.from(result.deepMap.topDownEntries()).reduce((map, [keys, value]) => {
      map.set(keys, value.items);
      return map;
    }, new Map<string[], Person[]>()),
  );
}

export default describe('Pivot', () => {
  it('should group on single field', async () => {
    const result = group(
      {
        groupBy: [{ field: 'country' }],
      },
      data,
    );

    const res = groupToItems(result);
    expect(res).toEqual([
      [['UK'], data.filter((p) => p.country === 'UK')],
      [['France'], data.filter((p) => p.country === 'France')],
      [['Italy'], data.filter((p) => p.country === 'Italy')],
      [['Spain'], data.filter((p) => p.country === 'Spain')],
      [['USA'], data.filter((p) => p.country === 'USA')],
    ]);
  });
  it('should group on two fields', async () => {
    const result = group(
      {
        groupBy: [{ field: 'country' }, { field: 'age' }],
      },
      data,
    );
    const res = groupToItems(result);

    expect(res).toEqual([
      [['UK'], data.filter((p) => p.country === 'UK')],
      [['UK', 20], data.filter((p) => p.country === 'UK' && p.age === 20)],
      [['UK', 25], data.filter((p) => p.country === 'UK' && p.age === 25)],
      [['France'], data.filter((p) => p.country === 'France')],
      [
        ['France', 20],
        data.filter((p) => p.country === 'France' && p.age === 20),
      ],
      [['Italy'], data.filter((p) => p.country === 'Italy')],
      [
        ['Italy', 20],
        data.filter((p) => p.country === 'Italy' && p.age === 20),
      ],
      [
        ['Italy', 25],
        data.filter((p) => p.country === 'Italy' && p.age === 25),
      ],
      [
        ['Italy', 21],
        data.filter((p) => p.country === 'Italy' && p.age === 21),
      ],
      [['Spain'], data.filter((p) => p.country === 'Spain')],
      [
        ['Spain', 20],
        data.filter((p) => p.country === 'Spain' && p.age === 20),
      ],
      [
        ['Spain', 44],
        data.filter((p) => p.country === 'Spain' && p.age === 44),
      ],
      [['USA'], data.filter((p) => p.country === 'USA')],
      [['USA', 44], data.filter((p) => p.country === 'USA' && p.age === 44)],
      [['USA', 50], data.filter((p) => p.country === 'USA' && p.age === 50)],
    ]);
  });

  it('should have pivot info', () => {
    const result = group(
      {
        groupBy: [{ field: 'department' }, { field: 'team' }],
        pivot: [{ field: 'country' }, { field: 'age' }],
        reducers: [
          {
            initialValue: 0,
            getter: (data) => data.salary,
            reducer: (acc, sum) => acc + sum,
            done: (sum, arr) => (arr.length ? sum / arr.length : 0),
          },
        ],
      },
      data,
    );

    const itbackend = result.deepMap.get(['devops', 'infrastructure']);

    const res = itbackend?.pivotDeepMap?.get(['Italy', 20]);
    expect(res?.items).toEqual(
      data.filter((p) => {
        return (
          p.department === 'devops' &&
          p.team === 'infrastructure' &&
          p.country === 'Italy' &&
          p.age === 20
        );
      }),
    );

    expect(res?.reducerResults).toEqual([70000]); //todo make this dynamic

    const resItaly = itbackend?.pivotDeepMap?.get(['Italy']);

    expect(resItaly?.items).toEqual(
      data.filter((p) => {
        return (
          p.department === 'devops' &&
          p.team === 'infrastructure' &&
          p.country === 'Italy'
        );
      }),
    );

    expect(resItaly?.reducerResults).toEqual([65000]); //todo make this dynamic
  });
});
