import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourcePropAggregationReducers,
  DataSourceData,
  InfiniteTablePropColumnPinning,
} from '@infinite-table/infinite-react';

import type {
  InfiniteTablePropColumns,
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

const DATA_SOURCE_SIZE = '1k';
const dataSource: DataSourceData<Developer> = ({
  pivotBy,
  aggregationReducers,
  groupBy,

  groupKeys = [],
}) => {
  const args = [
    pivotBy
      ? 'pivotBy=' +
        JSON.stringify(
          pivotBy.map((p) => ({ field: p.field }))
        )
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' +
        JSON.stringify(
          groupBy.map((p) => ({ field: p.field }))
        )
      : null,
    aggregationReducers
      ? 'reducers=' +
        JSON.stringify(
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            id: key,
            name: aggregationReducers[key].reducer,
          }))
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/developers${DATA_SOURCE_SIZE}-sql?` +
      args
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const aggregationReducers: DataSourcePropAggregationReducers<Developer> =
  {
    salary: {
      name: 'Salary (avg)',
      field: 'salary',
      reducer: 'avg',
    },
    age: {
      name: 'Age (avg)',
      field: 'age',
      reducer: 'avg',
    },
  };

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  age: { field: 'age' },

  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const defaultColumnPinning: InfiniteTablePropColumnPinning =
  new Map([['labels', 'start']]);
const domProps = { style: { height: '90vh' } };

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

export default function RemotePivotExample() {
  const groupBy: DataSourceGroupBy<Developer>[] =
    React.useMemo(
      () => [
        {
          field: 'country',
        },
        { field: 'stack' },
      ],
      []
    );

  const pivotBy: DataSourcePivotBy<Developer>[] =
    React.useMemo(
      () => [
        { field: 'preferredLanguage' },

        {
          field: 'canDesign',

          column: ({ column }) => ({
            header: column.header + '!',
          }),
        },
      ],
      []
    );

  return (
    <DataSource<Developer>
      primaryKey="id"
      data={dataSource}
      groupBy={groupBy}
      pivotBy={pivotBy}
      aggregationReducers={aggregationReducers}
      defaultGroupRowsState={groupRowsState}
      fullLazyLoad>
      {({ pivotColumns, pivotColumnGroups }) => {
        return (
          <InfiniteTable<Developer>
            domProps={domProps}
            hideEmptyGroupColumns
            defaultColumnPinning={defaultColumnPinning}
            columns={columns}
            pivotColumns={pivotColumns}
            pivotColumnGroups={pivotColumnGroups}
            columnDefaultWidth={220}
          />
        );
      }}
    </DataSource>
  );
}
