import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Person = {
  Id: number;
  FirstName: string;
  Age: number;
};

const data: Person[] = [
  { Id: 1, FirstName: 'Bob', Age: 3 },
  { Id: 2, FirstName: 'Alice', Age: 50 },
  { Id: 3, FirstName: 'Bill', Age: 5 },
];

const columns: InfiniteTablePropColumns<Person> = {
  id: {
    // specifies which field from the data source
    // should be rendered in this column
    field: 'Id',
    type: 'number',
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
        debugId="missing-license"
        licenseKey=""
        [columnDefaultWidth]="130"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;
}
