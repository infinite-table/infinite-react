import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
  DataSourceApi,
} from '@infinite-table/infinite-react';
import { CarSale } from '@examples/datasets/CarSale';
import { data } from '../group-by/pivotData';

const carsales: CarSale[] = [
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 2WD',
    year: 2010,
    sales: 15,
    color: 'red',
    id: 0,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2007,
    sales: 1,
    color: 'red',
    id: 1,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2008,
    sales: 2,
    color: 'magenta',
    id: 2,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2009,
    sales: 136,
    color: 'blue',
    id: 3,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2010,
    color: 'blue',
    sales: 30,
    id: 4,
  },
];

const columns: Record<string, InfiniteTableColumn<CarSale>> = {
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
  const [refetchKey, setRefetchKey] = React.useState(0);
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<CarSale> | null>(null);

  return (
    <React.StrictMode>
      <>
        <button
          onClick={() => {
            /**
             * make an update so as to store state.originalDataArray
             */
            dataSourceApi!.updateData({
              id: 1,
              make: 'Acura',
              model: 'RDX 2WD',
              year: 2010,
              sales: 15,
              color: 'red',
            });

            setTimeout(() => {
              carsales.length = 1;
              // and just after that we refresh the refetchKey
              setRefetchKey((k) => k + 1);
            }, 50);
          }}
        >
          add item
        </button>

        <DataSource<CarSale>
          data={carsales}
          primaryKey="id"
          refetchKey={refetchKey}
          onReady={setDataSourceApi}
        >
          <InfiniteTable<CarSale>
            domProps={{
              style: {
                margin: '5px',
                height: '80vh',
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
