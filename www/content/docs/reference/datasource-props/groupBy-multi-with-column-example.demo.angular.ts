import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropAggregationReducers,
  DataSourcePropGroupBy,
} from '@infinite-table/infinite-angular';

import { columns } from './columns.angular';
import type { Employee } from './columns.angular';

const columnSizing: Record<string, { width: number }> = {
  'country-group': { width: 250 },
};

const groupBy: DataSourcePropGroupBy<Employee> = [
  {
    field: 'country',
    column: {
      header: 'Country grouping',
      style: {
        color: 'tomato',
      },
    },
  },
  {
    field: 'city',
    column: {
      field: 'firstName',
      style: {
        color: 'green',
      },
    },
  },
];

const reducers: DataSourcePropAggregationReducers<Employee> = {
  avgSalary: {
    reducer: (acc, value) => acc + value,
    done: (sum, arr) => Math.floor(arr.length ? sum / arr.length : 0),
    field: 'salary',
    initialValue: 0,
  },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees1k')
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [aggregationReducers]="reducers"
      [groupBy]="groupBy"
    >
      <infinite-table
        debugId="groupBy-multi-with-column-example"
        [columns]="columns"
        [defaultColumnSizing]="columnSizing"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly columnSizing = columnSizing;
  protected readonly groupBy = groupBy;
  protected readonly reducers = reducers;
}
