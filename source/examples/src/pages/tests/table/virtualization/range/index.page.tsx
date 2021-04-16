import * as React from 'react';

import { TableFactory, TableImperativeApi } from '@src/components/Table';
import DataSource from '@src/components/DataSource';

import { rowData, Car } from './rowData';
import { columns } from './columns';
import { TablePropColumnOrder } from '@src/components/Table/types';
import { useState } from 'react';

const Table = TableFactory<Car>();

(globalThis as any).calls = [];
const onColumnOrderChange = (columnOrder: TablePropColumnOrder) => {
  (globalThis as any).calls.push(columnOrder);
};

const App = () => {
  const [height, setHeight] = useState(350);

  return (
    <React.StrictMode>
      current height {height}
      <button onClick={() => setHeight(height - 40)}>height -= 40 </button>
      <DataSource<Car>
        primaryKey="id"
        data={rowData}
        fields={['id', 'make', 'model', 'price']}
      >
        <Table
          domProps={{
            style: {
              margin: '5px',
              // height: '80vh',
              height: 350,
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          header={true}
          virtualizeColumns={true}
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
