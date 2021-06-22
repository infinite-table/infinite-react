import * as React from 'react';

import {
  InfiniteTableFactory,
  InfiniteTableImperativeApi,
} from '@src/components/InfiniteTable';
import { DataSource } from '@src/components/DataSource';

import { rowData, Car } from './rowData';
import { columns } from './columns';
import { InfiniteTablePropColumnOrder } from '@src/components/InfiniteTable/types';
import { useState } from 'react';

const Table = InfiniteTableFactory<Car>();

(globalThis as any).calls = [];
const onColumnOrderChange = (columnOrder: InfiniteTablePropColumnOrder) => {
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
