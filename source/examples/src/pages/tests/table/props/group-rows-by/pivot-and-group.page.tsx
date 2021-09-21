import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceGroupRowsBy,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  InfiniteTablePropColumnAggregations,
  DataSourcePropPivotBy,
} from '@infinite-table/infinite-react';

const domProps = {
  style: { height: '80vh' },
};

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

const groupRowsBy: DataSourceGroupRowsBy<Person>[] = [
  {
    field: 'department',
  },
  { field: 'team' },
];

const sumReducer: InfiniteTableColumnAggregator<Person, any> = {
  initialValue: 0,
  getter: (data) => data.salary,
  reducer: (acc, sum) => acc + sum,
  // done: (sum, arr) => (arr.length ? sum / arr.length : 0),
};

const columnAggregations: InfiniteTablePropColumnAggregations<Person> = new Map(
  [['salary', sumReducer]],
);

const columns: InfiniteTablePropColumns<Person> = new Map([
  ['id', { field: 'id' }],
  ['name', { field: 'name' }],
  ['country', { field: 'country' }],
  ['department', { field: 'department' }],
  ['team', { field: 'team' }],
]);

const pivotBy: DataSourcePropPivotBy<Person> = [
  { field: 'country' },
  { field: 'age' },
  // { field: 'name' },
];

const groupColumn = {
  width: 300,
};
export default function GroupByExample() {
  return (
    <>
      <DataSource<Person>
        primaryKey="id"
        data={data}
        groupRowsBy={groupRowsBy}
        pivotBy={pivotBy}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Person>
              domProps={domProps}
              columns={columns}
              pivotTotalColumnPosition={'end'}
              pivotRowLabelsColumn={{
                renderValue: ({ value }) => {
                  return <b>{value}...</b>;
                },
              }}
              pivotColumn={{
                header: ({ column }) => {
                  if (!column.pivotTotalColumn && !column.pivotColumn) {
                    return 'Row labels';
                  }

                  return (
                    <>
                      {column.pivotGroupKeys?.map((key, index) => (
                        <React.Fragment key={key}>
                          <b style={{ marginLeft: 5 }}>
                            {column.pivotBy?.[index].field}
                          </b>{' '}
                          {key}
                        </React.Fragment>
                      ))}
                      {column.pivotTotalColumn ? (
                        <b style={{ marginLeft: 10 }}>{'totals'}</b>
                      ) : null}
                    </>
                  );
                },
                style: ({ value }) => (value! > 60_000 ? { color: 'red' } : {}),
              }}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              columnDefaultWidth={200}
              groupColumn={groupColumn}
              groupRenderStrategy={'single-column'}
              columnAggregations={columnAggregations}
            ></InfiniteTable>
          );
        }}
      </DataSource>
    </>
  );
}
