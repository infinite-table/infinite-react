import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { data } from './people';

const columns: Record<string, any> = {
  name: {
    field: 'name',
  },
  department: {
    field: 'department',
    style: {
      color: 'red',
    },
  },

  team: {
    field: 'team',
  },
};
const distinct = {
  name: 'distinct',

  initialValue: () => new Set(),
  reducer: (acc: Set<string>, value: string) => {
    acc.add(value);
    return acc;
  },
  done: (acc: Set<string>) => {
    return acc.size;
  },
};
const columnAggregations = {
  distinctTeams: {
    field: 'team' as const,
    ...distinct,
  },
  distinctDepartment: {
    field: 'department' as const,
    ...distinct,
  },
};

const groupBy = [
  {
    field: 'department' as const,
  },
  { field: 'team' as const },
];

const slicedData = data.slice(0, 5);

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="slicedData"
      primaryKey="id"
      [groupBy]="groupBy"
      [aggregationReducers]="columnAggregations"
    >
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="250"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class GroupByAndAggregationsPage {
  protected readonly columns = columns;
  protected readonly columnAggregations = columnAggregations;
  protected readonly groupBy = groupBy;
  protected readonly slicedData = slicedData;
  protected readonly domProps = domProps;
}
