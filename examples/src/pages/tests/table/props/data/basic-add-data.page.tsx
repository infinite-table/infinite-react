import * as React from 'react';
import { useState } from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
  DataSourceApi,
} from '@infinite-table/infinite-react';
import { CarSale } from '@examples/datasets/CarSale';

import { carsales } from './common';

const columns: Record<string, InfiniteTableColumn<CarSale>> = {
  id: { field: 'id', defaultWidth: 80 },
  make: { field: 'make' },
  model: { field: 'model' },

  category: {
    field: 'category',
  },
  count: {
    field: 'sales',
  },
  year: {
    field: 'year',
    type: 'number',
  },
};

export default function DataTestPage() {
  const [dataSourceApi, setDataSourceApi] =
    useState<DataSourceApi<CarSale> | null>(null);
  return (
    <React.StrictMode>
      <>
        <button
          onClick={() => {
            dataSourceApi?.insertDataArray(
              [
                {
                  id: 9,
                  make: 'test',
                  model: 'test',
                  category: 'test',
                  year: 2024,
                  sales: 1,
                  color: 'test',
                },
                {
                  id: 10,
                  make: 'test',
                  model: 'test',
                  category: 'test',
                  year: 2024,
                  sales: 1,
                  color: 'test',
                },
              ],
              {
                position: 'after',
                primaryKey: 0,
              },
            );
          }}
        >
          Insert row after ID=1
        </button>
        <DataSource<CarSale>
          data={carsales}
          primaryKey="id"
          onReady={setDataSourceApi}
        >
          <InfiniteTable<CarSale>
            domProps={{
              style: {
                margin: '5px',
                height: 900,
                border: '1px solid gray',
                position: 'relative',
              },
            }}
            columns={columns}
          />
        </DataSource>
      </>
    </React.StrictMode>
  );
}
