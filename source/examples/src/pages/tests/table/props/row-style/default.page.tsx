import * as React from 'react';

import classNames from './row-style.module.css';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  InfiniteTablePropRowStyle,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropRowClassName,
} from '@infinite-table/infinite-react';
// import { employees } from './employees10';

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
  // return Promise.resolve(employees);
  return fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/employees`)
    .then((r) => r.json())
    .then((data: Employee[]) => {
      return data;
    });
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

const domProps: React.HTMLAttributes<HTMLDivElement> = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative',
  },
};

const rowStyle: InfiniteTablePropRowStyle<Employee> = ({ data }) => {
  const salary = data?.salary ?? 0;

  if (salary > 150000) {
    return { background: 'tomato' };
  }
  return;
};
const rowClassName: InfiniteTablePropRowClassName<Employee> = ({ data }) => {
  const salary = data?.salary ?? 0;

  if (salary < 150000) {
    return classNames.green;
  }
  return;
};

const columnPinning: InfiniteTablePropColumnPinning = new Map([
  ['company', 'start'],
  ['companySize', 'end'],
]);
export default function RowStyleDefault() {
  return (
    <React.StrictMode>
      <DataSource<Employee> data={dataSource} primaryKey="id">
        <InfiniteTable<Employee>
          domProps={domProps}
          columnPinning={columnPinning}
          columnDefaultWidth={150}
          columns={columns}
          rowStyle={rowStyle}
          rowClassName={rowClassName}
        />
      </DataSource>
    </React.StrictMode>
  );
}
