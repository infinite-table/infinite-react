// Code shown on the Angular version of the "Working with Data" page: the
// sibling of index.snippet.tsx, with the same `#region` names. Type-checked,
// templates included, by `npm run tsc:angular`.
import { Component } from '@angular/core';

import { InfiniteTable } from '@infinite-table/infinite-angular';

//#region local-data
import { DataSource } from '@infinite-table/infinite-angular';

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

@Component({
  selector: 'employees',
  imports: [DataSource],
  template: `<infinite-data-source primaryKey="id" [data]="employees" />`,
})
export class Employees {
  protected readonly employees = employees;
}
//#endregion

// the name the docs use for the generic type
type DATA_TYPE = Employee;

//#region generic-type
import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

@Component({
  selector: 'data-grid',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="data">
      <infinite-table [columns]="columns" />
    </infinite-data-source>
  `,
})
export class DataGrid {
  protected readonly data: DataSourceData<DATA_TYPE> = [/* ... */];
  protected readonly columns: InfiniteTablePropColumns<DATA_TYPE> = {
    /* ... */
  };
}
//#endregion

@Component({
  selector: 'primary-key',
  imports: [DataSource],
  template: `
    <!-- #region intro -->
    <!-- data can also be a Promise or a function returning a Promise -->
    <infinite-data-source primaryKey="id" [data]="data" />
    <!-- #endregion -->
  `,
})
export class PrimaryKey {
  protected readonly data: DATA_TYPE[] = [];
}
