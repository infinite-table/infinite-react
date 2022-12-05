import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTableApi,
} from '@infinite-table/infinite-react';

import { rowData, Car } from '../rowData';
import { columns } from '../columns';
import { InfiniteTablePropColumnOrder } from '@infinite-table/infinite-react';

const defaultColumnOrder: InfiniteTablePropColumnOrder = [
  'id',
  'model',
  'price',
  'year',
];

(globalThis as any).calls = [];
const onColumnOrderChange = (columnOrder: InfiniteTablePropColumnOrder) => {
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
        <InfiniteTable<Car>
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
          onReady={({ api }: { api: InfiniteTableApi<Car> }) => {
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
