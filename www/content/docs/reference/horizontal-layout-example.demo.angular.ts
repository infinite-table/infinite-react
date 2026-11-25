import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
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
  firstName: { field: 'firstName', header: 'First Name' },
  age: { field: 'age', header: 'Age' },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div style="color: var(--infinite-cell-color); margin-bottom: 10px">
      <button (click)="wrapRowsHorizontally.set(!wrapRowsHorizontally())">
        {{ wrapRowsHorizontally() ? 'Disable' : 'Enable' }} Horizontal Layout
      </button>
    </div>
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="horizontal-layout-example"
        [wrapRowsHorizontally]="wrapRowsHorizontally()"
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

  protected readonly wrapRowsHorizontally = signal(false);
}
