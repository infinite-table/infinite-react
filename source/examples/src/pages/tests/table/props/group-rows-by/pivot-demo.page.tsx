import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  InfiniteTablePropColumnAggregations,
  DataSourceGroupRowsBy,
  InfiniteTableColumn,
  GroupRowsState,
} from '@infinite-table/infinite-react';

const domProps = {
  style: { height: '80vh', border: '1px solid gray' },
};

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
  return fetch(`${process.env.NEXT_PUBLIC_DATAURL!}/employees`)
    .then((r) => r.json())
    .then((data: Employee[]) => {
      return data;
    });
};

const avgReducer: InfiniteTableColumnAggregator<Employee, any> = {
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

//@ts-ignore
globalThis.columns = columns;
export default function GroupByExample() {
  return (
    <>
      <DataSource<Employee>
        primaryKey="id"
        data={dataSource}
        groupRowsBy={groupRowsBy}
        pivotBy={[{ field: 'city' }]}
        defaultGroupRowsState={groupRowsState}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Employee>
              domProps={domProps}
              columns={columns}
              hideEmptyGroupColumns
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              columnDefaultWidth={200}
              pivotTotalColumnPosition="start"
              groupRenderStrategy="multi-column"
              // groupRenderStrategy="inline"
              columnAggregations={columnAggregations}
            ></InfiniteTable>
          );
        }}
      </DataSource>
    </>
  );
}
