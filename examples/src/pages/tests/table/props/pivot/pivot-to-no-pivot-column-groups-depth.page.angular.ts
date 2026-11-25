import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { data } from './pivot-grouping-example-data';

const dataSource = () => {
  return Promise.resolve(data);
};

const domProps = {
  style: {
    height: '80vh',
  },
};

// two levels of column groups, so the header is three rows tall
const columnGroups = {
  repo: { header: 'Repository' },
  stats: { header: 'Stats', columnGroup: 'repo' },
};

const columns = {
  id: { field: 'id' },
  name: { field: 'name', columnGroup: 'repo' },
  stargazers_count: { field: 'stargazers_count', columnGroup: 'stats' },
  week_issue_change: { field: 'week_issue_change', columnGroup: 'stats' },
  language: { field: 'language' },
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

// The same <InfiniteTable /> instance goes in and out of pivot mode. It has
// its own `columnGroups`, which are deeper than the pivot column groups.
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
          [columnGroups]="columnGroups"
          [pivotColumns]="ds.pivotColumns()"
          [pivotColumnGroups]="ds.pivotColumnGroups()"
          [columnHeaderHeight]="40"
          [columnDefaultWidth]="150"
        />
      </infinite-data-source>
    </div>
  `,
})
export default class PivotToNoPivotColumnGroupsDepthPage {
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;
  protected readonly columnGroups = columnGroups;
  protected readonly columns: Record<string, any> = columns;
  protected readonly groupBy: any[] = groupBy;
  protected readonly pivotBy: any[] = pivotBy;
  protected readonly aggregationReducers: Record<string, any> =
    aggregationReducers;
  protected readonly view = view;
  protected readonly wrapperStyle = wrapperStyle;
  protected readonly data = data;
}
