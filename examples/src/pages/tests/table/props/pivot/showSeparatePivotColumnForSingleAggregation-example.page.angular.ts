import { Component, signal, computed } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
  streetName: string;
  streetNo: number;
  streetPrefix: string;
};

const developers: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    lastName: 'Klein',
    country: 'India',

    city: 'Unnao',
    streetName: 'Purdy Lane',
    streetPrefix: 'Landing',
    streetNo: 183,
    age: 24,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'yes',
    salary: 60000,
    hobby: 'sports',
  },
  {
    id: 1,
    firstName: 'Rob',
    lastName: 'Boston',
    country: 'USA',

    city: 'LA',
    streetName: 'Purdy Lane',
    streetPrefix: 'Landing',
    streetNo: 183,
    age: 24,
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
    canDesign: 'no',
    salary: 10000,
    hobby: 'sports',
  },
  {
    id: 2,
    firstName: 'Roby',
    lastName: 'Bostony',
    country: 'USA',

    city: 'LA',
    streetName: 'Purdy Lane',
    streetPrefix: 'Landing',
    streetNo: 183,
    age: 24,
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
    canDesign: 'yes',
    salary: 10000,
    hobby: 'sports',
  },
];

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
};
const groupBy = [{ field: 'country' as const }, { field: 'stack' as const }];
const pivotBy = [
  {
    field: 'stack' as const,
  },
];

const domProps = {
  style: {
    height: '80vh',
  },
};

const showSeparatePivotColumnForSingleAggregation = signal(true);
const totalColumnVisible = signal(true);
const useCanDesignPivot = signal(false);

const pivot = computed(() => {
  return (pivotBy as any[]).concat(
    useCanDesignPivot() ? [{ field: 'canDesign' }] : [],
  );
});

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button
      data-name="toggle-show-separate"
      (click)="
        showSeparatePivotColumnForSingleAggregation.set(
          !showSeparatePivotColumnForSingleAggregation()
        )
      "
    >
      Toggle showSeparatePivotColumnForSingleAggregation -
      {{ '' + showSeparatePivotColumnForSingleAggregation() }}
    </button>
    <button
      data-name="toggle-total-col"
      (click)="totalColumnVisible.set(!totalColumnVisible())"
    >
      Toggle total column - {{ '' + totalColumnVisible() }}
    </button>
    <button
      data-name="toggle-pivot-col"
      (click)="useCanDesignPivot.set(!useCanDesignPivot())"
    >
      Toggle pivot by canDesign - {{ '' + useCanDesignPivot() }}
    </button>
    <infinite-data-source
      #ds="infiniteDataSource"
      primaryKey="id"
      [data]="developers"
      [groupBy]="groupBy"
      [pivotBy]="pivot()"
      [aggregationReducers]="reducers"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        [hideEmptyGroupColumns]="true"
        [pivotColumns]="ds.pivotColumns()"
        [pivotColumnGroups]="ds.pivotColumnGroups()"
        [showSeparatePivotColumnForSingleAggregation]="
          showSeparatePivotColumnForSingleAggregation()
        "
        [pivotTotalColumnPosition]="totalColumnVisible() ? 'end' : false"
      />
    </infinite-data-source>
  `,
})
export default class ShowSeparatePivotColumnForSingleAggregationExamplePage {
  protected readonly developers = developers;
  protected readonly columns = columns;
  protected readonly reducers = reducers;
  protected readonly groupBy = groupBy;
  protected readonly pivotBy = pivotBy;
  protected readonly domProps = domProps;
  protected readonly showSeparatePivotColumnForSingleAggregation =
    showSeparatePivotColumnForSingleAggregation;
  protected readonly totalColumnVisible = totalColumnVisible;
  protected readonly useCanDesignPivot = useCanDesignPivot;
  protected readonly pivot = pivot;
}
