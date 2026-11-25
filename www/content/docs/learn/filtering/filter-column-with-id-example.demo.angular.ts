import { Component } from '@angular/core';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  DataSourcePropFilterValue,
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
    defaultWidth: 70,
    defaultFilterable: false,
  },

  salary: {
    // we're intentionally using not binding this column to a `field`
    type: 'number',
    header: 'Salary',
    valueGetter: ({ data }) => data.salary,
  },

  firstName: {
    field: 'firstName',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency' },
};

const defaultFilterValue: DataSourcePropFilterValue<Developer> = [
  // if you want the salary column to be filtered by default
  // you need to pass a valueGetter to the filter value
  // if you don't need a default filter, when you start filtering by
  // the column, the filter value will use the valueGetter of the column
  {
    id: 'salary',
    valueGetter: ({ data }) => data.salary,
    filter: {
      operator: 'gt',
      value: '',
      type: 'number',
    },
  },
];

const domProps = {
  style: {
    height: '100%',
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="data"
      primaryKey="id"
      [defaultFilterValue]="defaultFilterValue"
      [filterDelay]="0"
    >
      <infinite-table
        debugId="filter-column-with-id-example"
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
  protected readonly defaultFilterValue = defaultFilterValue;
  protected readonly domProps = domProps;
  protected readonly columns = columns;
}
