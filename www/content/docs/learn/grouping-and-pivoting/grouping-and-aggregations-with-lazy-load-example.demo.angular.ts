import { Component } from '@angular/core';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
} from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
  DataSourceGroupBy,
  DataSourcePropAggregationReducers,
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

const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
  salary: {
    name: 'Salary (avg)',
    field: 'salary',
    reducer: 'avg',
  },
  age: {
    name: 'Age (avg)',
    field: 'age',
    reducer: 'avg',
  },
};

const columns: InfiniteTablePropColumns<Developer> = {
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

const groupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'country',
  },
  { field: 'city' },
  { field: 'stack' },
];

const dataSource: DataSourceData<Developer> = ({
  aggregationReducers,
  groupBy,

  groupKeys,
  sortInfo,
}) => {
  // it's important to send the current group keys - for top level, this will be []
  const args: string[] = [`groupKeys=${JSON.stringify(groupKeys)}`];

  // turn the sorting info into an array
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }

  if (sortInfo) {
    // the backend expects the sort info to be an array of field,dir pairs
    args.push(
      'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s) => ({
            field: s.field,
            dir: s.dir,
          })),
        ),
    );
  }

  if (groupBy) {
    // for grouping, send an array of objects with the `field` property
    args.push(
      'groupBy=' + JSON.stringify(groupBy.map((p) => ({ field: p.field }))),
    );
  }

  if (aggregationReducers) {
    args.push(
      'reducers=' +
        JSON.stringify(
          // by convention, we send an array of reducers, each with `field` `name` and `id`
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            id: key,
            name: aggregationReducers[key].reducer,
          })),
        ),
    );
  }

  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + `/developers30k-sql?` + args.join('&'),
  ).then((r) => r.json());
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="dataSource"
      [groupBy]="groupBy"
      [aggregationReducers]="aggregationReducers"
      [defaultGroupRowsState]="groupRowsState"
      [lazyLoad]="true"
    >
      <infinite-table
        debugId="grouping-and-aggregations-with-lazy-load-example"
        [scrollStopDelay]="10"
        groupRenderStrategy="single-column"
        [hideEmptyGroupColumns]="true"
        [columns]="columns"
        [columnDefaultWidth]="220"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly aggregationReducers = aggregationReducers;
  protected readonly columns = columns;
  protected readonly dataSource = dataSource;
  protected readonly groupBy = groupBy;
  protected readonly groupRowsState = groupRowsState;
}
