import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

import { data } from './data';
import type { Person } from './data';

const columns: Record<string, InfiniteTableColumn<Person>> = {
  id: {
    field: 'Id',
    header: '🎉 Identifier',
    type: 'number',
    defaultSortable: true,
    defaultWidth: 140,
  },
  firstName: {
    field: 'FirstName',
    header: 'Name',
    defaultWidth: 120,
  },
  age: { field: 'Age', type: 'number', defaultWidth: 100 },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="Id">
      <infinite-table debugId="columns-header-example" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;
}
