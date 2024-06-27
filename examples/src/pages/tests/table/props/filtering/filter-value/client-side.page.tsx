import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourcePropFilterValue,
  useDataSource,
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

function UnfilterdCount() {
  const { unfilteredCount } = useDataSource<Employee>();
  return (
    <p style={{ color: 'magenta' }} aria-label="unfiltered-count">
      unfiltered count: {unfilteredCount}
    </p>
  );
}
export default function RowStyleDefault() {
  const [filterValue, setFilterValue] = useState<
    DataSourcePropFilterValue<Employee> | undefined
  >();

  return (
    <>
      <h2>Current filter value:</h2>
      <button data-name="none" onClick={() => setFilterValue(undefined)}>
        Clear filter
      </button>
      <button
        data-name="management"
        onClick={() =>
          setFilterValue([
            {
              field: 'department',
              filter: {
                type: 'string',
                operator: 'eq',
                value: 'Management',
              },
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
              // TODO use valueGetter instead of evaluationPolicy
              // but it's not serializable when used with server-side filtering
              // so look for a solution
              // idea: rowInfo should contain both rawValue and formattedValue, and displayValue?
              // valueGetter: ({ data, rowInfo }) => data.department,
              filter: {
                type: 'string',
                operator: 'eq',

                value: 'Marketing',
              },
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
          shouldReloadData={{
            filterValue: false,
          }}
          filterValue={filterValue}
        >
          <InfiniteTable<Employee>
            domProps={domProps}
            columnDefaultWidth={150}
            columns={columns}
          />
          <UnfilterdCount />
        </DataSource>
      </React.StrictMode>
    </>
  );
}
