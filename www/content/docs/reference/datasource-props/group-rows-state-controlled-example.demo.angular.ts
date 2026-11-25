import { Component, signal } from '@angular/core';

import {
  DataSource,
  GroupRowsState,
  InfiniteTable,
} from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
  DataSourcePropGroupRowsStateObject,
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
  },
  {
    field: 'stack',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
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
    <button
      (click)="
        groupRowsState.set({
          expandedRows: true,
          collapsedRows: [],
        })
      "
    >
      Expand all
    </button>
    <button
      (click)="
        groupRowsState.set({
          expandedRows: [],
          collapsedRows: true,
        })
      "
    >
      Collapse all
    </button>
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [groupBy]="groupBy"
      [groupRowsState]="groupRowsState()"
      (groupRowsStateChange)="onGroupRowsStateChange($event)"
    >
      <infinite-table
        debugId="group-rows-state-controlled-example"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;

  // #highlight controlled: the grid gets the state from this signal
  protected readonly groupRowsState = signal<
    DataSourcePropGroupRowsStateObject<string>
  >({
    collapsedRows: true,
    expandedRows: [['Mexico'], ['Mexico', 'backend'], ['India']],
  });

  // the grid emits a GroupRowsState instance: store its plain object
  protected onGroupRowsStateChange(
    groupRowsState:
      | GroupRowsState<string>
      | DataSourcePropGroupRowsStateObject<string>
      | undefined,
  ) {
    if (groupRowsState instanceof GroupRowsState) {
      this.groupRowsState.set(groupRowsState.getState());
    } else if (groupRowsState) {
      this.groupRowsState.set(groupRowsState);
    }
  }
  // #endhighlight
}
