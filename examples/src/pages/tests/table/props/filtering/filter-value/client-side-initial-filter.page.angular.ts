import { Component, signal } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  injectDataSource,
} from '@infinite-table/infinite-angular';

import developers100 from '../../data/developers100';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = (): Promise<Developer[]> => {
  return Promise.resolve(developers100 as Developer[]);
};

const columns: Record<string, any> = {
  preferredLanguage: { field: 'preferredLanguage' },
  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
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
    <div class="flex gap-2 p-2">
      <button data-name="none" (click)="filterValue.set(undefined)">
        Clear filter
      </button>

      <button data-name="js" (click)="setJs()">Filter by language=JavaScript</button>
      <button data-name="go" (click)="setGo()">Filter by language=Go</button>

      <button (click)="setFrontend()">filter by stack=frontend</button>
    </div>

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
export default class ClientSideInitialFilterPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly shouldReloadData = shouldReloadData;

  protected readonly filterValue = signal<any>([
    {
      field: 'preferredLanguage',

      filter: {
        type: 'string',
        operator: 'eq',
        value: 'Go',
      },
    },
  ]);

  protected setJs() {
    this.filterValue.set([
      {
        field: 'preferredLanguage',
        filter: {
          type: 'string',
          operator: 'eq',
          value: 'JavaScript',
        },
      },
    ]);
  }

  protected setGo() {
    this.filterValue.set([
      {
        field: 'preferredLanguage',
        filter: {
          type: 'string',
          operator: 'eq',
          value: 'Go',
        },
      },
    ]);
  }

  protected setFrontend() {
    this.filterValue.set([
      {
        field: 'stack',
        filter: { type: 'string', operator: 'eq', value: 'frontend' },
      },
    ]);
  }
}
