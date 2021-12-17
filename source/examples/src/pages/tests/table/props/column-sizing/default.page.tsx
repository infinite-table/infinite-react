import * as React from 'react';
import fetch from 'isomorphic-fetch';

import {
  InfiniteTable,
  InfiniteTableColumn,
  InfiniteTableImperativeApi,
  InfiniteTablePropColumnTypes,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

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
  return fetch(`${process.env.NEXT_PUBLIC_DATAURL!}/employees`)
    .then((r) => r.json())
    .then((data: Employee[]) => {
      return data;
    });
};
// todo support column type as array or as null - if undefined, `default` will be used
// column.type = null or  [] will discard the default
// column.type = 'custom' // will not have default applied
// column.type = ['custom'] // will not have default applied
// column.type = ['custom','xxx'] // will  have xxx applied last
// column.type = ['custom','default'] // will have default applied last
export const columns: Record<string, InfiniteTableColumn<Employee>> = {
  id: { field: 'id', type: 'custom-number' },
  country: {
    field: 'country',
  },
  city: { field: 'city' },
  team: { field: 'team' },
  department: { field: 'department' },
  firstName: { field: 'firstName' },
  lastName: { field: 'lastName' },
  salary: { field: 'salary', type: 'custom-number' },
  age: { field: 'age', type: 'custom-number' },
};

const defaultColumnSizing = {
  age: {
    width: 1000,
  },
  salary: {
    flex: 2,
    minWidth: 400,
  },
};

const columnTypes: InfiniteTablePropColumnTypes<Employee> = {
  'custom-number': {
    align: 'end',
    width: 100,
  },
  default: {
    width: 500,
    align: 'center',
    renderValue: ({ value }) => <>{value}!!!</>,
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
