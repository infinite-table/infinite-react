import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTableApi,
  InfiniteTablePropColumnPinning,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import { rowData, Car } from '../column-visibility/rowData';

const defaultColumnPinning: InfiniteTablePropColumnPinning = {
  make: 'start',
};

const App = () => {
  return (
    <React.StrictMode>
      <pre style={{ color: 'magenta' }}>
        {JSON.stringify(defaultColumnPinning)}
      </pre>
      <DataSource<Car> primaryKey="id" data={rowData}>
        <InfiniteTable<Car>
          domProps={{
            style: {
              margin: '5px',
              height: 300,
              width: 800,
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnPinning={defaultColumnPinning}
          onReady={({ api }: { api: InfiniteTableApi<Car> }) => {
            (globalThis as any).api = api;
          }}
          columns={{
            id: { field: 'id' }, // index: 0
            make: {
              // index: 1
              field: 'make',
            },
            model: { field: 'model' }, // index: 2
            price: { field: 'price' }, // index: 3
            year: { field: 'year' }, // index: 4
            last: {
              // index: 5
              field: 'id',
              header: 'last',
              renderValue: ({ value }) => {
                return <>last - {value}</>;
              },
            },
          }}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
