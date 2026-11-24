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

// the grid is inside a scrolling container (#host), itself in a scrolling
// page (#page - the test app's root is a fixed-height flex column, so the
// page brings its own scrolling element)
export default function App() {
  return (
    <React.StrictMode>
      <div id="page" style={{ flex: '1 1 0', minHeight: 0, overflow: 'auto' }}>
        <div style={{ height: 150 }}>page content above</div>
        <div
          id="host"
          style={{
            height: 520,
            width: 1200,
            overflow: 'auto',
            border: '2px solid tomato',
            marginLeft: 30,
          }}
        >
          <div style={{ height: 260 }}>host content above</div>
          <div style={{ marginLeft: 120, width: 1600 }}>
            <DataSource<PinnedRow> primaryKey="id" data={rows}>
              <InfiniteTable<PinnedRow>
                domProps={{
                  style: {
                    width: GRID_WIDTH,
                    height: GRID_HEIGHT,
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
          </div>
          <div style={{ height: 700 }}>host content below</div>
        </div>
        <div style={{ height: 2000 }}>page content below</div>
      </div>
    </React.StrictMode>
  );
}
