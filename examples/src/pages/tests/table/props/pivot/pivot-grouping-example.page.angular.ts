import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { data } from './pivot-grouping-example-data';

const countReducer = {
  initialValue: 0,
  reducer: (acc: number) => acc + 1,
};

const sumReducer = {
  initialValue: 0,
  reducer: (acc: number, value: number) => acc + value,
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      #ds="infiniteDataSource"
      primaryKey="id"
      [data]="data"
      [groupBy]="groupBy"
      [pivotBy]="pivotBy"
      [aggregationReducers]="reducers"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        [hideEmptyGroupColumns]="true"
        [pivotColumns]="ds.pivotColumns()"
        [pivotColumnGroups]="ds.pivotColumnGroups()"
      />
    </infinite-data-source>
  `,
})
export default class PivotGroupingExamplePage {
  protected readonly data = data;

  protected readonly columns: Record<string, any> = {
    id: { field: 'id' },
    name: { field: 'name' },
    language: { field: 'language' },
    license: { field: 'license' },
  };

  protected readonly reducers = {
    stargazers_count: {
      ...sumReducer,
      name: 'Stargarzers (sum)',
      field: 'stargazers_count' as const,
    },
    license: {
      ...countReducer,
      name: 'License (count)',
      field: 'license' as const,
    },
  };

  protected readonly groupBy = [
    { field: 'language' as const, column: { field: 'language' as const } },
    { field: 'license' as const },
  ];

  protected readonly pivotBy = [{ field: 'license' as const }];

  protected readonly domProps = {
    style: {
      height: '80vh',
    },
  };
}
