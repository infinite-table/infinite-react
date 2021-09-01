import * as React from 'react';

import fetch from 'isomorphic-fetch';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';

import {
  InfiniteTablePropColumnAggregations,
  InfiniteTablePropColumnGroups,
} from '@src/components/InfiniteTable/types/InfiniteTableProps';

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
  streetNo: string;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_DATAURL!)
    .then((r) => r.json())
    .then((data: Employee[]) => {
      return data;
    });
};

const columns = new Map<string, InfiniteTableColumn<Employee>>([
  [
    'groupcol',
    {
      type: 'number',
      header: 'Group',
      width: 400,
      render: ({ value, enhancedData }) => {
        return (
          <div
            style={{
              paddingLeft:
                ((enhancedData.groupNesting || 0) +
                  (enhancedData.isGroupRow ? 0 : 1)) *
                30,
            }}
          >
            {enhancedData.groupKeys
              ? enhancedData.groupKeys.join(' >> ')
              : value ?? null}
          </div>
        );
      },
    },
  ],
  [
    'firstName',
    {
      field: 'firstName',
      header: 'First Name',
    },
  ],
  [
    'lastName',
    {
      field: 'lastName',
      header: 'Last Name',
    },
  ],
  [
    'email',
    {
      field: 'email',
      header: 'Email',
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
export default function GroupByExample() {
  return (
    <React.StrictMode>
      <DataSource<Employee>
        data={dataSource}
        primaryKey="id"
        groupRowsBy={[{ field: 'country' }]}
      >
        <InfiniteTable<Employee>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          groupColumn={true}
          columnDefaultWidth={150}
          columns={columns}
          columnGroups={columnGroups}
          columnAggregations={columnAggregations}
        />
      </DataSource>
    </React.StrictMode>
  );
}
