import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTableApi,
  InfiniteTablePropColumnOrder,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import { rowData, Car } from '../rowData';
import { columns } from '../columns';
import { useState } from 'react';

const defaultColumnOrder = ['id', 'model', 'price'];

(globalThis as any).calls = [];
const onColumnOrderChange = (columnOrder: InfiniteTablePropColumnOrder) => {
  (globalThis as any).calls.push(columnOrder);
};

const App = () => {
  const [columnOrder, setColumnOrder] =
    useState<InfiniteTablePropColumnOrder>(defaultColumnOrder);
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
          columnOrder={columnOrder}
          onColumnOrderChange={(columnOrder) => {
            setColumnOrder(columnOrder);
            onColumnOrderChange(columnOrder);
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
