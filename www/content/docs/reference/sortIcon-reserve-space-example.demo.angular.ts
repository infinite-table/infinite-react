import { Component, computed, signal } from '@angular/core';

import {
  DataSource,
  InfiniteCheckBox,
  InfiniteTable,
} from '@infinite-table/infinite-angular';
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
    header: 'Location: City',
  },
  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary',
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable, InfiniteCheckBox],
  template: `
    <div style="color: var(--infinite-cell-color); padding: 10px">
      <input
        infiniteCheckBox
        [checked]="reserveSpaceForSortIcon()"
        (checkedChange)="reserveSpaceForSortIcon.set(!reserveSpaceForSortIcon())"
      />Reserve space for sort icon
    </div>
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        debugId="sortIcon-reserve-space-example"
        [headerOptions]="headerOptions()"
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

  protected readonly reserveSpaceForSortIcon = signal(true);

  protected readonly headerOptions = computed(() => ({
    alwaysReserveSpaceForSortIcon: this.reserveSpaceForSortIcon(),
  }));
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
