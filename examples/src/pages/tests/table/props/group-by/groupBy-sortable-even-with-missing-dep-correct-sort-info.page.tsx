import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  DataSourceSortInfo,
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
    team: 'frontend',
  },
  {
    id: 4,
    name: 'marrie',
    country: 'France',
    department: 'it',
    age: 102,
    salary: 60000,
    team: 'backend',
  },
  {
    id: 5,
    name: 'espania',
    country: 'Italy',
    department: 'devops',
    age: 102,
    salary: 70000,
    team: 'backend',
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
    age: 15,
    salary: 40000,
    team: 'frontend',
  },
];

const columns: Record<string, InfiniteTableColumn<Person>> = {
  department: {
    field: 'department',
    style: {
      color: 'red',
    },
  },
};

const sinon = require('sinon');

const onSortInfoChange = sinon.spy(
  (_sortInfo: DataSourceSortInfo<Person>) => {},
);
(globalThis as any).onSortInfoChange = onSortInfoChange;

export default function App() {
  const groupBy: DataSourceGroupBy<Person>[] = [
    { field: 'team' },
    {
      field: 'age',
    },
  ];

  return (
    <React.StrictMode>
      <DataSource<Person>
        data={data.slice(0, 7)}
        primaryKey="id"
        groupBy={groupBy}
        onSortInfoChange={onSortInfoChange}
      >
        <InfiniteTable<Person>
          groupColumn={{
            id: 'group-test',
            field: 'name',
            header: 'People',
            sortType: ['string', 'number'],
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
