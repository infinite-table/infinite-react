import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

interface Person {
  Id: number;
  FirstName: string;
  Age: number;
}

const data: Person[] = [
  {
    Id: 20,
    FirstName: 'Bob',
    Age: 3,
  },
  {
    Id: 3,
    FirstName: 'Alice',
    Age: 50,
  },
  {
    Id: 10,
    FirstName: 'Bill',
    Age: 5,
  },
];

const columns: InfiniteTablePropColumns<Person> = {
  id: {
    field: 'Id' as const,
    type: 'number',
  },
  firstName: {
    field: 'FirstName' as const,
    defaultSortable: false,
  },
  age: { field: 'Age' as const, type: 'number' },
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
    <p>
      Table is configured with <b>sortable=false</b> on this page, but the
      <b>Id</b> column specifically configured as <b>sortable=true</b>
    </p>
    <infinite-data-source [data]="data" primaryKey="Id">
      <!-- sortable=true overrides the column.defaultSortable=false -->
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        [sortable]="true"
        [draggableColumns]="false"
      />
    </infinite-data-source>
  `,
})
export default class SortableButNoDraggableColumnsPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
}
