import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import {
  getLazyRowCountDataSource,
  lazyRowCountColumns,
} from './lazy-row-count-server';

const dataSources = {
  withRootCount: getLazyRowCountDataSource(true),
  withoutRootCount: getLazyRowCountDataSource(false),
};

const domProps = {
  style: { height: '80vh' },
};

const withRootCount = signal(true);
const grouped = signal(true);

const data = computed(
  () => dataSources[withRootCount() ? 'withRootCount' : 'withoutRootCount'],
);
const groupBy = computed(() =>
  grouped() ? [{ field: 'stack' as const }] : [],
);

(globalThis as any).setWithRootCount = (value: boolean) => {
  withRootCount.set(value);
};
(globalThis as any).setGrouped = (value: boolean) => {
  grouped.set(value);
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="data()"
      [groupBy]="groupBy()"
      [lazyLoad]="true"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="lazyRowCountColumns"
        groupRenderStrategy="single-column"
        [columnDefaultWidth]="150"
      />
    </infinite-data-source>
  `,
})
export default class LazyRowCountPage {
  protected readonly data = data;
  protected readonly groupBy = groupBy;
  protected readonly domProps = domProps;
  protected readonly lazyRowCountColumns = lazyRowCountColumns;
}
