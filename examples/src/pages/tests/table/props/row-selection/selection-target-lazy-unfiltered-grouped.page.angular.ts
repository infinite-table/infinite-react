import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourcePropGroupBy } from '@infinite-table/infinite-angular';

import {
  lazyUnfilteredColumns,
  lazyUnfilteredDataSource,
  lazyUnfilteredFilterValue,
  type Developer,
} from './lazyUnfilteredServer';

const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'stack' }];

const domProps = {
  style: { height: '80vh' },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="lazyUnfilteredDataSource"
      [groupBy]="groupBy"
      [lazyLoad]="true"
      [defaultFilterValue]="lazyUnfilteredFilterValue"
      selectionMode="multi-row"
      [useGroupKeysForMultiRowSelection]="true"
      [multiRowSelectionTarget]="target()"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="lazyUnfilteredColumns"
        groupRenderStrategy="single-column"
        [columnDefaultWidth]="150"
      />
    </infinite-data-source>
  `,
})
export default class SelectionTargetLazyUnfilteredGroupedPage {
  protected readonly lazyUnfilteredDataSource = lazyUnfilteredDataSource;
  protected readonly lazyUnfilteredColumns = lazyUnfilteredColumns;
  protected readonly lazyUnfilteredFilterValue = lazyUnfilteredFilterValue;
  protected readonly groupBy = groupBy;
  protected readonly domProps = domProps;

  protected readonly target = signal<'all' | 'visible'>('all');

  constructor() {
    (globalThis as any).setTarget = (value: 'all' | 'visible') => {
      this.target.set(value);
    };
  }
}
