import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

import { data } from './data';
import type { Person } from './data';

const focusedStyle = {
  outline: '3px solid tomato',
};

const columns: Record<string, InfiniteTableColumn<Person>> = {
  id: {
    field: 'Id',
    type: 'number',
    defaultSortable: true,
    defaultWidth: 80,
  },
  firstName: {
    field: 'FirstName',
  },
  age: { field: 'Age', type: 'number' },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <button autofocus>Button before - to help with focus navigation</button>
    <infinite-data-source [data]="data" primaryKey="Id">
      <infinite-table
        debugId="focusedStyle-example"
        [focusedStyle]="focusedStyle"
        [columns]="columns"
      />
    </infinite-data-source>
    <button>Button after - to help with focus navigation</button>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly focusedStyle = focusedStyle;
}
