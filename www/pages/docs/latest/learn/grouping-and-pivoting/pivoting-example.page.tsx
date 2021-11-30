import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';

import type {
  InfiniteTableColumn,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  InfiniteTablePropColumnAggregations,
  DataSourceGroupRowsBy,
  GroupRowsState,
  DataSourcePivotBy,
} from '@infinite-table/infinite-react';

type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
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
    process.env.NEXT_PUBLIC_BASE_URL + '/employees100'
  )
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};

const avgReducer: InfiniteTableColumnAggregator<
  Employee,
  any
> = {
  initialValue: 0,
  getter: (data) => data.salary,
  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => (arr.length ? sum / arr.length : 0),
};

const columnAggregations: InfiniteTablePropColumnAggregations<Employee> =
  new Map([['salary', avgReducer]]);

const columns: InfiniteTablePropColumns<Employee> = new Map<
  string,
  InfiniteTableColumn<Employee>
>([
  ['department', { field: 'department' }],
  ['country', { field: 'country' }],
  ['id', { field: 'id' }],
  ['firstName', { field: 'firstName' }],

  ['city', { field: 'city' }],
  ['age', { field: 'age' }],
  ['salary', { field: 'salary' }],
]);

const groupRowsBy: DataSourceGroupRowsBy<Employee>[] = [
  {
    field: 'department',
  },
  // { field: 'team' },
  { field: 'country' },
];

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const pivotBy: DataSourcePivotBy<Employee>[] = [
  { field: 'team' },
];

export default function GroupByExample() {
  return (
    <>
      <DataSource<Employee>
        primaryKey="id"
        data={dataSource}
        groupRowsBy={groupRowsBy}
        pivotBy={pivotBy}
        defaultGroupRowsState={groupRowsState}>
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Employee>
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
