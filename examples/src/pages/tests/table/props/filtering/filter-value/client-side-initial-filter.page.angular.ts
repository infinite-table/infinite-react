import { Component, signal } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { injectDataSource } from '@infinite-table/infinite-angular';

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

@Component({
  selector: 'unfiltered-count',
  template: `<p style="color: magenta" aria-label="unfiltered-count">unfiltered count: {{ ds.state().unfilteredCount }}</p>`,
})
class UnfilteredCount {
  protected readonly ds = injectDataSource();
}

const filterValue = signal<any>([
  {
    field: 'preferredLanguage',

    filter: {
      type: 'string',
      operator: 'eq',
      value: 'Go',
    },
  },
]);

const setJs = () => {
  filterValue.set([
    {
      field: 'preferredLanguage',
      filter: {
        type: 'string',
        operator: 'eq',
        value: 'JavaScript',
      },
    },
  ]);
};

const setGo = () => {
  filterValue.set([
    {
      field: 'preferredLanguage',
      filter: {
        type: 'string',
        operator: 'eq',
        value: 'Go',
      },
    },
  ]);
};

const setFrontend = () => {
  filterValue.set([
    {
      field: 'stack',
      filter: { type: 'string', operator: 'eq', value: 'frontend' },
    },
  ]);
};

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
  protected readonly setJs = setJs;
  protected readonly setFrontend = setFrontend;
  protected readonly setGo = setGo;
  protected readonly columns = columns;
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;
  protected readonly filterValue = filterValue;
  protected readonly shouldReloadData = shouldReloadData;
}
