import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import {
  lazyUnfilteredColumns,
  lazyUnfilteredDataSource,
  lazyUnfilteredFilterValue,
} from './lazyUnfilteredServer';

const domProps = {
  style: { height: '80vh' },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="lazyUnfilteredDataSource"
      [lazyLoad]="true"
      [defaultFilterValue]="lazyUnfilteredFilterValue"
      selectionMode="multi-row"
      [multiRowSelectionTarget]="target()"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="lazyUnfilteredColumns"
        [columnDefaultWidth]="150"
      />
    </infinite-data-source>
  `,
})
export default class SelectionTargetLazyUnfilteredPage {
  protected readonly lazyUnfilteredDataSource = lazyUnfilteredDataSource;
  protected readonly lazyUnfilteredColumns = lazyUnfilteredColumns;
  protected readonly lazyUnfilteredFilterValue = lazyUnfilteredFilterValue;
  protected readonly domProps = domProps;

  protected readonly target = signal<'all' | 'visible'>('all');

  constructor() {
    (globalThis as any).setTarget = (value: 'all' | 'visible') => {
      this.target.set(value);
    };
  }
}
