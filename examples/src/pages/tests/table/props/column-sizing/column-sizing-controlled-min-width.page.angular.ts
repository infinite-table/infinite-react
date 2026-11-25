import { Component, computed, signal } from '@angular/core';

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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100')
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};

const domProps = {
  style: {
    height: '600px',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div>
      Current column sizing:
      <code style="color: tomato">
        <pre>{{ columnSizingText() }}</pre>
      </code>
    </div>
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        [columnDefaultWidth]="50"
        [columnSizing]="columnSizing()"
        (columnSizingChange)="onColumnSizingChange($event!)"
      />
    </infinite-data-source>
  `,
})
export default class ColumnSizingControlledMinWidthPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  protected readonly columnSizing = signal<InfiniteTablePropColumnSizing>({
    country: { width: 100 },
    city: { flex: 1, minWidth: 300 },
    salary: { flex: 2 },
  });

  protected readonly columnSizingText = computed(() =>
    JSON.stringify(this.columnSizing(), null, 2),
  );

  protected onColumnSizingChange(sizing: InfiniteTablePropColumnSizing) {
    this.columnSizing.set(sizing);
  }
}
