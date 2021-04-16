import * as React from 'react';

import { TableFactory, TableImperativeApi } from '@src/components/Table';
import DataSource from '@src/components/DataSource';

import { rowData, Car } from '../rowData';
import { columns } from '../columns';

import { TablePropColumnVisibility } from '@src/components/Table';

const Table = TableFactory<Car>();

const defaultColumnVisibility: TablePropColumnVisibility = new Map([
  ['make', false],
  ['year', false],
  ['id', false],
]);

(globalThis as any).calls = [];

const onColumnVisibilityChange = (
  columnVisibility: TablePropColumnVisibility,
) => {
  (globalThis as any).calls.push(Array.from(columnVisibility));
};

const App = () => {
  return (
    <React.StrictMode>
      <button
        onClick={() => {
          ((globalThis as any)
            .api as TableImperativeApi<any>).setColumnVisibility(
            new Map([['id', false]]),
          );
        }}
      >
        only hide id
      </button>
      <DataSource<Car>
        primaryKey="id"
        data={rowData}
        fields={['id', 'make', 'model', 'price', 'year']}
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
          defaultColumnVisibility={defaultColumnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
          onReady={(api: TableImperativeApi<Car>) => {
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
