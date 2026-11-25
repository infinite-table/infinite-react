import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import {
  lazyUnfilteredColumns,
  lazyUnfilteredDataSource,
} from '../row-selection/lazyUnfilteredServer';

const domProps = {
  style: { height: '80vh' },
};

const groupBy = signal<{ field: 'stack' }[]>([]);

(globalThis as any).setGroupBy = (value: { field: 'stack' }[]) => {
  groupBy.set(value);
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="lazyUnfilteredDataSource"
      [lazyLoad]="true"
      [groupBy]="groupBy()"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="lazyUnfilteredColumns"
        [columnDefaultWidth]="150"
      />
    </infinite-data-source>
  `,
})
export default class LazyGroupByChangePage {
  protected readonly lazyUnfilteredDataSource = lazyUnfilteredDataSource;
  protected readonly lazyUnfilteredColumns = lazyUnfilteredColumns;
  protected readonly domProps = domProps;
  protected readonly groupBy = groupBy;
}
