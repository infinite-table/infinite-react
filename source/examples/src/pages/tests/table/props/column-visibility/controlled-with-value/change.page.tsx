import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTableApi,
  InfiniteTablePropColumnVisibility,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import { rowData, Car } from '../rowData';
import { columns } from '../columns';
import { useState } from 'react';

const defaultColumnVisibility: InfiniteTablePropColumnVisibility = {
  make: false,
  year: false,
};

(globalThis as any).calls = [];
const onColumnVisibilityChange = (
  columnVisibility: InfiniteTablePropColumnVisibility,
) => {
  (globalThis as any).calls.push(columnVisibility);
};

const App = () => {
  const [columnVisibility, setColumnVisibility] =
    useState<InfiniteTablePropColumnVisibility>(defaultColumnVisibility);
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
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={(columnVisibility) => {
            setColumnVisibility(columnVisibility);
            onColumnVisibilityChange(columnVisibility);
          }}
          onReady={(api: InfiniteTableApi<Car>) => {
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
