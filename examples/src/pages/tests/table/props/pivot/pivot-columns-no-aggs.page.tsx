import * as React from 'react';

import { data, WebFramework } from './pivot-grouping-example-data';
import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  DataSourceGroupBy,
  DataSourcePivotBy,
} from '@infinite-table/infinite-react';

const columns: InfiniteTablePropColumns<WebFramework> = {
  id: { field: 'id' },
  name: { field: 'name' },
  language: { field: 'language' },
  license: { field: 'license' },
};

const groupBy: DataSourceGroupBy<WebFramework>[] = [{ field: 'language' }];
const pivotBy: DataSourcePivotBy<WebFramework>[] = [{ field: 'license' }];

export default function PivotExample() {
  const domProps = {
    style: {
      height: '80vh',
    },
  };

  return (
    <>
      <DataSource<WebFramework>
        primaryKey="id"
        data={data}
        groupBy={groupBy}
        pivotBy={pivotBy}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<WebFramework>
              domProps={domProps}
              columns={columns}
              hideEmptyGroupColumns
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
            />
          );
        }}
      </DataSource>
    </>
  );
}
