import * as React from 'react';
import fetch from 'isomorphic-fetch';

import {
  InfiniteTable,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

export const columns = new Map<string, InfiniteTableColumn<Employee>>([
  ['id', { field: 'id' }],
  [
    'country',
    {
      field: 'country',
    },
  ],
  ['city', { field: 'city' }],
  ['team', { field: 'team' }],
  ['department', { field: 'department' }],
  ['firstName', { field: 'firstName' }],
  ['lastName', { field: 'lastName' }],
  ['salary', { field: 'salary' }],
  ['age', { field: 'age' }],
]);

type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  streetName: string;
  streetNo: number;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const dataSource = () => {
  return fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/employees1k?_limit=100`)
    .then(async (r) => {
      const data = await r.json();

      const total = Number(r.headers.get('X-Total-Count')!);
      return { data, total };
    })
    .then(({ data, total }: { data: Employee[]; total: number }) => {
      console.log({ data, total });
      return { data, total };
    });
};

const domProps = {
  style: {
    margin: '5px',
    height: '60vh',
    width: '95vw',
    border: '1px solid gray',
    position: 'relative',
  } as React.CSSProperties,
};

const App = () => {
  return (
    <React.StrictMode>
      <DataSource<Employee> primaryKey="id" data={dataSource}>
        <InfiniteTable<Employee>
          domProps={domProps}
          columnDefaultWidth={440}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
