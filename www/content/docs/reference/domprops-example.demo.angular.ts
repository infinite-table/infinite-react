import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

import { data } from './data';
import type { Person } from './data';

const domProps = {
  style: {
    outline: '3px solid tomato',
    height: '100%',
  },
};

const columns: Record<string, InfiniteTableColumn<Person>> = {
  id: {
    // specifies which field from the data source
    // should be rendered in this column
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
    <infinite-data-source [data]="data" primaryKey="Id">
      <infinite-table
        debugId="domprops-example"
        [domProps]="domProps"
        [columns]="columns"
        (click)="onClick()"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  // <infinite-table> is the root element of the grid:
  // DOM events are bound on it like on any other element
  protected onClick() {
    // open browser devtools to see message
    console.log('TABLE CLICKED');
  }
}
