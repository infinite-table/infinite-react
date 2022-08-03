import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourcePropFilterValue,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { useState } from 'react';

import { Employee, employees } from '../employees10';

const dataSource = () => {
  return Promise.resolve(employees);
};

const columns: Record<string, InfiniteTableColumn<Employee>> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
    align: 'end',
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
  const [filterValue, setFilterValue] = useState<
    DataSourcePropFilterValue<Employee> | undefined
  >();

  return (
    <>
      <h2>Current filter value:</h2>
      <button data-name="none" onClick={() => setFilterValue([])}>
        Clear filter
      </button>
      <button
        data-name="management"
        onClick={() =>
          setFilterValue([
            {
              field: 'department',
              filterType: 'string',
              operator: 'contains',
              filterValue: 'Management',
            },
          ])
        }
      >
        Filter by deparment=management
      </button>
      <button
        data-name="marketing"
        onClick={() =>
          setFilterValue([
            {
              field: 'department',
              filterType: 'string',
              operator: 'contains',
              filterValue: 'Marketing',
            },
          ])
        }
      >
        Filter by deparment=marketing
      </button>

      <React.StrictMode>
        <DataSource<Employee>
          data={dataSource}
          primaryKey="id"
          filterValue={filterValue}
          onFilterValueChange={(value) => {
            console.log('set filter value', value);
            setFilterValue(value);
          }}
          defaultFilterValue={[
            {
              field: 'department',
              filterType: 'string',
              operator: 'contains',
              filterValue: 'Marketing',
            },
          ]}
        >
          <InfiniteTable<Employee>
            columnTypes={{
              default: {
                defaultFilterable: true,
              },
            }}
            domProps={domProps}
            columnDefaultWidth={150}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
}
