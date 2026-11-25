import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

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

const columns: Record<string, InfiniteTableColumn<Employee>> = {
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

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [loading]="true" [data]="employees" primaryKey="id">
      <infinite-table
        debugId="loadingText-example"
        loadingText="Please wait ..."
        [columnDefaultWidth]="130"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly employees = employees;
  protected readonly columns = columns;
}
