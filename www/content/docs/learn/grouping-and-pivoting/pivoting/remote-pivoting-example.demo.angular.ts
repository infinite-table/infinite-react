import { Component } from '@angular/core';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
} from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumns,
  InfiniteTablePropColumnPinning,
  DataSourceData,
  DataSourcePropAggregationReducers,
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

const DATA_SOURCE_SIZE = '10k';

const dataSource: DataSourceData<Developer> = ({
  pivotBy,
  aggregationReducers,
  groupBy,

  groupKeys = [],
}) => {
  const args = [
    pivotBy
      ? 'pivotBy=' + JSON.stringify(pivotBy.map((p) => ({ field: p.field })))
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' + JSON.stringify(groupBy.map((p) => ({ field: p.field })))
      : null,
    aggregationReducers
      ? 'reducers=' +
        JSON.stringify(
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            id: key,
            name: aggregationReducers[key].reducer,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/developers${DATA_SOURCE_SIZE}-sql?` +
      args,
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
  salary: {
    // the aggregation name will be used as the column header
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

// make the row labels column (id: 'labels') be pinned
const defaultColumnPinning: InfiniteTablePropColumnPinning = {
  // make the generated group columns pinned to start
  'group-by-country': 'start',
  'group-by-stack': 'start',
};

// make all rows collapsed by default
const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const groupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'country',
    column: {
      // give the group column for the country prop a custom id
      id: 'group-by-country',
    },
  },
  {
    field: 'stack',
    column: {
      // give the group column for the stack prop a custom id
      id: 'group-by-stack',
    },
  },
];

const pivotBy: DataSourcePivotBy<Developer>[] = [
  { field: 'preferredLanguage' },
  {
    field: 'canDesign',
    // customize the column group
    columnGroup: ({ columnGroup }) => {
      return {
        ...columnGroup,
        header: `${
          columnGroup.pivotGroupKey === 'yes' ? 'Designer' : 'Non-designer'
        }`,
      };
    },
    // customize columns generated under this column group
    column: ({ column }) => ({
      ...column,
      header: `🎉 ${column.header}`,
    }),
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
      [aggregationReducers]="aggregationReducers"
      [defaultGroupRowsState]="groupRowsState"
      [lazyLoad]="true"
    >
      <infinite-table
        debugId="remote-pivoting-example"
        [defaultColumnPinning]="defaultColumnPinning"
        [columns]="columns"
        [hideEmptyGroupColumns]="true"
        [pivotColumns]="ds.pivotColumns()"
        [pivotColumnGroups]="ds.pivotColumnGroups()"
        [columnDefaultWidth]="220"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly aggregationReducers = aggregationReducers;
  protected readonly columns = columns;
  protected readonly dataSource = dataSource;
  protected readonly defaultColumnPinning = defaultColumnPinning;
  protected readonly groupBy = groupBy;
  protected readonly groupRowsState = groupRowsState;
  protected readonly pivotBy = pivotBy;
}
