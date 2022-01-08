import * as React from 'react';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  // GroupRowsState,
  DataSourceGroupBy,
  InfiniteTablePropColumnAggregations,
  InfiniteTablePropColumnGroups,
} from '@infinite-table/infinite-react';

import { employees } from './employees10';

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
  return Promise.resolve(employees);
};

const columns = new Map<string, InfiniteTableColumn<Employee>>([
  [
    'firstName',
    {
      field: 'firstName',
      header: 'First Name',
    },
  ],

  [
    'country',
    {
      field: 'country',
      header: 'Country',
      columnGroup: 'location',
    },
  ],

  [
    'city',
    {
      field: 'city',
      header: 'City',
      columnGroup: 'address',
    },
  ],

  [
    'streetName',
    {
      field: 'streetName',
      header: 'Street Name',
      columnGroup: 'street',
    },
  ],
  [
    'streetNo',
    {
      columnGroup: 'street',
      field: 'streetNo',
      header: 'Street Number',
    },
  ],

  [
    'age',
    {
      field: 'age',
      type: 'number',
      header: 'Age',
    },
  ],
  [
    'department',
    {
      field: 'department',
      header: 'Department',
    },
  ],
  [
    'salary',
    {
      field: 'salary',
      type: 'number',
      header: 'Salary',

      render: ({ value, rowInfo }) => {
        if (rowInfo.isGroupRow) {
          return (
            <>
              Avg salary <b>{rowInfo.groupKeys?.join(', ')}</b>:{' '}
              <b>{rowInfo.reducerResults![0]}</b>
            </>
          );
        }
        return <>{value}</>;
      },
    },
  ],
  [
    'team',
    {
      field: 'team',
      header: 'Team',
    },
  ],
  ['company', { field: 'companyName', header: 'Company' }],
  ['companySize', { field: 'companySize', header: 'Company Size' }],
]);

const columnGroups: InfiniteTablePropColumnGroups = new Map([
  ['address', { columnGroup: 'location', header: 'Address' }],
  ['street', { columnGroup: 'address', header: 'Street' }],
  ['location', { header: 'Location' }],
]);

const columnAggregations: InfiniteTablePropColumnAggregations<Employee> =
  new Map([
    [
      'salary',
      {
        initialValue: 0,
        getter: (data) => data.salary,
        reducer: (acc, sum) => acc + sum,
        done: (sum, arr) => Math.floor(arr.length ? sum / arr.length : 0),
      },
    ],
  ]);

// const groupRowsState = new GroupRowsState({
//   expandedRows: [['Cuba', 'Havana'], ['Cuba']],
//   collapsedRows: true,
// });

const groupBy: DataSourceGroupBy<Employee>[] = [
  {
    field: 'country',
  },
  { field: 'city' },
];
export default function GroupByExample() {
  return (
    <React.StrictMode>
      <DataSource<Employee>
        data={dataSource}
        primaryKey="id"
        defaultGroupBy={groupBy}
      >
        <InfiniteTable<Employee>
          domProps={{
            style: {
              margin: '5px',
              height: 900,
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          groupColumn={{
            header: 'group col',
            width: 200,
            renderValue: ({ value }) => {
              return <>{value}!</>;
            },
          }}
          groupRenderStrategy="single-column"
          columnDefaultWidth={100}
          columns={columns}
          columnGroups={columnGroups}
          columnAggregations={columnAggregations}
        />
      </DataSource>
    </React.StrictMode>
  );
}
