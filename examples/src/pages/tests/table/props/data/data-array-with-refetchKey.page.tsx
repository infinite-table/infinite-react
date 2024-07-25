import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import { CarSale } from '@examples/datasets/CarSale';

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
  return (
    <React.StrictMode>
      <>
        <button
          onClick={() => {
            carsales.push({
              category: '1 - Category 1 Truck',
              make: 'Acura',
              model: 'RDX 2WD',
              year: 2010,
              sales: 15,
              color: 'red',
              id: 1,
            });
            setRefetchKey((k) => k + 1);
          }}
        >
          add item
        </button>

        <DataSource<CarSale>
          data={carsales}
          primaryKey="id"
          refetchKey={refetchKey}
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
