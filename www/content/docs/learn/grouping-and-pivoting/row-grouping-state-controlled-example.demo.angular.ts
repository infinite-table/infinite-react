import { Component, signal } from '@angular/core';

import {
  DataSource,
  GroupRowsState,
  InfiniteTable,
} from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
  DataSourcePropGroupRowsState,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const groupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'country',
    column: {
      header: 'Country group',
      renderGroupValue: ({ value }) => `Country: ${value}`,
    },
  },
  {
    field: 'stack',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
    // specifying a style here for the column
    // note: it will also be "picked up" by the group column
    // if you're grouping by the 'country' field
    style: {
      color: 'tomato',
    },
  },
  firstName: { field: 'firstName' },
  age: { field: 'age' },
  salary: {
    field: 'salary',
    type: 'number',
  },

  canDesign: { field: 'canDesign' },
  stack: { field: 'stack' },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="expandAll()">Expand all</button>
    <button (click)="collapseAll()">Collapse all</button>
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [groupBy]="groupBy"
      [(groupRowsState)]="groupRowsState"
    >
      <infinite-table
        debugId="row-grouping-state-controlled-example"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;

  // the grid writes the state back here when the user expands or collapses a group
  protected readonly groupRowsState = signal<
    DataSourcePropGroupRowsState<string>
  >(
    new GroupRowsState<string>({
      collapsedRows: true,
      expandedRows: [['Mexico'], ['Mexico', 'backend'], ['India']],
    }),
  );

  protected expandAll() {
    const newState = new GroupRowsState<string>(this.groupRowsState());
    newState.expandAll();
    this.groupRowsState.set(newState);
  }

  protected collapseAll() {
    const newState = new GroupRowsState<string>(this.groupRowsState());
    newState.collapseAll();
    this.groupRowsState.set(newState);
  }
}
