import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';
import * as React from 'react';

export type Person = {
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
    age: 8,
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
    team: 'frontend',
  },
  {
    id: 3,
    name: 'bob',
    country: 'UK',
    department: 'it',
    age: 102,
    salary: 45000,
    team: 'infrastructure',
  },
  {
    id: 4,
    name: 'marrie',
    country: 'France',
    department: 'it',
    age: 102,
    salary: 60000,
    team: 'components',
  },
  {
    id: 5,
    name: 'espania',
    country: 'Italy',
    department: 'devops',
    age: 102,
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
    team: 'backend',
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
    age: 102,
    salary: 60000,
    team: 'infrastructure',
  },
  {
    id: 14,
    name: 'Marino',
    country: 'Italy',
    department: 'devops',
    age: 102,
    salary: 60000,
    team: 'infrastructure',
  },
];

const columns: Record<string, InfiniteTableColumn<Person>> = {
  name: {
    field: 'name',
  },
  department: {
    field: 'department',
    style: {
      color: 'red',
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },
  team: {
    field: 'team',
  },
};
export default function App() {
  const groupBy: DataSourceGroupBy<Person>[] = [
    {
      field: 'age',
    },
    { field: 'team', column: { field: 'team' } },
  ];

  return (
    <React.StrictMode>
      <DataSource<Person>
        data={data.slice(0, 7)}
        defaultSortInfo={{
          id: 'test',
          field: ['age', 'team'],
          type: ['number', 'string'],
          dir: 1,
        }}
        primaryKey="id"
        groupBy={groupBy}
      >
        <InfiniteTable<Person>
          groupColumn={{
            id: 'test',
          }}
          domProps={{
            style: {
              margin: '5px',
              height: '1000px',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          groupRenderStrategy="single-column"
          columnDefaultWidth={250}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}
