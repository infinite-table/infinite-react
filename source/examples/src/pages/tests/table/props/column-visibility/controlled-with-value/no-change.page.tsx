import * as React from 'react';

import {
  TableFactory,
  TableImperativeApi,
  TablePropColumnVisibility,
} from '@src/components/Table';
import DataSource from '@src/components/DataSource';

import { rowData, Car } from '../rowData';
import { columns } from '../columns';

const Table = TableFactory<Car>();

const defaultColumnVisibility: TablePropColumnVisibility = new Map([
  ['year', false],
]);

(globalThis as any).calls = [];
const onColumnVisibilityChange = (
  columnVisibility: TablePropColumnVisibility,
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
        <Table
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
          onReady={(api: TableImperativeApi<Car>) => {
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
