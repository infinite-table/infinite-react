import { Component, signal } from '@angular/core';

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
const pivotBy = [{ field: 'stack' as const }];

const domProps = {
  style: {
    height: '80vh',
  },
};

const position = signal<'start' | 'end' | false>(false);

const togglePosition = () => {
  const x = position();
  position.set(x === 'end' ? 'start' : x === 'start' ? false : 'end');
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="togglePosition()">
      toggle grand totals - {{ '' + position() }}
    </button>

    <infinite-data-source
      #ds="infiniteDataSource"
      primaryKey="id"
      [data]="developers"
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
        [pivotGrandTotalColumnPosition]="position()"
      />
    </infinite-data-source>
  `,
})
export default class PivotGrandTotalColumnPositionPage {
  protected readonly columns = columns;
  protected readonly reducers = reducers;
  protected readonly groupBy = groupBy;
  protected readonly pivotBy = pivotBy;
  protected readonly domProps = domProps;
  protected readonly position = position;
  protected readonly togglePosition = togglePosition;
  protected readonly developers = developers;
}
