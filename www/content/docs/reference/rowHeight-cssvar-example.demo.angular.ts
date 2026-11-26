import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

import { data } from './data';
import type { Person } from './data';

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
    <div style="position: relative; flex: 1; display: flex; --row-height: 70px">
      <infinite-data-source [data]="data" primaryKey="Id">
        <infinite-table
          debugId="rowHeight-cssvar-example"
          rowHeight="--row-height"
          [columns]="columns"
        />
      </infinite-data-source>
    </div>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;
}
