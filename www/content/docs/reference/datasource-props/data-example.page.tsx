import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

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
  {
    id: 3,
    name: 'John',
    salary: 30_000,
    department: 'IT',
    company: 'Bobsons',
  },
  {
    id: 4,
    name: 'Jane',
    salary: 35_000,
    department: 'Marketing',
    company: 'Janies',
  },
  {
    id: 5,
    name: 'Mary',
    salary: 40_000,
    department: 'Marketing',
    company: 'Janies',
  },
];

// this can be an array, a promise or a function returning array/promise
const data = new Promise<Employee[]>((resolve) => {
  setTimeout(() => {
    resolve(employees);
  }, 100);
});

export default function App() {
  return (
    <DataSource<Employee> data={data} primaryKey="id">
      <InfiniteTable<Employee> columnDefaultWidth={130} columns={columns} />
    </DataSource>
  );
}

const columns: InfiniteTablePropColumns<Employee> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 80,
  },
  name: {
    field: 'name',
  },
  salary: { field: 'salary', type: 'number' },
  department: { field: 'department', header: 'Dep.' },
  company: { field: 'company' },
};
