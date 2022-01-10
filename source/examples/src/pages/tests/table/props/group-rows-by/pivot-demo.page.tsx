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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
  initialValue: 0,
  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => Math.floor(arr.length ? sum / arr.length : 0),
};

const columnAggregations: InfiniteTablePropColumnAggregations<Developer> = {
  //TODO continue here - move aggregations in datasource
  salary: { field: 'salary', ...avgReducer },
  // age: { field: 'age', ...avgReducer },
};

const columns: InfiniteTablePropColumns<Developer> = new Map<
  string,
  InfiniteTableColumn<Developer>
>([
  ['preferredLanguage', { field: 'preferredLanguage' }],
  ['age', { field: 'age' }],
  ['salary', { field: 'salary', type: 'number' }],
  ['canDesign', { field: 'canDesign' }],
  ['country', { field: 'country' }],
  ['firstName', { field: 'firstName' }],
  ['stack', { field: 'stack' }],
  ['id', { field: 'id' }],
  ['hobby', { field: 'hobby' }],
  ['city', { field: 'city' }],
  ['currency', { field: 'currency' }],
]);

const domProps = { style: { height: '100vh' } };

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

export default function GroupByExample() {
  const groupBy: DataSourceGroupBy<Developer>[] = React.useMemo(
    () => [
      {
        field: 'preferredLanguage',
      },
      { field: 'stack' },
    ],
    [],
  );

  const pivotBy: DataSourcePivotBy<Developer>[] = React.useMemo(
    () => [
      { field: 'currency' },
      {
        field: 'country',
        columnGroup: ({ columnGroup }) => {
          return {
            header: `Country${
              columnGroup.pivotTotalColumnGroup ? ' total' : ''
            }: ${columnGroup.pivotGroupKey}`,
          };
        },
      },
      {
        field: 'canDesign',
        column: ({ column: pivotCol }) => {
          const lastKey = pivotCol.pivotGroupKey;

          return {
            defaultWidth: 500,
            header:
              (lastKey === 'yes' ? '💅 Designer ' : '💻 Non-designer ') +
              pivotCol.pivotAggregator.id,
          };
        },
        columnGroup: ({ columnGroup: pivotCol }) => {
          const lastKey = pivotCol.pivotGroupKey;

          return {
            header: lastKey === 'yes' ? '💅 Designer' : '💻 Non-designer',
          };
        },
      },
    ],
    [],
  );

  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={groupBy}
        pivotBy={pivotBy}
        defaultGroupRowsState={groupRowsState}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              generatePivotColumnForSingleAggregation={false}
              domProps={domProps}
              columns={columns}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              columnDefaultWidth={180}
              columnAggregations={columnAggregations}
            />
          );
        }}
      </DataSource>
      {/* <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={groupBy}
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          columnDefaultWidth={180}
          columnAggregations={columnAggregations}
        />
      </DataSource> */}
    </>
  );
}
