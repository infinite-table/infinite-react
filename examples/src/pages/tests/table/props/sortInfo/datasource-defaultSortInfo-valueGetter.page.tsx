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
  y: {
    valueGetter: ({ data }) => data.year,
    renderValue: ({ data }) => data?.year,
    header: 'Year',
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
        defaultSortInfo={[
          {
            valueGetter: (data) => data.year,
            dir: 1,
            type: 'number',
            id: 'y',
          },
        ]}
      >
        <InfiniteTable<CarSale> domProps={domProps} columns={columns} />
      </DataSource>
    </>
  );
}
