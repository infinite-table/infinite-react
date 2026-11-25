import { Component, signal, computed } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { developers } from './pivot-total-column-position-data';

const columns: Record<string, any> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  canDesign: { field: 'canDesign' },
  hobby: { field: 'hobby' },
  city: {
    field: 'city',
  },
  age: {
    field: 'age',
    type: ['number'],
  },
  salary: {
    field: 'salary',
    type: ['number', 'currency'],
  },
  currency: { field: 'currency' },
};

const avgReducer = {
  initialValue: 0,
  reducer: (acc: number, sum: number) => acc + sum,
  done: (sum: number, arr: any[]) => (arr.length ? sum / arr.length : 0),
};

const reducers = {
  salary: {
    ...avgReducer,
    name: 'Salary (avg)',
    field: 'salary' as const,
  },
  age: {
    ...avgReducer,
    name: 'Age (avg)',
    field: 'age' as const,
  },
};
const groupBy = [{ field: 'country' as const }];

const domProps = {
  style: {
    height: '800px',
    width: '2500px',
  },
};

const showTotals = signal(false);
const includeCanDesign = signal(false);

const pivotBy = computed(() => {
  return [
    {
      field: 'stack',
    },
    includeCanDesign()
      ? {
          field: 'canDesign',
        }
      : null,
  ].filter(Boolean) as any[];
});

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button
      data-name="toggle-show-totals"
      (click)="showTotals.set(!showTotals())"
    >
      toggle show totals - {{ '' + showTotals() }}
    </button>
    <button
      data-name="toggle-can-design"
      (click)="includeCanDesign.set(!includeCanDesign())"
    >
      Toggle can design from pivot -
      {{ 'Include can design: ' + includeCanDesign() }}
    </button>
    <infinite-data-source
      #ds="infiniteDataSource"
      primaryKey="id"
      [data]="developers"
      [groupBy]="groupBy"
      [pivotBy]="pivotBy()"
      [aggregationReducers]="reducers"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        [hideEmptyGroupColumns]="true"
        [pivotColumns]="ds.pivotColumns()"
        [pivotColumnGroups]="ds.pivotColumnGroups()"
        [pivotTotalColumnPosition]="showTotals() ? 'end' : false"
        pivotGrandTotalColumnPosition="end"
      />
    </infinite-data-source>
  `,
})
export default class PivotTotalColumnPositionPage {
  protected readonly columns = columns;
  protected readonly reducers = reducers;
  protected readonly groupBy = groupBy;
  protected readonly domProps = domProps;
  protected readonly showTotals = showTotals;
  protected readonly includeCanDesign = includeCanDesign;
  protected readonly pivotBy = pivotBy;
  protected readonly developers = developers;
}
