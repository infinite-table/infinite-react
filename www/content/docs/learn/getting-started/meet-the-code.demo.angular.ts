import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Person = {
  Id: number;
  FirstName: string;
  Age: number;
};

//#highlight columns are objects keyed by the column id
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
    header: 'First Name',
  },
  age: { field: 'Age', type: 'number' },
};

const data: Person[] = [
  {
    Id: 1,
    FirstName: 'Bob',
    Age: 3,
  },
  {
    Id: 2,
    FirstName: 'Alice',
    Age: 50,
  },
  {
    Id: 3,
    FirstName: 'Bill',
    Age: 5,
  },
];

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <!-- #highlight the DataSource holds the data, the InfiniteTable renders it -->
    <infinite-data-source [data]="data" primaryKey="Id">
      <infinite-table debugId="meet-the-code" [columns]="columns" />
    </infinite-data-source>
    <!-- #endhighlight -->
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;
}
