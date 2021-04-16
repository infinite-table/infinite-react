import * as React from 'react';

import { TableFactory, TableImperativeApi } from '@src/components/Table';
import DataSource from '@src/components/DataSource';

import { rowData, Car } from '../rowData';
import { columns } from '../columns';
import { TablePropColumnOrder } from '@src/components/Table/types';

const Table = TableFactory<Car>();

const defaultColumnOrder: TablePropColumnOrder = [
  'id',
  'model',
  'price',
  'year',
];

(globalThis as any).calls = [];
const onColumnOrderChange = (columnOrder: TablePropColumnOrder) => {
  (globalThis as any).calls.push(columnOrder);
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
          defaultColumnOrder={defaultColumnOrder}
          onColumnOrderChange={onColumnOrderChange}
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
