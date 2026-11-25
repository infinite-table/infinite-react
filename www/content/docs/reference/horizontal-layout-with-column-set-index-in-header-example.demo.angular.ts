import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  InfiniteTableColumn,
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

const getColumnHeaderFor = (
  label: string,
): InfiniteTableColumn<Developer>['header'] => {
  return ({
    horizontalLayoutPageIndex,
  }: {
    horizontalLayoutPageIndex: number | null;
  }) => {
    return `${label}${
      horizontalLayoutPageIndex != null
        ? `(${horizontalLayoutPageIndex + 1})`
        : ''
    }`;
  };
};
const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    defaultWidth: 80,
    header: getColumnHeaderFor('ID'),
  },
  firstName: { field: 'firstName', header: getColumnHeaderFor('Name') },
  age: { field: 'age', header: getColumnHeaderFor('Age') },
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
        debugId="horizontal-layout-with-column-set-index-in-header-example"
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

  protected readonly wrapRowsHorizontally = signal(true);
}
