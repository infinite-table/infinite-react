import { Component } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  GroupRowsState,
} from '@infinite-table/infinite-angular';

import { cachedDataSource } from './server-side-grouping-with-error.data';

const domProps = {
  style: {
    height: '80vh',
  },
};

const columns: Record<string, any> = {
  preferredLanguage: { field: 'preferredLanguage' },
  age: { field: 'age' },

  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const groupBy = [
  {
    field: 'country' as const,
  },
  {
    field: 'city' as const,
  },
];

const groupColumn = {
  renderValue: ({ rowInfo }: { rowInfo: any }) => {
    if (!rowInfo.isGroupRow) {
      return rowInfo.value;
    }
    return rowInfo.error ?? rowInfo.value;
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="cachedDataSource"
      [groupBy]="groupBy"
      [defaultGroupRowsState]="groupRowsState"
      [lazyLoad]="true"
    >
      <infinite-table
        [domProps]="domProps"
        [groupColumn]="groupColumn"
        [columns]="columns"
        groupRenderStrategy="single-column"
        [columnDefaultWidth]="220"
      />
    </infinite-data-source>
  `,
})
export default class ServerSideGroupingWithErrorCachedPage {
  protected readonly cachedDataSource = cachedDataSource;
  protected readonly domProps = domProps;
  protected readonly columns = columns;
  protected readonly groupRowsState = groupRowsState;
  protected readonly groupBy = groupBy;
  protected readonly groupColumn = groupColumn;
}
