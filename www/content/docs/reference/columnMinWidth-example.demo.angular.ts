import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTableColumn,
  InfiniteTablePropColumnSizing,
} from '@infinite-table/infinite-angular';

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

const defaultColumnSizing: InfiniteTablePropColumnSizing = {
  city: { flex: 1 },
  salary: { flex: 2 },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        debugId="columnMinWidth-example"
        [columns]="columns"
        [columnMinWidth]="300"
        [defaultColumnSizing]="defaultColumnSizing"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly defaultColumnSizing = defaultColumnSizing;
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
