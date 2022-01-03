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

const domProps = {
  style: {
    height: '80vh',
  },
};
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
  return fetch(process.env.NEXT_PUBLIC_DATAURL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data)
    .then(
      (data) =>
        new Promise<Developer[]>((resolve) => {
          setTimeout(() => resolve(data), 1000);
        }),
    );
};

const avgSalaryReducer: InfiniteTableColumnAggregator<Developer, any> = {
  initialValue: 0,
  getter: (data) => data.salary,
  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => (arr.length ? sum / arr.length : 0),
};

const columnAggregations: InfiniteTablePropColumnAggregations<Developer> =
  new Map([['salary', avgSalaryReducer]]);

const columns: InfiniteTablePropColumns<Developer> = new Map<
  string,
  InfiniteTableColumn<Developer>
>([
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
  const groupRowsBy: DataSourceGroupRowsBy<Developer>[] = React.useMemo(
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
      {
        field: 'country',
        column: ({ column }) => {
          return {
            header: `Totals for: ${column.pivotGroupKeyForColumn}`,
            render: (arg) => {
              const { value } = arg;
              console.log(arg);
              return value;
            },
          };
        },
      },
      // { field: 'currency' },
    ],
    [],
  );

  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupRowsBy={groupRowsBy}
        pivotBy={pivotBy}
        defaultGroupRowsState={groupRowsState}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              columns={columns}
              domProps={domProps}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              columnDefaultWidth={200}
              pivotTotalColumnPosition="start"
              columnAggregations={columnAggregations}
            />
          );
        }}
      </DataSource>
    </>
  );
}
