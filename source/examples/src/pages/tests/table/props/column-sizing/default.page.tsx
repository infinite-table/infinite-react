import * as React from 'react';
import fetch from 'isomorphic-fetch';

import {
  InfiniteTable,
  InfiniteTableColumn,
  InfiniteTableImperativeApi,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

export const columns: Record<string, InfiniteTableColumn<Employee>> = {
  id: { field: 'id', type: 'custom-number' },
  country: {
    field: 'country',
    type: 'date',
  },
  city: { field: 'city', type: 'default' },
  team: { field: 'team', type: 'default' },
  department: { field: 'department', type: 'default' },
  firstName: { field: 'firstName', type: 'default' },
  lastName: { field: 'lastName', type: 'default' },
  salary: { field: 'salary', type: 'custom-number' },
  age: { field: 'age', type: 'custom-number' },
};

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
  // return Promise.resolve(employees);
  return fetch(`${process.env.NEXT_PUBLIC_DATAURL!}/employees`)
    .then((r) => r.json())
    .then((data: Employee[]) => {
      return data;
    });
};

const defaultColumnSizing = {
  // id: { flex: 10 },
  // country: { flex: 1 },
  // city: { flex: 1 },
  // team: { flex: 1 },
  // department: { flex: 1 },
  // firstName: { flex: 1 },
  // lastName: { flex: 1 },
  // salary: { flex: 1 },
  // age: { flex: 1 },
};

const columnTypes = {
  'custom-number': {
    flex: 5,
    // width: 1500,
  },
  default: {
    width: 100,
    // width: 500,
  },
};

const App = () => {
  return (
    <React.StrictMode>
      <DataSource<Employee> primaryKey="id" data={dataSource}>
        <InfiniteTable<Employee>
          domProps={{
            style: {
              margin: '5px',
              height: '90vh',
              width: '95vw',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          onReady={(api: InfiniteTableImperativeApi<Employee>) => {
            (globalThis as any).api = api;
          }}
          columnTypes={columnTypes}
          defaultColumnSizing={defaultColumnSizing}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
