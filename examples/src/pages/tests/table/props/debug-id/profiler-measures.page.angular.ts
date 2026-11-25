import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourceApi } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

const data: Developer[] = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  firstName: `Dev ${index}`,
  salary: 1000 + index * 10,
}));

const columns: Record<string, any> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  salary: { field: 'salary', type: 'number' },
};

// the same name the grid uses for one of its own profiler entries
const USER_MEASURE_NAME = 'Sort';

// a measure made by the app itself, that the grid has to leave alone
performance.measure(USER_MEASURE_NAME, { start: 0, end: 1 });

// With a `debugId`, the grid adds entries to the custom tracks of the
// Chrome DevTools profiler. Every data update makes a few of them.
@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="update()">update</button>
    <span data-name="updates">{{ updates() }}</span>
    <infinite-data-source
      [data]="data"
      primaryKey="id"
      debugId="profiled"
      [defaultSortInfo]="defaultSortInfo"
    >
      <infinite-table
        debugId="profiled"
        (ready)="onReady($event)"
        [domProps]="domProps"
        [columns]="columns"
        [columnDefaultWidth]="150"
      />
    </infinite-data-source>
  `,
})
export default class ProfilerMeasuresPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly defaultSortInfo = {
    field: 'salary' as const,
    dir: -1 as const,
  };
  protected readonly domProps = {
    style: {
      height: '80vh',
    },
  };

  protected readonly updates = signal(0);
  private dataSourceApi: DataSourceApi<Developer> | null = null;

  protected onReady({
    dataSourceApi,
  }: {
    dataSourceApi: DataSourceApi<Developer>;
  }) {
    this.dataSourceApi = dataSourceApi;
  }

  protected update() {
    this.updates.update((value) => value + 1);
    const updates = this.updates();
    this.dataSourceApi?.updateData({
      id: updates % data.length,
      salary: 5000 + updates,
    });
  }
}
