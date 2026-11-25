import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import type {
  InfiniteTablePropColumns,
  InfiniteTablePropColumnSizing,
} from '@infinite-table/infinite-angular';

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
    <button data-name="auto-size" (click)="key.set(key() + 1)">
      Auto size
    </button>
    <button data-name="set-width" (click)="setWidth()">Set width</button>
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table
        [rowHeight]="40"
        [columnDefaultWidth]="200"
        [columnMinWidth]="20"
        [columnSizing]="columnSizing()"
        (columnSizingChange)="onColumnSizingChange($event!)"
        [autoSizeColumnsKey]="autoSizeColumnsKey()"
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class AutoSizeColumnsKeyObjectPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  protected readonly key = signal(0);
  protected readonly columnSizing = signal<InfiniteTablePropColumnSizing>({});

  protected readonly autoSizeColumnsKey = computed(() =>
    this.key()
      ? { key: this.key(), columnsToResize: ['id'], includeHeader: false }
      : undefined,
  );

  protected onColumnSizingChange(sizing: InfiniteTablePropColumnSizing) {
    this.columnSizing.set(sizing);
  }

  protected setWidth() {
    this.columnSizing.set({ ...this.columnSizing(), id: { width: 300 } });
  }
}
