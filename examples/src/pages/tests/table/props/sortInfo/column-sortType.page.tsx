import { CarSale } from '@examples/datasets/CarSale';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { carsales } from './common';

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
export default function DataTestPage() {
  return (
    <>
      <DataSource<CarSale> data={carsales} primaryKey="id">
        <InfiniteTable<CarSale> domProps={domProps} columns={columns} />
      </DataSource>
    </>
  );
}
