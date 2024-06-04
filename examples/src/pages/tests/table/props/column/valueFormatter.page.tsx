import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { Employee, employees } from './employees10';

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
    valueGetter: ({ data }) => data.age * 2,
    valueFormatter: ({ value, rowInfo }) =>
      `index: ${1000 - rowInfo.indexInAll} - ${value}!`,
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

export default function ColumnValueFormatter() {
  return (
    <React.StrictMode>
      <DataSource<Employee> data={dataSource} primaryKey="id">
        <InfiniteTable<Employee>
          domProps={domProps}
          columnDefaultWidth={150}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}
