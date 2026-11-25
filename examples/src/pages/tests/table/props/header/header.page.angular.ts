import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

interface Person {
  Id: number;
  FirstName: string;
  LastName: string;
  Address: string;
  Age: number;
}

const data = [
  {
    Id: 20,
    FirstName: 'Bob',
    LastName: 'Bobson',
    Address: 'United States, Nashvile 8, rue due Secour',
    Age: 3,
  },
  {
    Id: 3,
    FirstName: 'Alice',
    LastName: 'Aliceson',
    Address: 'United States, San Francisco 5',
    Age: 50,
  },
  {
    Id: 10,
    FirstName: 'Bill',
    LastName: 'Billson',
    Address: 'France, Paris, Sur seine',
    Age: 5,
  },
];

const columns: Record<string, InfiniteTableColumn<Person>> = {
  Id: {
    field: 'Id',
    type: 'number',
  },
  FirstName: {
    field: 'FirstName',
    header: 'First Name',
  },
  LastName: {
    field: 'LastName',
    header: 'Last Name',
  },
  Age: {
    field: 'Age',
    type: 'number',
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

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="header.set(!header())">toggle</button>
    <infinite-data-source [data]="data" primaryKey="Id" [fields]="fields">
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="200"
        [columns]="columns"
        [rowHeight]="30"
        [header]="header()"
      />
    </infinite-data-source>
  `,
})
export default class HeaderPage {
  protected readonly header = signal(true);
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly fields = [
    'Id',
    'FirstName',
    'Age',
    'Address',
    'LastName',
  ] as (keyof Person)[];
}
