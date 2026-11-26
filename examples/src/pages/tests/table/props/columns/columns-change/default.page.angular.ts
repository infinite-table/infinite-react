import { Component, afterNextRender, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

type Person = {
  Id: number;
  FirstName: string;
  Age: number;
};

const data = (): Promise<Person[]> =>
  Promise.resolve([
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
    {
      Id: 4,
      FirstName: 'Mark',
      Age: 25,
    },
    {
      Id: 5,
      FirstName: 'John',
      Age: 38,
    },
    {
      Id: 6,
      FirstName: 'Peter',
      Age: 14,
    },
  ]);

const columns: Record<string, InfiniteTableColumn<Person>> = {
  identifier: {
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
const domProps = {
  style: { height: '80vh' },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="Id">
      <infinite-table [columns]="cols()" [domProps]="domProps" />
    </infinite-data-source>
  `,
})
export default class ColumnsChangePage {
  protected readonly data = data;
  protected readonly domProps = domProps;

  protected readonly cols = signal<Record<string, InfiniteTableColumn<Person>>>(
    {},
  );

  constructor() {
    afterNextRender(() => {
      setTimeout(() => {
        this.cols.set(columns);
      });
    });
  }
}
