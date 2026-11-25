import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceGroupBy,
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumns,
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

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: {
    field: 'preferredLanguage',
    // hide whenever grouped by preferredLanguage
    defaultHiddenWhenGroupedBy: 'preferredLanguage',
  },
  stack: { field: 'stack' },
  country: { field: 'country' },
  canDesign: { field: 'canDesign' },
  hobby: { field: 'hobby' },

  city: {
    field: 'city',
    // hide whenever grouped by country or city
    defaultHiddenWhenGroupedBy: {
      country: true,
      city: true,
    },
  },
  age: { field: 'age' },
  salary: {
    field: 'salary',
    type: 'number',
    // hide whenever there is grouping
    defaultHiddenWhenGroupedBy: '*',
  },
  currency: { field: 'currency' },
};

const columnSizing: InfiniteTablePropColumnSizing = {
  country: { width: 100 },
  city: { flex: 1, minWidth: 100 },
  salary: { flex: 2, maxWidth: 500 },
};

const defaultGroupBy: DataSourceGroupBy<Developer>[] = [
  { field: 'stack' },
  { field: 'preferredLanguage' },
  { field: 'country' },
];

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="dataSource"
      [defaultGroupBy]="defaultGroupBy"
      primaryKey="id"
    >
      <infinite-table
        debugId="columnDefaultHiddenWhenGroupedBy-example"
        [columns]="columns"
        [columnDefaultWidth]="250"
        [columnSizing]="columnSizing"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly columnSizing = columnSizing;
  protected readonly defaultGroupBy = defaultGroupBy;
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};
