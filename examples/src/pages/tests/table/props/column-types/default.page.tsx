import {
  InfiniteTable,
  InfiniteTableColumn,
  InfiniteTableApi,
  InfiniteTablePropColumnTypes,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import fetch from 'isomorphic-fetch';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  // return Promise.resolve(employees);
  return fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/developers10`)
    .then((r) => r.json())
    .then((data: Developer[]) => {
      return data;
    });
};

export const columns = new Map<string, InfiniteTableColumn<Developer>>([
  ['id', { field: 'id', type: 'numeric' }],
  [
    'country',
    {
      field: 'country',
      type: null,
    },
  ],
  ['city', { field: 'city' }],
  ['salary', { field: 'salary', type: ['default', 'numeric'] }],
]);

const columnTypes: InfiniteTablePropColumnTypes<Developer> = {
  default: {
    defaultWidth: 155,
  },
  numeric: {
    defaultWidth: 255,
    sortable: false,
    header: 'number col',
  },
};
const App = () => {
  return (
    <React.StrictMode>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          domProps={{
            style: {
              margin: '5px',
              height: '60vh',
              width: '95vw',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          onReady={({ api }: { api: InfiniteTableApi<Developer> }) => {
            (globalThis as any).api = api;
          }}
          columnTypes={columnTypes}
          columnDefaultWidth={400}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
