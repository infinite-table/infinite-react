import { CarSale } from '@examples/datasets/CarSale';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
  DataSourceDataParams,
  DataSourcePropGroupBy,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import {
  carsales,
  columns,
  groupByCarsalesDomProps,
} from './common';

const dataSource = (params: DataSourceDataParams<CarSale>) => {
  console.log('refetch data');

  (globalThis as any).callCount = ((globalThis as any).callCount || 0) + 1;
  (globalThis as any).groupBy = params.groupBy;
  return Promise.resolve(carsales);
};
export default function DataTestPage() {
  const [groupBy, setGroupBy] = React.useState<DataSourcePropGroupBy<CarSale>>([
    {
      field: 'year',
    },
  ]);
  return (
    <>
      <button
        onClick={() => {
          setGroupBy((groupBy) => {
            if (groupBy.length) {
              return [];
            } else {
              return [
                {
                  field: 'year',
                },
              ];
            }
          });
        }}
      >
        toggle group
      </button>
      <DataSource<CarSale> data={dataSource} primaryKey="id" groupBy={groupBy}>
        <InfiniteTable<CarSale>
          domProps={groupByCarsalesDomProps}
          columns={columns as Record<string, InfiniteTableColumn<CarSale>>}
        />
      </DataSource>
    </>
  );
}
