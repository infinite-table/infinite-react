import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { data } from './pivot-grouping-example-data';

const columns: Record<string, any> = {
  id: { field: 'id' },
  name: { field: 'name' },
  language: { field: 'language' },
  license: { field: 'license' },
};

const countReducer = {
  initialValue: 0,
  reducer: (acc: number) => acc + 1,
};

const sumReducer = {
  initialValue: 0,
  reducer: (acc: number, value: number) => acc + value,
};

const initialReducers: Record<string, any> = {
  stargazers_count: {
    ...sumReducer,
    name: 'Stars (sum)',
    field: 'stargazers_count',
  },
  license: {
    ...countReducer,
    name: 'License (count)',
    field: 'license',
  },
};
const groupBy = [{ field: 'language' as const }, { field: 'license' as const }];

const domProps = {
  style: {
    height: '80vh',
    width: '3000px',
  },
};

const pivotBy = signal<any[]>([{ field: 'has_wiki' }]);

const reducers = signal<Record<string, any>>(initialReducers);

const togglePivotByLanguage = () => {
  if (pivotBy().length == 1) {
    pivotBy.set([
      { field: 'has_wiki' },
      {
        field: 'language',
      },
    ]);
  } else {
    pivotBy.set([{ field: 'has_wiki' }]);
  }
};

const toggleMultipleAggregations = () => {
  if (reducers().license) {
    const newReducers = { ...initialReducers };
    delete newReducers.license;
    reducers.set(newReducers);
  } else {
    reducers.set(initialReducers);
  }
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="togglePivotByLanguage()">toggle pivot by language</button>
    <button (click)="toggleMultipleAggregations()">
      toggle multiple aggregations
    </button>
    <infinite-data-source
      #ds="infiniteDataSource"
      primaryKey="id"
      [data]="data"
      [groupBy]="groupBy"
      [pivotBy]="pivotBy()"
      [aggregationReducers]="reducers()"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        [columnDefaultWidth]="130"
        [hideEmptyGroupColumns]="true"
        [pivotColumns]="ds.pivotColumns()"
        [pivotColumnGroups]="ds.pivotColumnGroups()"
      />
    </infinite-data-source>
  `,
})
export default class PivotBoolGroupingExamplePage {
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly domProps = domProps;
  protected readonly pivotBy = pivotBy;
  protected readonly reducers = reducers;
  protected readonly togglePivotByLanguage = togglePivotByLanguage;
  protected readonly toggleMultipleAggregations = toggleMultipleAggregations;
  protected readonly data = data;
}
