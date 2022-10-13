import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';

export default function App() {
  return (
    <DataSource<Employee> loading data={employees} primaryKey="id">
      <InfiniteTable<Employee>
        loadingText="Please wait ..."
        columnDefaultWidth={130}
        columns={columns}
      />
    </DataSource>
  );
}

type Employee = {
  id: string | number;
  name: string;
  salary: number;
  department: string;
  company: string;
};

const employees: Employee[] = [
  {
    id: 1,
    name: 'Bob',
    salary: 10_000,
    department: 'IT',
    company: 'Bobsons',
  },
  {
    id: 2,
    name: 'Alice',
    salary: 20_000,
    department: 'IT',
    company: 'Bobsons',
  },
];

const columns: Map<string, InfiniteTableColumn<Employee>> = new Map([
  [
    'id',
    {
      field: 'id',
      type: 'number',
      width: 80,
    },
  ],
  [
    'name',
    {
      field: 'name',
    },
  ],
  ['salary', { field: 'salary', type: 'number' }],
  ['department', { field: 'department', header: 'Dep.' }],
  ['company', { field: 'company' }],
]);
