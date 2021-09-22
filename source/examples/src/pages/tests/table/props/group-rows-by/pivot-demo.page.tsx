import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  InfiniteTablePropColumnAggregations,
  DataSourceGroupRowsBy,
  InfiniteTableColumn,
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
  ['id', { field: 'id' }],
  ['firstName', { field: 'firstName' }],
  ['country', { field: 'country' }],
  ['city', { field: 'city' }],
  ['age', { field: 'age' }],
  ['age1', { field: 'age' }],
  ['age2', { field: 'age' }],
  ['age3', { field: 'age' }],
  ['age4', { field: 'age' }],
  ['salary', { field: 'salary' }],
  ['department', { field: 'department' }],
  [
    'x',
    {
      render: ({ value }) => value,
      valueGetter: ({ data }) => {
        return data?.team + 'xx';
      },
    },
  ],
]);

const groupRowsBy: DataSourceGroupRowsBy<Employee>[] = [
  {
    field: 'department',
  },
  { field: 'team' },
];

//@ts-ignore
globalThis.columns = columns;
export default function GroupByExample() {
  return (
    <>
      <DataSource<Employee>
        primaryKey="id"
        data={dataSource}
        groupRowsBy={groupRowsBy}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Employee>
              domProps={domProps}
              columns={columns}
              defaultColumnOrder={['age2', 'firstName', 'country']}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              columnDefaultWidth={200}
              pivotTotalColumnPosition="start"
              groupRenderStrategy="single-column"
              pivotRowLabelsColumn={{
                style: {
                  color: 'red',
                },
                renderValue: ({ value }) => <b>{value}!</b>,
              }}
              pivotColumn={{
                width: 300,
                style: ({ value }: { value: number }) => {
                  return value > 150_000 ? { color: 'magenta' } : {};
                },
              }}
              groupColumn={{
                renderValue: ({ value }) => {
                  return <b>{value}!</b>;
                },
              }}
              columnAggregations={columnAggregations}
            ></InfiniteTable>
          );
        }}
      </DataSource>
    </>
  );
}
