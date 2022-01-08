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
  InfiniteTablePropColumnAggregations,
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
    .then((data: Developer[]) => data);
};

const avgReducer: InfiniteTableColumnAggregator<
  Developer,
  any
> = {
  initialValue: 0,
  getter: (data) => data.salary,
  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => (arr.length ? sum / arr.length : 0),
};

const columnAggregations: InfiniteTablePropColumnAggregations<Developer> =
  new Map([['salary', avgReducer]]);

const columns: InfiniteTablePropColumns<Developer> =
  new Map<string, InfiniteTableColumn<Developer>>([
    ['id', { field: 'id' }],
    ['firstName', { field: 'firstName' }],
    ['preferredLanguage', { field: 'preferredLanguage' }],
    ['stack', { field: 'stack' }],
    ['country', { field: 'country' }],
    ['canDesign', { field: 'canDesign' }],
    ['hobby', { field: 'hobby' }],

    ['city', { field: 'city' }],
    ['age', { field: 'age' }],
    ['salary', { field: 'salary', type: 'number' }],
    ['currency', { field: 'currency' }],
  ]);

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
          column: ({ column: pivotCol }) => {
            const lastKey =
              pivotCol.pivotGroupKeys[
                pivotCol.pivotGroupKeys.length - 1
              ];

            return {
              header:
                lastKey === 'yes'
                  ? '💅 Designer'
                  : '💻 Non-designer',
            };
          },
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
        defaultGroupRowsState={groupRowsState}>
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              columns={columns}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              columnDefaultWidth={180}
              columnAggregations={columnAggregations}
            />
          );
        }}
      </DataSource>
    </>
  );
}
