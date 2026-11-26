import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

export const columns: Record<string, InfiniteTableColumn<Employee>> = {
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
  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary',
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div style="color: var(--infinite-cell-color)">
      <button
        style="padding: 10px; border: 2px solid currentColor"
        (click)="resizableColumns.set(!resizableColumns())"
      >
        Click to toggle
      </button>

      <p style="padding: 10px">
        Columns are currently
        {{ resizableColumns() ? 'resizable' : 'NOT RESIZABLE' }}.
      </p>
    </div>
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        debugId="resizableColumns-example"
        [resizableColumns]="resizableColumns()"
        [columns]="columns"
        [columnDefaultWidth]="100"
        [columnMinWidth]="30"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;

  protected readonly resizableColumns = signal(true);
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100')
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
