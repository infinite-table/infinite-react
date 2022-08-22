import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
} from '@infinite-table/infinite-react';

import type {
  InfiniteTableColumn,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  DataSourcePropAggregationReducers,
  DataSourceGroupBy,
  DataSourcePivotBy,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/developers100'
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data)
    .then(
      (data) =>
        new Promise<Developer[]>((resolve) => {
          setTimeout(() => resolve(data), 1000);
        })
    );
};

const avgReducer: InfiniteTableColumnAggregator<
  Developer,
  any
> = {
  initialValue: 0,
  field: 'salary',
  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => (arr.length ? sum / arr.length : 0),
};

const reducers: DataSourcePropAggregationReducers<Developer> =
  {
    salary: avgReducer,
  };

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  canDesign: { field: 'canDesign' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  age: { field: 'age' },
  salary: { field: 'salary', type: 'number' },
  currency: { field: 'currency' },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

export default function GroupByExample() {
  const groupBy: DataSourceGroupBy<Developer>[] =
    React.useMemo(
      () => [
        {
          field: 'preferredLanguage',
        },
        { field: 'stack' },
      ],
      []
    );

  const pivotBy: DataSourcePivotBy<Developer>[] =
    React.useMemo(
      () => [
        { field: 'country' },
        {
          field: 'canDesign',
        },
      ],
      []
    );

  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={groupBy}
        pivotBy={pivotBy}
        aggregationReducers={reducers}
        defaultGroupRowsState={groupRowsState}>
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              columns={columns}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              columnDefaultWidth={200}
              pivotTotalColumnPosition="end"
            />
          );
        }}
      </DataSource>
    </>
  );
}
