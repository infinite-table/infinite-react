import { Component } from '@angular/core';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
} from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumns,
  DataSourcePropAggregationReducers,
  DataSourceGroupBy,
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

const sum = (a: number, b: number) => a + b;

// NOTE the type naming pattern DataSourceProp<PROP_NAME>
const reducers: DataSourcePropAggregationReducers<Developer> = {
  avg: {
    initialValue: 0,
    field: 'age',
    reducer: sum,
    done: (acc, data) => Math.round(acc / data.length),
  },

  sumAgg: {
    initialValue: 0,
    field: 'salary',
    reducer: sum,
  },
};

const columns: InfiniteTablePropColumns<Developer> = {
  age: { field: 'age', header: 'Age (avg)' },

  salary: {
    field: 'salary',
    type: 'number',
    header: 'Salary (sum)',
  },
  country: {
    field: 'country',

    renderGroupValue: ({ rowInfo }) => {
      const { reducerResults = {} } = rowInfo;
      return `Avg age: ${reducerResults.avg}, total salary ${reducerResults.sumAgg}`;
    },
  },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const defaultGroupRowsState = new GroupRowsState({
  //make all groups collapsed by default
  collapsedRows: true,
  expandedRows: [],
});

const groupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'country',
    column: {
      renderGroupValue: ({ value }) => value,
    },
  },
  { field: 'stack' },
];

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [defaultGroupRowsState]="defaultGroupRowsState"
      [aggregationReducers]="reducers"
      [groupBy]="groupBy"
    >
      <infinite-table
        debugId="aggregations-simple-example"
        groupRenderStrategy="multi-column"
        [columns]="columns"
        [columnDefaultWidth]="250"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly columns = columns;
  protected readonly dataSource = dataSource;
  protected readonly defaultGroupRowsState = defaultGroupRowsState;
  protected readonly groupBy = groupBy;
  protected readonly reducers = reducers;
}
