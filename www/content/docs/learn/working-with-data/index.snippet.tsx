// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region intro
  <DataSource<DATA_TYPE>
    idProperty="id"
    data={[]} // or a Promise or function returning a Promise.
  />
  //#endregion
}

{
  //#region intro-2
  <DataSource<DATA_TYPE>>
    <InfiniteTable<DATA_TYPE> />
  </DataSource>
  //#endregion
}

//#region intro-3
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

export {};
