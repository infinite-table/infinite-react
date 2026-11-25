import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

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
    columnGroup: 'location',
  },

  city: {
    field: 'city',
    header: 'City',
    columnGroup: 'address',
  },
  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary',
  },
  department: {
    field: 'department',
    header: 'Department',
  },
  team: {
    field: 'team',
    header: 'Team',
  },
  company: { field: 'companyName', header: 'Company' },

  companySize: {
    field: 'companySize',
    header: 'Company Size',
  },
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
      <p>
        Current column order:
        <code>
          <pre>{{ columnOrderJSON() }}.</pre>
        </code>
      </p>
      <p>
        Note: if the column order contains columns that don't exist in the
        \`columns\` definition, they will be skipped.
      </p>

      <button
        style="border: 2px solid currentColor; padding: 5px"
        (click)="columnOrder.set(['firstName', 'country'])"
      >
        Click to only show "firstName" and "country".
      </button>

      <button
        style="border: 2px solid currentColor; padding: 5px; margin-left: 5px"
        (click)="columnOrder.set(true)"
      >
        Click to reset column order.
      </button>
    </div>

    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        debugId="columnOrder-advanced-example"
        [columns]="columns"
        [(columnOrder)]="columnOrder"
        [columnDefaultWidth]="200"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;

  protected readonly columnOrder = signal<string[] | true>([
    'firstName',
    'country',
    'team',
    'company',
    'firstName',
    'not existing column',
    'companySize',
  ]);

  protected readonly columnOrderJSON = computed(() =>
    JSON.stringify(this.columnOrder()),
  );
}
