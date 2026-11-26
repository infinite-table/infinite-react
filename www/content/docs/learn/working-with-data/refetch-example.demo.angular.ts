import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { columns } from './columns.angular';
import type { Employee } from './columns.angular';

const getDataSourceFor = (size: string) => {
  if (size === '0') {
    return () => Promise.resolve([]);
  }
  return () => {
    return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees' + size)
      .then((r) => r.json())
      .then((data: Employee[]) => data);
  };
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div
      style="display: flex; flex: 1; flex-flow: column; color: var(--infinite-cell-color); background: var(--infinite-background)"
    >
      <p style="padding: 10px">Please select the size of the datasource:</p>
      <div style="padding: 10px">
        <select
          style="margin: 10px 0; display: inline-block; background: var(--infinite-background); color: currentColor; padding: var(--infinite-space-3)"
          [value]="dataSourceSize()"
          (change)="onSizeChange($event)"
        >
          <option value="0">no items</option>
          <option value="10">10 items</option>
          <option value="100">100 items</option>
          <option value="1k">1k items</option>
          <option value="10k">10k items</option>
        </select>
      </div>
      <infinite-data-source [data]="dataSource()" primaryKey="id">
        <infinite-table
          debugId="refetch-example"
          [columns]="columns"
          [columnDefaultWidth]="150"
        />
      </infinite-data-source>
    </div>
  `,
})
export default class App {
  protected readonly columns = columns;

  protected readonly dataSourceSize = signal('10');

  protected readonly dataSource = computed(() =>
    getDataSourceFor(this.dataSourceSize()),
  );

  protected onSizeChange(event: Event) {
    this.dataSourceSize.set((event.target as HTMLSelectElement).value);
  }
}
