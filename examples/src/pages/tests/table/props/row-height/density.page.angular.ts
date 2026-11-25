import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Item = {
  id: number;
  name: string;
};

const data: Item[] = Array.from({ length: 100 }, (_, id) => ({
  id,
  name: `Item ${id}`,
}));

const columns: InfiniteTablePropColumns<Item> = {
  id: { field: 'id' },
  name: { field: 'name' },
};

const densities = ['compact', 'comfortable', 'spacious'] as const;

const domProps = {
  style: {
    height: '60vh',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div [class]="'infinite-density--' + density()">
      @for (value of densities; track value) {
      <button
        [attr.data-name]="'density-' + value"
        (click)="density.set(value)"
      >
        {{ value }}
      </button>
      }
      <infinite-data-source [data]="data" primaryKey="id">
        <!-- no rowHeight: the density drives it -->
        <infinite-table [domProps]="domProps" [columns]="columns" />
      </infinite-data-source>
    </div>
  `,
})
export default class RowHeightDensityPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly densities = densities;
  protected readonly domProps = domProps;

  protected readonly density =
    signal<(typeof densities)[number]>('comfortable');
}
