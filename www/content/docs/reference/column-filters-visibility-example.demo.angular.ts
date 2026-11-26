import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
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

const defaultFilterValue: DataSourcePropFilterValue<Developer> = [];

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div style="padding-block: 10px">
      <button (click)="showColumnFilters.set(!showColumnFilters())">
        Toggle visibility of column filters
      </button>
    </div>
    <infinite-data-source
      [data]="data"
      primaryKey="id"
      [defaultFilterValue]="defaultFilterValue"
      [filterDelay]="0"
    >
      <infinite-table
        debugId="column-filters-visibility-example"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [columns]="columns"
        [showColumnFilters]="showColumnFilters()"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly defaultFilterValue = defaultFilterValue;

  protected readonly showColumnFilters = signal(true);
}
