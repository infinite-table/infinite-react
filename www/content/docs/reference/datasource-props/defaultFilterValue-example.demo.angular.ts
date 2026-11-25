import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  DataSourceProps,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

const data: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
  },
  salary: {
    defaultFilterable: true,
    field: 'salary',
    type: 'number',
  },

  firstName: {
    field: 'firstName',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency' },
};

const domProps = {
  style: {
    height: '100%',
  },
};

const defaultFilterValue: DataSourceProps<Developer>['filterValue'] = [
  {
    field: 'salary',
    filter: {
      operator: 'gt',
      value: 50000,
      type: 'number',
    },
  },
];

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <p style="color: var(--infinite-cell-color)">
      By default, only showing records with salary &gt; 50000
    </p>
    <infinite-data-source
      [data]="data"
      primaryKey="id"
      [defaultFilterValue]="defaultFilterValue"
      [filterDelay]="0"
    >
      <infinite-table
        debugId="defaultFilterValue-example"
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly domProps = domProps;
  protected readonly columns = columns;
  protected readonly defaultFilterValue = defaultFilterValue;
}
