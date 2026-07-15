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
  color: { field: 'color', dataType: 'color' },

  category: {
    field: 'category',
  },
  sales: {
    field: 'sales',
    dataType: 'number',
  },
  year: {
    field: 'year',
    dataType: 'number',
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
      <DataSource<CarSale>
        data={carsales}
        primaryKey="id"
        sortTypes={{
          color: (one: string, two: string) => {
            if (one === 'magenta') {
              // magenta comes first
              return -1;
            }
            if (two === 'magenta') {
              // magenta comes first
              return 1;
            }
            return one.localeCompare(two);
          },
        }}
      >
        <InfiniteTable<CarSale> domProps={domProps} columns={columns} />
      </DataSource>
    </>
  );
}
