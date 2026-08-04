import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  useDataSourceState,
  DataSourceState,
  DataSourceProps,
} from '@infinite-table/infinite-react';
import { CarSale } from '@examples/datasets/CarSale';

import { carsales, carSaleBasicColumns as columns } from './common';

function AppGrid() {
  const dataArrayLength = useDataSourceState(
    (state: DataSourceState<CarSale>) => state.dataArray.length,
  );
  return (
    <div>
      <p data-name="test">Showing {dataArrayLength} rows.</p>
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
    </div>
  );
}

const groupRowsState: DataSourceProps<CarSale>['defaultGroupRowsState'] = {
  expandedRows: true,
  collapsedRows: [[2010]],
};

export default function DataTestPage() {
  return (
    <React.StrictMode>
      <DataSource<CarSale>
        data={carsales}
        primaryKey="id"
        defaultGroupBy={[{ field: 'year' }]}
        defaultGroupRowsState={groupRowsState}
      >
        <AppGrid />
      </DataSource>
    </React.StrictMode>
  );
}
