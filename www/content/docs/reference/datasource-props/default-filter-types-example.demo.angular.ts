import { Component } from '@angular/core';

import {
  InfiniteTable,
  DataSource,
  defaultFilterTypes,
} from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
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

defaultFilterTypes.string.operators.push({
  name: 'Not includes',
  label: 'Not Includes',
  fn: ({ currentValue, filterValue }) => {
    return (
      typeof currentValue === 'string' &&
      typeof filterValue == 'string' &&
      !currentValue.toLowerCase().includes(filterValue.toLowerCase())
    );
  },
});

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
    field: 'salary',
    type: 'number',
  },

  firstName: {
    field: 'firstName',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency', defaultFilterable: false },
};

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
      [defaultFilterValue]="[]"
      [filterDelay]="0"
    >
      <infinite-table
        debugId="default-filter-types-example"
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
}
