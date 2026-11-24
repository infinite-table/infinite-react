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
  columnPinning,
  getColumns,
  rows,
} from './pinnedStartEndData';

const columns = getColumns();

export default function App() {
  const [size, setSize] = React.useState({
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
  });
  (globalThis as any).setGridSize = (width: number, height: number) =>
    setSize({ width, height });

  return (
    <React.StrictMode>
      <DataSource<PinnedRow> primaryKey="id" data={rows}>
        <InfiniteTable<PinnedRow>
          domProps={{
            style: {
              margin: 20,
              width: size.width,
              height: size.height,
              border: '1px solid gray',
            },
          }}
          rowHeight={ROW_HEIGHT}
          columnPinning={columnPinning}
          columns={columns}
          onReady={({ api }: { api: InfiniteTableApi<PinnedRow> }) => {
            (globalThis as any).api = api;
          }}
        />
      </DataSource>
    </React.StrictMode>
  );
}
