import * as React from 'react';
import fetch from 'isomorphic-fetch';

import {
  InfiniteTable,
  InfiniteTableColumn,
  InfiniteTableImperativeApi,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropColumnSizing,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import { useState } from 'react';

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

// const columnSizing = new Map<string, any>([['id', {  }]]);

// const onColumnSizingChange = ({columnSizing, updated}) => {

// }

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

const defaultColumnSizing: InfiniteTablePropColumnSizing = new Map([
  ['id', { width: 50 }],
  ['country', { flex: 1 }],
  ['city', { flex: 1 }],
  ['team', { flex: 1 }],
  ['department', { flex: 1 }],
  ['firstName', { flex: 1 }],
  ['lastName', { flex: 1 }],
  ['salary', { flex: 1 }],
  ['age', { flex: 1 }],
  ['age', { flex: 1 }],
]);

const defaultColumnPinning: InfiniteTablePropColumnPinning = new Map([
  ['country', 'start'],
  ['city', 'start'],
  ['team', 'end'],
  ['salary', 'end'],
]);

(globalThis as any).calls = [];

const App = () => {
  const [columnPinning, _setColumnPinning] =
    useState<InfiniteTablePropColumnPinning>(defaultColumnPinning);
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
          defaultColumnSizing={defaultColumnSizing}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
