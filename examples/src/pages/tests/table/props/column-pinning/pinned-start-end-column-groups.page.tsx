import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  InfiniteTableApi,
} from '@infinite-table/infinite-react';

import {
  GRID_HEIGHT,
  GRID_WIDTH,
  PinnedRow,
  ROW_HEIGHT,
  columnGroups,
  columnPinning,
  getColumns,
  rows,
} from './pinnedStartEndData';

const columns = getColumns({ withGroups: true });

export default function App() {
  return (
    <React.StrictMode>
      <DataSource<PinnedRow> primaryKey="id" data={rows}>
        <InfiniteTable<PinnedRow>
          domProps={{
            style: {
              margin: 20,
              width: GRID_WIDTH,
              height: GRID_HEIGHT,
              border: '1px solid gray',
            },
          }}
          rowHeight={ROW_HEIGHT}
          columnPinning={columnPinning}
          columns={columns}
          columnGroups={columnGroups}
          onReady={({ api }: { api: InfiniteTableApi<PinnedRow> }) => {
            (globalThis as any).api = api;
          }}
        />
      </DataSource>
    </React.StrictMode>
  );
}
