// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  InfiniteTable,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

//#region local-data
import { DataSource } from '@infinite-table/infinite-react';

type Employee = {
  id: string | number;
  name: string;
  salary: number;
  department: string;
  company: string;
};

const employees: Employee[] = [
  { id: 1, name: 'Bob', salary: 10_000, department: 'IT', company: 'Bobsons' },
  {
    id: 2,
    name: 'Alice',
    salary: 20_000,
    department: 'IT',
    company: 'Bobsons',
  },
  { id: 3, name: 'John', salary: 30_000, department: 'IT', company: 'Bobsons' },
];

<DataSource<Employee> primaryKey={'id'} data={employees} />;
//#endregion

// the name the docs use for the generic type
type DATA_TYPE = Employee;

declare const data: DATA_TYPE[];
declare const columns: InfiniteTablePropColumns<DATA_TYPE>;

export function PrimaryKey() {
  return (
    //#region intro
    <DataSource<DATA_TYPE>
      primaryKey="id"
      data={[]} // or a Promise or function returning a Promise.
    />
    //#endregion
  );
}

export function GenericComponents() {
  return (
    //#region generic-type
    <DataSource<DATA_TYPE> primaryKey="id" data={data}>
      <InfiniteTable<DATA_TYPE> columns={columns} />
    </DataSource>
    //#endregion
  );
}
