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
  DataSourceGroupRowsBy,
  DataSourcePivotBy,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  streetName: string;
  streetNo: number;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
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
  const groupRowsBy: DataSourceGroupRowsBy<Developer>[] =
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
              width: 400,
              header:
                lastKey === 'yes'
                  ? 'Designer'
                  : 'Non-designer',
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
        groupRowsBy={groupRowsBy}
        pivotBy={pivotBy}
        defaultGroupRowsState={groupRowsState}>
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              columns={columns}
              hideEmptyGroupColumns
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              columnDefaultWidth={200}
              pivotTotalColumnPosition="start"
              groupRenderStrategy="multi-column"
              columnAggregations={columnAggregations}
            />
          );
        }}
      </DataSource>
    </>
  );
}
