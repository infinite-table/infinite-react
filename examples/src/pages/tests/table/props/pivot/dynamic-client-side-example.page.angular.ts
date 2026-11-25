import { Component, signal } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  GroupRowsState,
} from '@infinite-table/infinite-angular';

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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: Record<string, any> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  age: {
    field: 'age',
    type: ['number'],
  },
  salary: {
    field: 'salary',
    type: ['number', 'currency'],
    style: {
      color: 'red',
    },
  },

  currency: { field: 'currency' },
};

// Groupings
const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const avgReducer = {
  initialValue: 0,

  reducer: (acc: number, sum: number) => acc + sum,
  done: (sum: number, arr: any[]) => (arr.length ? sum / arr.length : 0),
};

const domProps = {
  style: {
    height: '70vh',
  },
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

const groupBy = signal<any[]>([]);
const pivotBy = signal<any[]>([]);

const isGrouped = signal(false);
const isPivoted = signal(false);

const refresh = signal(0);

(globalThis as any).setGroupBy = (value: any[]) => {
  groupBy.set(value);
};
(globalThis as any).setPivotBy = (value: any[]) => {
  pivotBy.set(value);
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button style="color: magenta" (click)="refresh.set(refresh() + 1)">
      refresh
    </button>

    <label style="color: magenta">
      Pivoted
      <input
        type="checkbox"
        name="pivoted"
        [checked]="isPivoted()"
        (change)="isPivoted.set($any($event.target).checked)"
      />
    </label>
    <label style="color: magenta">
      Grouped
      <input
        type="checkbox"
        name="grouped"
        [checked]="isGrouped()"
        (change)="isGrouped.set($any($event.target).checked)"
      />
    </label>
    <infinite-data-source
      #ds="infiniteDataSource"
      primaryKey="id"
      [data]="dataSource"
      [groupBy]="isGrouped() ? groupBy() : undefined"
      [pivotBy]="isPivoted() ? pivotBy() : undefined"
      [aggregationReducers]="reducers"
      [defaultGroupRowsState]="groupRowsState"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        [virtualizeColumns]="false"
        [pivotColumns]="ds.pivotColumns()"
        [pivotColumnGroups]="ds.pivotColumnGroups()"
        pivotTotalColumnPosition="end"
      />
    </infinite-data-source>
  `,
})
export default class DynamicClientSideExamplePage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupRowsState = groupRowsState;
  protected readonly domProps = domProps;
  protected readonly reducers = reducers;
  protected readonly groupBy = groupBy;
  protected readonly pivotBy = pivotBy;
  protected readonly isGrouped = isGrouped;
  protected readonly isPivoted = isPivoted;
  protected readonly refresh = refresh;
}
