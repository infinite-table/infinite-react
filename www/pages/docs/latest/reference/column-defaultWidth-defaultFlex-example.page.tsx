import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import { useState } from 'react';

export const columns: Record<
  string,
  InfiniteTableColumn<Employee>
> = {
  firstName: {
    field: 'firstName',
    header: 'Name: defaultWidth 200',
    defaultWidth: 200,
  },
  country: {
    field: 'country',
    header: 'Country - defaultFlex: 1',
    defaultFlex: 1,
  },
  city: {
    field: 'city',
    header: 'City',
  },
  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary',
  },
};

export default function App() {
  return (
    <DataSource<Employee> data={dataSource} primaryKey="id">
      <InfiniteTable<Employee>
        columns={columns}
        columnDefaultWidth={100}
        columnMinWidth={30}
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/employees100'
  )
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};

export type Employee = {
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
