import * as React from 'react';

import { data, WebFramework } from './pivot-grouping-example-data';
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
  language: { field: 'language' },
  license: { field: 'license' },
};

const countReducer: InfiniteTableColumnAggregator<WebFramework, any> = {
  initialValue: 0,
  reducer: (acc) => acc + 1,
};

const sumReducer: InfiniteTableColumnAggregator<WebFramework, any> = {
  initialValue: 0,
  reducer: (acc, value) => acc + value,
};

const initialReducers: DataSourcePropAggregationReducers<WebFramework> = {
  stargazers_count: {
    ...sumReducer,
    name: 'Stars (sum)',
    field: 'stargazers_count',
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

export default function PivotExample() {
  const domProps = {
    style: {
      height: '80vh',
      width: 3000,
    },
  };

  const [pivotBy, setPivotBy] = React.useState<
    DataSourcePivotBy<WebFramework>[]
  >([{ field: 'has_wiki' }]);

  const [reducers, setReducers] =
    React.useState<DataSourcePropAggregationReducers<WebFramework>>(
      initialReducers,
    );

  return (
    <>
      <button
        onClick={() => {
          if (pivotBy.length == 1) {
            setPivotBy([
              { field: 'has_wiki' },
              {
                field: 'language',
              },
            ]);
          } else {
            setPivotBy([{ field: 'has_wiki' }]);
          }
        }}
      >
        toggle pivot by language
      </button>
      <button
        onClick={() => {
          if (reducers.license) {
            const newReducers = { ...initialReducers };
            delete newReducers.license;
            setReducers(newReducers);
          } else {
            setReducers(initialReducers);
          }
        }}
      >
        toggle multiple aggregations
      </button>
      <DataSource<WebFramework>
        primaryKey="id"
        data={data}
        groupBy={groupBy}
        pivotBy={pivotBy}
        aggregationReducers={reducers}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<WebFramework>
              domProps={domProps}
              columns={columns}
              columnDefaultWidth={130}
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
