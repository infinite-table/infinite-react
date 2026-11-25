import { Component } from '@angular/core';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
} from '@infinite-table/infinite-angular';
import type {
  DataSourcePropAggregationReducers,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  DataSourceGroupBy,
  DataSourcePivotBy,
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
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
  initialValue: 0,
  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => (arr.length ? sum / arr.length : 0),
};

const columnAggregations: DataSourcePropAggregationReducers<Developer> = {
  avgSalary: {
    field: 'salary',
    name: 'Average salary',
    ...avgReducer,
  },
  avgAge: {
    field: 'age',
    ...avgReducer,
    pivotColumn: {
      defaultWidth: 500,
      inheritFromColumn: 'firstName',
    },
  },
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: {
    field: 'firstName',
    style: {
      fontWeight: 'bold',
    },
    renderValue: ({ value }) => [value, '!'],
  },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  canDesign: { field: 'canDesign' },
  hobby: { field: 'hobby' },

  city: { field: 'city' },
  age: { field: 'age' },
  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary',
    style: { color: 'red' },
  },
  currency: { field: 'currency' },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const groupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'preferredLanguage',
  },
  { field: 'stack' },
];

const pivotBy: DataSourcePivotBy<Developer>[] = [
  { field: 'country' },
  {
    field: 'canDesign',
  },
];

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      #ds="infiniteDataSource"
      primaryKey="id"
      [data]="dataSource"
      [groupBy]="groupBy"
      [pivotBy]="pivotBy"
      [aggregationReducers]="columnAggregations"
      [defaultGroupRowsState]="groupRowsState"
    >
      <infinite-table
        debugId="pivot-column-inherit-example"
        [columns]="columns"
        [hideEmptyGroupColumns]="true"
        [pivotColumns]="ds.pivotColumns()"
        [pivotColumnGroups]="ds.pivotColumnGroups()"
        [columnDefaultWidth]="180"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly columnAggregations = columnAggregations;
  protected readonly columns = columns;
  protected readonly dataSource = dataSource;
  protected readonly groupBy = groupBy;
  protected readonly groupRowsState = groupRowsState;
  protected readonly pivotBy = pivotBy;
}
