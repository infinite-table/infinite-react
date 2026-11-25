import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

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
  streetPrefix: string;
  streetNo: string;
  department: string;
  team: string;
  salary: number;
  currency: number;
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
  streetName: { field: 'streetName' },
  streetNo: { field: 'streetNo' },
  currency: { field: 'currency' },
  email: { field: 'email' },
};

const getDataSourceFor = (size: string) => {
  if (size === '0') {
    return () => Promise.resolve([]);
  }
  return () => {
    return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees' + size)
      .then((r) => r.json())
      .then((data: Employee[]) => data);
  };
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div
      style="display: flex; flex: 1; flex-flow: column; color: var(--infinite-cell-color)"
    >
      <p style="padding: 10px; margin-block: 0">
        Please select the size of the datasource:
      </p>
      <div style="padding-inline: 10px; margin-bottom: 10px">
        <select
          style="display: inline-block; background: var(--infinite-background); color: currentColor; padding: var(--infinite-space-3)"
          [value]="dataSourceSize()"
          (change)="onSizeChange($event)"
        >
          <option value="0">no items</option>
          <option value="10">10 items</option>
          <option value="100">100 items</option>
          <option value="1k">1k items</option>
          <option value="10k">10k items</option>
        </select>
      </div>
      <infinite-data-source [data]="dataSource()" primaryKey="id">
        <infinite-table
          debugId="many-rows-and-columns-example"
          [columns]="columns"
          [columnDefaultWidth]="150"
        />
      </infinite-data-source>
    </div>
  `,
})
export default class App {
  protected readonly columns = columns;

  protected readonly dataSourceSize = signal('10k');

  protected readonly dataSource = computed(() =>
    getDataSourceFor(this.dataSourceSize()),
  );

  protected onSizeChange(event: Event) {
    this.dataSourceSize.set((event.target as HTMLSelectElement).value);
  }
}
