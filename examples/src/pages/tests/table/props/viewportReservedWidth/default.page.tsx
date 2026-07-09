import * as React from 'react';

import {
  InfiniteTable,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import {
  columns,
  developers10kDataSource,
  type Developer,
} from './common';

const sinon = require('sinon');

const onColumnSizingChange = sinon.spy((_rowHeight: number) => {});
const onViewportReservedWidthChange = sinon.spy((_width: number) => {});

(globalThis as any).onColumnSizingChange = onColumnSizingChange;
(globalThis as any).onViewportReservedWidthChange =
  onViewportReservedWidthChange;

export default () => {
  const [reservedWidth, setReservedWidth] = React.useState(0);

  (globalThis as any).viewportReservedWidth = reservedWidth;
  return (
    <React.StrictMode>
      <>
        <button onClick={() => setReservedWidth(0)}>
          Fit - current reserved width is {reservedWidth}
        </button>
        <DataSource<Developer> data={developers10kDataSource} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={{
              style: {
                margin: '5px',
                height: 500,
                width: '80vw',
                border: '1px solid gray',
                position: 'relative',
              },
            }}
            columnMinWidth={50}
            onColumnSizingChange={(columnSizing) => {
              onColumnSizingChange(columnSizing);
            }}
            viewportReservedWidth={reservedWidth}
            onViewportReservedWidthChange={(reservedWidth) => {
              onViewportReservedWidthChange(reservedWidth);
              setReservedWidth(reservedWidth);
            }}
            columns={columns}
          />
        </DataSource>
      </>
    </React.StrictMode>
  );
};
