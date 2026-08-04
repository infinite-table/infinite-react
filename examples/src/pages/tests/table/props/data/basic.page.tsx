import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';
import { CarSale } from '@examples/datasets/CarSale';
import { Button } from '@/components/ui/button';

import { carsales, carSaleBasicColumns as columns } from './common';

export default function DataTestPage() {
  const [active, setActive] = React.useState([true, true]);
  return (
    <React.StrictMode>
      <Button onClick={() => setActive([!active[0], active[1]])}>
        toggle test
      </Button>
      {active[0] && (
        <DataSource<CarSale> data={carsales} primaryKey="id">
          <InfiniteTable<CarSale>
            debugId="test"
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
      )}
      <Button onClick={() => setActive([active[0], !active[1]])}>
        Toggle simple
      </Button>
      {active[1] && (
        <DataSource<CarSale>
          data={carsales}
          primaryKey="id"
          selectionMode="multi-row"
        >
          <InfiniteTable<CarSale>
            debugId="simple"
            domProps={{
              style: {
                margin: '5px',
                height: 900,
                border: '1px solid gray',
                position: 'relative',
              },
            }}
            columns={{
              make: columns.make,
            }}
          />
        </DataSource>
      )}
    </React.StrictMode>
  );
}
