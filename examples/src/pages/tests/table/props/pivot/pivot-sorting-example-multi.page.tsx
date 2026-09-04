import * as React from 'react';

import { data, WebFramework } from './pivot-sorting-example-data';
import {
  InfiniteTable,
  DataSource,
  DataSourcePropAggregationReducers,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  DataSourceGroupBy,
  DataSourcePivotBy,
} from '@infinite-table/infinite-react';

const columns: InfiniteTablePropColumns<WebFramework> = {
  id: { field: 'id' },
  name: { field: 'name' },
  lang: { field: 'language' },
  license: { field: 'license' },
  stargazers: { field: 'stargazers_count', type: 'number' },
};

const countReducer: InfiniteTableColumnAggregator<WebFramework, any> = {
  initialValue: 0,
  reducer: (acc) => acc + 1,
};

const sumReducer: InfiniteTableColumnAggregator<WebFramework, any> = {
  initialValue: 0,
  reducer: (acc, value) => acc + value,
};

const reducers: DataSourcePropAggregationReducers<WebFramework> = {
  stargazers_count: {
    ...sumReducer,
    name: 'Stargarzers (sum)',
    field: 'stargazers_count',
    // pivotColumn: {
    //   defaultSortable: true,
    // },
  },
  license: {
    ...countReducer,
    name: 'License (count)',
    field: 'license',
  },
};
const groupBy: DataSourceGroupBy<WebFramework>[] = [
  { field: 'language' },
  { field: 'license' },
];
const pivotBy: DataSourcePivotBy<WebFramework>[] = [
  {
    field: 'has_wiki',
    // column: {
    //   defaultSortable: true,
    // },
  },
];

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
        aggregationReducers={reducers}
        defaultSortInfo={
          [
            // { id: 'stargazers_count:true', dir: 1 },
            // { id: 'group-by-license', dir: -1 },
          ]
        }
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<WebFramework>
              domProps={domProps}
              columns={columns}
              hideEmptyGroupColumns
              pivotColumn={{
                defaultSortable: true,
              }}
              groupRenderStrategy="multi-column"
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
            />
          );
        }}
      </DataSource>
    </>
  );
}
