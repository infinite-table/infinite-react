import * as React from 'react';

import {
  TableFactory,
  TableImperativeApi,
  TablePropColumnOrder,
} from '@src/components/Table';
import DataSource from '@src/components/DataSource';

import { rowData, Car } from '../rowData';
import { columns } from '../columns';
import { useState } from 'react';

const Table = TableFactory<Car>();

const defaultColumnOrder = ['id', 'model', 'price'];

(globalThis as any).calls = [];
const onColumnOrderChange = (columnOrder: TablePropColumnOrder) => {
  (globalThis as any).calls.push(columnOrder);
};

const App = () => {
  const [columnOrder, setColumnOrder] = useState<TablePropColumnOrder>(
    defaultColumnOrder,
  );
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
          columnOrder={columnOrder}
          onColumnOrderChange={(columnOrder) => {
            setColumnOrder(columnOrder);
            onColumnOrderChange(columnOrder);
          }}
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
