import { CarSale } from '@examples/datasets/CarSale';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
  DataSourceDataParams,
  DataSourceSortInfo,
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

const dataSource = ({ sortInfo }: DataSourceDataParams<CarSale>) => {
  console.log('sortInfo', sortInfo);
  console.log('refetch data');
  (globalThis as any).sortInfo = sortInfo;
  (globalThis as any).callCount = ((globalThis as any).callCount || 0) + 1;
  return Promise.resolve(carsales);
};
export default function DataTestPage() {
  const [sortInfo, setSortInfo] = React.useState<DataSourceSortInfo<CarSale>>(
    [],
  );
  return (
    <>
      <DataSource<CarSale>
        data={dataSource}
        primaryKey="id"
        shouldReloadData={{
          sortInfo: true,
        }}
        onSortInfoChange={setSortInfo}
        sortInfo={sortInfo}
      >
        <InfiniteTable<CarSale> domProps={domProps} columns={columns} />
      </DataSource>
    </>
  );
}
