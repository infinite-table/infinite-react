import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';
import { CarSale } from '@examples/datasets/CarSale';

import { carsales, carSaleBasicColumns as columns } from './common';

export default function DataTestPage() {
  return (
    <React.StrictMode>
      <DataSource<CarSale> data={carsales} primaryKey="id">
        <InfiniteTable<CarSale>
          domProps={{
            style: {
              margin: '5px',
              height: 900,
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          showHoverRows={true}
          showZebraRows={false}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}
