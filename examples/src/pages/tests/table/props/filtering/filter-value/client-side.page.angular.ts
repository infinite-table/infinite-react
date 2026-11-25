import { Component, signal } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { injectDataSource } from '@infinite-table/infinite-angular';

import { employees } from '../employees10';

const dataSource = () => {
  return Promise.resolve(employees);
};

const columns: Record<string, any> = {
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
  age: {
    field: 'age',
    type: 'number',
    header: 'Age',
  },
  department: {
    field: 'department',
    header: 'Department',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  team: {
    field: 'team',
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const shouldReloadData = {
  filterValue: false,
};

@Component({
  selector: 'unfiltered-count',
  template: `<p style="color: magenta" aria-label="unfiltered-count">unfiltered count: {{ ds.state().unfilteredCount }}</p>`,
})
class UnfilteredCount {
  protected readonly ds = injectDataSource();
}

const filterValue = signal<any>(undefined);

const setManagement = () => {
  filterValue.set([
    {
      field: 'department',
      filter: {
        type: 'string',
        operator: 'eq',
        value: 'Management',
      },
    },
  ]);
};

const setMarketing = () => {
  filterValue.set([
    {
      field: 'department',
      filter: {
        type: 'string',
        operator: 'eq',
        value: 'Marketing',
      },
    },
  ]);
};

@Component({
  imports: [DataSource, InfiniteTable, UnfilteredCount],
  template: `
  <h2>Current filter value:</h2>
  <button data-name="none" (click)="filterValue.set(undefined)">
    Clear filter
  </button>
  <button data-name="management" (click)="setManagement()">
    Filter by deparment=management
  </button>
  <button data-name="marketing" (click)="setMarketing()">
    Filter by deparment=marketing
  </button>

  <infinite-data-source
    [data]="dataSource"
    primaryKey="id"
    [shouldReloadData]="shouldReloadData"
    [filterValue]="filterValue()"
  >
    <infinite-table
      [domProps]="domProps"
      [columnDefaultWidth]="150"
      [columns]="columns"
    />
    <unfiltered-count />
  </infinite-data-source>
  `,
})
export default class ClientSidePage {
  protected readonly setManagement = setManagement;
  protected readonly setMarketing = setMarketing;
  protected readonly columns = columns;
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;
  protected readonly filterValue = filterValue;
  protected readonly shouldReloadData = shouldReloadData;
}
