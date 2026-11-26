import { Component, signal } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  injectDataSource,
} from '@infinite-table/infinite-angular';

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

// the React page reads the state with useDataSourceInternal - here a child
// of the DataSource reads it from the context
@Component({
  selector: 'unfiltered-count',
  template: `<p style="color: magenta" aria-label="unfiltered-count">unfiltered count: {{ state().unfilteredCount }}</p>`,
})
class UnfilteredCount {
  protected readonly state = injectDataSource().state;
}

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
export default class FilterValueClientSidePage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly shouldReloadData = shouldReloadData;

  protected readonly filterValue = signal<any>(undefined);

  protected setManagement() {
    this.filterValue.set([
      {
        field: 'department',
        filter: {
          type: 'string',
          operator: 'eq',
          value: 'Management',
        },
      },
    ]);
  }

  protected setMarketing() {
    this.filterValue.set([
      {
        field: 'department',
        filter: {
          type: 'string',
          operator: 'eq',
          value: 'Marketing',
        },
      },
    ]);
  }
}
