import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTableColumn,
  InfiniteTablePropColumnSizing,
} from '@infinite-table/infinite-angular';

type Employee = {
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
  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary',
  },
};

const defaultColumnSizing: InfiniteTablePropColumnSizing = {
  country: { flex: 1 },
  city: { flex: 1 },
  salary: { flex: 2 },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100')
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div style="color: var(--infinite-cell-color)">
      <p>Current viewport reserved width: {{ viewportReservedWidth() }}px.</p>

      <button
        style="padding: 5px; margin: 5px; border: 2px solid currentColor"
        (click)="viewportReservedWidth.set(0)"
      >
        Click to reset viewportReservedWidth to 0
      </button>
    </div>
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        debugId="viewportReservedWidth-example"
        [columns]="columns"
        [columnDefaultWidth]="50"
        [(viewportReservedWidth)]="viewportReservedWidth"
        [defaultColumnSizing]="defaultColumnSizing"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly defaultColumnSizing = defaultColumnSizing;

  // #highlight controlled: resizing a column writes the reserved width back
  protected readonly viewportReservedWidth = signal(0);
}
