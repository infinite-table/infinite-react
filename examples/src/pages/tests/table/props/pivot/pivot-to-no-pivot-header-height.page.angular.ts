import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { columns } from './from-pivot-to-normal-data';
import { data } from './pivot-grouping-example-data';

const dataSource = () => {
  return Promise.resolve(data);
};

const domProps = {
  style: {
    height: '80vh',
  },
};

const groupBy = [{ field: 'license' }];
const pivotBy = [{ field: 'language' }];
const aggregationReducers = {
  stargazers_count: {
    initialValue: 0,
    field: 'stargazers_count',
    reducer: (acc: number, value: number) => acc + value,
  },
  license_count: {
    initialValue: 0,
    field: 'license',
    reducer: (acc: number) => acc + 1,
  },
};

// The same <InfiniteTable /> instance goes in and out of pivot mode, and it
// has no `columnGroups` of its own - so when it's not pivoting,
// `pivotColumnGroups` is undefined.
const view = signal<'flat' | 'grouped' | 'pivot'>('flat');

const wrapperStyle = {
  display: 'flex',
  flex: 1,
  color: 'var(--infinite-cell-color)',
  flexFlow: 'column',
  background: 'var(--infinite-background)',
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div [style]="wrapperStyle">
      <div style="padding: 10px">
        <button (click)="view.set('flat')">Flat</button>
        <button (click)="view.set('grouped')">Grouped</button>
        <button (click)="view.set('pivot')">Pivot</button>
      </div>
      <infinite-data-source
        #ds="infiniteDataSource"
        primaryKey="id"
        [data]="dataSource"
        [groupBy]="view() === 'flat' ? undefined : groupBy"
        [pivotBy]="view() === 'pivot' ? pivotBy : undefined"
        [aggregationReducers]="
          view() === 'pivot' ? aggregationReducers : undefined
        "
      >
        <infinite-table
          [domProps]="domProps"
          [columns]="columns"
          [pivotColumns]="ds.pivotColumns()"
          [pivotColumnGroups]="ds.pivotColumnGroups()"
          [columnHeaderHeight]="40"
          [columnDefaultWidth]="150"
        />
      </infinite-data-source>
    </div>
  `,
})
export default class PivotToNoPivotHeaderHeightPage {
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;
  protected readonly groupBy: any[] = groupBy;
  protected readonly pivotBy: any[] = pivotBy;
  protected readonly aggregationReducers: Record<string, any> =
    aggregationReducers;
  protected readonly view = view;
  protected readonly wrapperStyle = wrapperStyle;
  protected readonly columns: Record<string, any> = columns;
  protected readonly data = data;
}
