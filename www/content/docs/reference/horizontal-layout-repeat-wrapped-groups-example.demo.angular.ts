import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  DataSourcePropGroupBy,
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

const dataSource: DataSourceData<Developer> = () => {
  return fetch(
    'https://infinite-table.com/.netlify/functions/json-server' +
      `/developers1k-sql?`,
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', header: 'ID', defaultWidth: 50 },

  country: { field: 'country', header: 'Country' },
  city: { field: 'city', header: 'City' },
  firstName: { field: 'firstName', header: 'First Name' },
  separator: {
    valueGetter: () => null,
    resizable: false,
    defaultWidth: 10,
    style: {
      background: 'var(--infinite-background)',
    },
  },
};

const defaultGroupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'country',
  },
  {
    field: 'city',
  },
];

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div style="color: var(--infinite-cell-color); margin-bottom: 10px">
      <button (click)="repeatWrappedGroupRows.set(!repeatWrappedGroupRows())">
        {{ repeatWrappedGroupRows() ? 'Disable' : 'Enable' }} Repeat Wrapped
        Group Rows
      </button>
    </div>
    <infinite-data-source
      primaryKey="id"
      [data]="dataSource"
      [defaultGroupBy]="defaultGroupBy"
    >
      <infinite-table
        debugId="horizontal-layout-repeat-wrapped-groups-example"
        [wrapRowsHorizontally]="true"
        [repeatWrappedGroupRows]="repeatWrappedGroupRows()"
        [columns]="columns"
        [columnDefaultWidth]="100"
        [columnDefaultSortable]="false"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly defaultGroupBy = defaultGroupBy;

  protected readonly repeatWrappedGroupRows = signal(false);
}
