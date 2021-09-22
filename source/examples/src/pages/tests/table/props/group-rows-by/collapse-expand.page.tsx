import * as React from 'react';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourceGroupRowsBy,
} from '@infinite-table/infinite-react';

import {
  InfiniteTablePropColumnAggregations,
  InfiniteTablePropColumnGroups,
} from '@src/components/InfiniteTable/types/InfiniteTableProps';
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
  // return fetch(`${process.env.NEXT_PUBLIC_DATAURL!}/employees10`)
  // .then((r) => r.json())
  // .then((data: Employee[]) => {
  //   return data;
  // });
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
      width: 500,
      render: ({ value, enhancedData }) => {
        if (enhancedData.isGroupRow) {
          return (
            <>
              Avg salary <b>{enhancedData.groupKeys?.join(', ')}</b>:{' '}
              <b>{enhancedData.reducerResults![0]}</b>
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
      width: 200,
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

const groupRowsState = new GroupRowsState({
  expandedRows: [['Cuba', 'Havana'], ['Cuba']],
  collapsedRows: true,
});

const groupRowsBy: DataSourceGroupRowsBy<Employee>[] = [
  {
    field: 'country',
  },
  { field: 'city', column: { width: 500, header: 'hey' } },
];
export default function GroupByExample() {
  return (
    <React.StrictMode>
      <DataSource<Employee>
        data={dataSource}
        primaryKey="id"
        groupRowsBy={groupRowsBy}
        defaultGroupRowsState={groupRowsState}
        onGroupRowsStateChange={(state) => {
          console.log(state);
        }}
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
          groupColumn={({
            groupBy,
          }: {
            groupBy: DataSourceGroupRowsBy<Employee>;
          }) => {
            return {
              // width: 300,
              header: `Group ${groupBy?.field}`,
            };
          }}
          columnDefaultWidth={100}
          columns={columns}
          columnGroups={columnGroups}
          columnAggregations={columnAggregations}
        />
      </DataSource>
    </React.StrictMode>
  );
}
