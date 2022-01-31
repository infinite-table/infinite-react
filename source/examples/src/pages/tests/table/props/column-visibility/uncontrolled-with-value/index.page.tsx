import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTableImperativeApi,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import { rowData, Car } from '../rowData';
import { columns } from '../columns';

import { InfiniteTablePropColumnVisibility } from '@infinite-table/infinite-react';

const defaultColumnVisibility: InfiniteTablePropColumnVisibility = {
  make: false,
  year: false,
  id: false,
};
(globalThis as any).calls = [];

const onColumnVisibilityChange = (
  columnVisibility: InfiniteTablePropColumnVisibility,
) => {
  (globalThis as any).calls.push(columnVisibility);
};

const App = () => {
  return (
    <React.StrictMode>
      <button
        onClick={() => {
          (
            (globalThis as any).api as InfiniteTableImperativeApi<any>
          ).setColumnVisibility({ id: false });
        }}
      >
        only hide id
      </button>
      <DataSource<Car>
        primaryKey="id"
        data={rowData}
        fields={['id', 'make', 'model', 'price', 'year']}
      >
        <InfiniteTable<Car>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          defaultColumnVisibility={defaultColumnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
          onReady={(api: InfiniteTableImperativeApi<Car>) => {
            (globalThis as any).api = api;
          }}
          columnDefaultWidth={100}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
