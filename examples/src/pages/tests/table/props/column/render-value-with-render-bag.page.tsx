import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { Employee } from './employees10';

const dataSource = () => {
  const data: Employee[] = [
    {
      age: 1,
      city: 'test',
      companyName: 'test',
      companySize: '1 - 10',
      country: 'test',
      countryCode: 'test',
      department: 'test',
      email: 'test@test.com',
      firstName: 'Mark',
      lastName: 'test',
      id: 1,
      salary: 5000,
      streetName: 'test',
      streetNo: 1,
      team: 'test',
    },
  ];

  return Promise.resolve(data);
};

const columns = new Map<string, InfiniteTableColumn<Employee>>([
  [
    'firstName',
    {
      field: 'firstName',
      header: 'First Name',
      renderValue: (params) => {
        return <button data-name="target">x {params.renderBag.value}</button>;
      },
    },
  ],
]);

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
