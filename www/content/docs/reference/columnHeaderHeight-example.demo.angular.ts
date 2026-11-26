import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropFilterValue,
  InfiniteTableColumn,
} from '@infinite-table/infinite-angular';

import { data } from './data';
import type { Person } from './data';

const columns: Record<string, InfiniteTableColumn<Person>> = {
  identifier: {
    field: 'Id',
    type: 'number',
    defaultSortable: true,
  },
  firstName: {
    field: 'FirstName',
  },
  age: { field: 'Age', type: 'number' },
};

const defaultFilterValue: DataSourcePropFilterValue<Person> = [];

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="data"
      primaryKey="Id"
      [defaultFilterValue]="defaultFilterValue"
    >
      <infinite-table
        debugId="columnHeaderHeight-example"
        [columns]="columns"
        [columnHeaderHeight]="60"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly defaultFilterValue = defaultFilterValue;
}
