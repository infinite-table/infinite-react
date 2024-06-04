import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourcePropFilterFunction,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { useState } from 'react';

import { Employee, employees } from '../employees10';

import {
  departmentManagementFilterFunction,
  departmentMarketingFilterFunction,
} from './filterFn';

const dataSource = () => {
  return Promise.resolve(employees);
};

const columns: Record<string, InfiniteTableColumn<Employee>> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
    header: 'Country',
  },
  city: {
    field: 'city',
    header: 'City',
  },
  age: {
    field: 'age',
    type: 'number',
    header: 'Age',
  },
  department: {
    field: 'department',
    header: 'Department',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  team: {
    field: 'team',
  },
};

const domProps: React.HTMLAttributes<HTMLDivElement> = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative',
  },
};

export default function RowStyleDefault() {
  const [filterFn, setFilterFn] =
    useState<DataSourcePropFilterFunction<Employee>>();

  return (
    <>
      <h2>Current filter function: {filterFn?.name}</h2>
      <button data-name="none" onClick={() => setFilterFn(undefined)}>
        Clear filter
      </button>
      <button
        data-name="management"
        onClick={() => setFilterFn(() => departmentManagementFilterFunction)}
      >
        Filter by deparment=management
      </button>
      <button
        data-name="marketing"
        onClick={() => setFilterFn(() => departmentMarketingFilterFunction)}
      >
        Filter by deparment=marketing
      </button>

      <React.StrictMode>
        <DataSource<Employee>
          data={dataSource}
          primaryKey="id"
          filterFunction={filterFn}
        >
          <InfiniteTable<Employee>
            domProps={domProps}
            columnDefaultWidth={150}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
}
