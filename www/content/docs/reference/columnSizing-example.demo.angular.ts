import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumns,
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

const columns: InfiniteTablePropColumns<Employee> = {
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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100')
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable, JsonPipe],
  template: `
    <p style="color: var(--infinite-cell-color)">
      Current column sizing:
      <code>
        <pre>{{ columnSizing() | json }}</pre>
      </code>
      Viewport reserved width: {{ viewportReservedWidth() }} -
      <button (click)="viewportReservedWidth.set(0)">click to reset to 0</button>
    </p>
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        debugId="columnSizing-example"
        [columns]="columns"
        [columnDefaultWidth]="50"
        [(columnSizing)]="columnSizing"
        [(viewportReservedWidth)]="viewportReservedWidth"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;

  // #highlight controlled: two-way bound, the grid writes the new sizes back
  protected readonly columnSizing = signal<InfiniteTablePropColumnSizing>({
    country: { width: 100 },
    city: { flex: 1, minWidth: 100 },
    salary: { flex: 2, maxWidth: 500 },
  });
  // #endhighlight

  protected readonly viewportReservedWidth = signal(0);
}
