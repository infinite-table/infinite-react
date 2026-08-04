import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import { CarSale } from '@examples/datasets/CarSale';

import { carsales, columns, rowHeightDomProps } from './common';

export default function DataTestPage() {
  const [rowHeight, setRowHeight] = React.useState(40);
  return (
    <React.StrictMode>
      Current row height: {rowHeight}
      <br />
      Press buttons below to increment/decrement row height by 10
      <div style={{ display: 'flex', flexFlow: 'row' }}>
        <button
          data-name="up"
          onClick={() => {
            setRowHeight((rowHeight) => rowHeight + 10);
          }}
        >
          UP
        </button>
        <button
          data-name="down"
          onClick={() => {
            setRowHeight((rowHeight) => rowHeight - 10);
          }}
        >
          DOWN
        </button>
      </div>
      <DataSource<CarSale> data={carsales} primaryKey="id">
        <InfiniteTable<CarSale>
          domProps={rowHeightDomProps}
          rowHeight={rowHeight}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}
