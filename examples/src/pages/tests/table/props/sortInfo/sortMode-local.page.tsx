import { CarSale } from '@examples/datasets/CarSale';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { carsalesLocal as carsales } from './common';

const columns: Record<string, InfiniteTableColumn<CarSale>> = {
  make: { field: 'make' },
  model: { field: 'model' },

  category: {
    field: 'category',
  },
  sales: {
    field: 'sales',
    sortType: 'number',
  },
  year: {
    field: 'year',
    sortType: 'number',
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: 900,
    border: '1px solid gray',
    position: 'relative',
  } as React.CSSProperties,
};

const dataSource = () => {
  (globalThis as any).callCount = ((globalThis as any).callCount || 0) + 1;
  return Promise.resolve(carsales);
};
export default function DataTestPage() {
  return (
    <>
      <DataSource<CarSale>
        data={dataSource}
        primaryKey="id"
        shouldReloadData={{
          sortInfo: false,
        }}
      >
        <InfiniteTable<CarSale> domProps={domProps} columns={columns} />
      </DataSource>
    </>
  );
}
