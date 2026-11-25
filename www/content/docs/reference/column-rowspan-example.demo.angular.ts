import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceGroupBy,
  InfiniteTableGroupColumnBase,
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
  },
  stack: { field: 'stack' },
  country: { field: 'country' },
  canDesign: { field: 'canDesign' },
  hobby: { field: 'hobby' },

  city: {
    field: 'city',
  },
  age: { field: 'age' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  currency: { field: 'currency' },
};

const defaultGroupBy: DataSourceGroupBy<Developer>[] = [
  { field: 'stack' },
  { field: 'preferredLanguage' },
  {
    field: 'country',
    column: {
      rowspan: ({ rowInfo }) => {
        const rowspan =
          rowInfo.isGroupRow && rowInfo.groupNesting === 3 && !rowInfo.collapsed
            ? (rowInfo.deepRowInfoArray?.length || 0) + 1
            : 1;

        return rowspan;
      },
    } as InfiniteTableGroupColumnBase<Developer>,
  },
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
        debugId="column-rowspan-example"
        [columns]="columns"
        [columnDefaultWidth]="250"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly defaultGroupBy = defaultGroupBy;
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};
