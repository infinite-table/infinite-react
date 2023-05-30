import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTableApi,
  InfiniteTablePropColumnPinning,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import { rowData, Car } from '../column-visibility/rowData';
import { columns } from '../column-visibility/columns';
import { useState } from 'react';

const defaultColumnPinning: InfiniteTablePropColumnPinning = {
  make: 'start',
  year: 'start',
};

// const defaultColumnPinning: InfiniteTablePropColumnPinning = {
//   make: 'end',
//   year: 'end'
// }

(globalThis as any).calls = [];

const App = () => {
  const [columnPinning, setColumnPinning] =
    useState<InfiniteTablePropColumnPinning>(defaultColumnPinning);

  return (
    <React.StrictMode>
      <pre style={{ color: 'magenta' }}>{JSON.stringify(columnPinning)}</pre>
      <DataSource<Car> primaryKey="id" data={rowData}>
        <InfiniteTable<Car>
          domProps={{
            style: {
              margin: '5px',
              height: 300,
              width: 1200,
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          pinnedStartMaxWidth={500}
          pinnedEndMaxWidth={500}
          columnPinning={columnPinning}
          onColumnPinningChange={setColumnPinning}
          onReady={({ api }: { api: InfiniteTableApi<Car> }) => {
            (globalThis as any).api = api;
          }}
          columnDefaultWidth={440}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
