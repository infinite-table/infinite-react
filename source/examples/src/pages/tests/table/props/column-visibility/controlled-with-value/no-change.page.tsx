import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTableImperativeApi,
  InfiniteTablePropColumnVisibility,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import { rowData, Car } from '../rowData';
import { columns } from '../columns';

const defaultColumnVisibility: InfiniteTablePropColumnVisibility = new Map([
  ['year', false],
]);

(globalThis as any).calls = [];
const onColumnVisibilityChange = (
  columnVisibility: InfiniteTablePropColumnVisibility,
) => {
  (globalThis as any).calls.push(Array.from(columnVisibility.entries()));
};

const App = () => {
  return (
    <React.StrictMode>
      <DataSource<Car>
        primaryKey="id"
        data={rowData}
        fields={['id', 'make', 'model', 'price']}
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
          columnVisibility={defaultColumnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
          onReady={(api: InfiniteTableImperativeApi<Car>) => {
            (globalThis as any).api = api;
          }}
          columnDefaultWidth={140}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
