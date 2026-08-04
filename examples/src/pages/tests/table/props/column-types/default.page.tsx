import {
  InfiniteTable,
  InfiniteTableApi,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import * as React from 'react';

import {
  columns,
  columnTypes,
  columnTypesDomProps,
  developers10DataSource,
  type Developer,
} from './common';

const App = () => {
  return (
    <React.StrictMode>
      <DataSource<Developer> primaryKey="id" data={developers10DataSource}>
        <InfiniteTable<Developer>
          domProps={columnTypesDomProps}
          onReady={({ api }: { api: InfiniteTableApi<Developer> }) => {
            (globalThis as any).api = api;
          }}
          columnTypes={columnTypes}
          columnDefaultWidth={400}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
