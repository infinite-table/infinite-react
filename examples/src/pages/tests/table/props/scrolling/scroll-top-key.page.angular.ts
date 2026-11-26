import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Item = {
  id: number;
  name: string;
};

const data: Item[] = Array.from({ length: 500 }, (_, id) => ({
  id,
  name: `Item ${id}`,
}));

const columns: InfiniteTablePropColumns<Item> = {
  id: { field: 'id' },
  name: { field: 'name' },
};

const domProps = {
  style: {
    height: '60vh',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button
      data-name="scroll-to-top"
      (click)="scrollTopKey.set(scrollTopKey() + 1)"
    >
      Scroll to top
    </button>
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table
        [rowHeight]="40"
        [scrollTopKey]="scrollTopKey()"
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ScrollTopKeyPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  protected readonly scrollTopKey = signal(0);
}
