// Code shown on the Angular version of updating-data-in-realtime.page.md: the
// sibling of updating-data-in-realtime.snippet.tsx, with the same `#region`
// names (the regions that are the same code for every framework are shown
// from the .tsx file). Type-checked, templates included, by
// `npm run tsc:angular`.
import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceApi,
  InfiniteTableApi,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  name: string;
  age: number;
  salary: number;
  stack: string;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

//#region getting-a-reference-to-the-datasource-api
@Component({
  selector: 'developers',
  imports: [DataSource],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      (ready)="onReady($event)"
    />
  `,
})
export class Developers {
  protected readonly data = data;

  protected onReady(dataSourceApi: DataSourceApi<Developer>) {
    // do something with the dataSourceApi
  }
}
//#endregion

//#region infinite-table-on-ready
@Component({
  selector: 'developers-grid',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="data">
      <infinite-table [columns]="columns" (ready)="onReady($event)" />
    </infinite-data-source>
  `,
})
export class DevelopersGrid {
  protected readonly data = data;
  protected readonly columns = columns;

  protected onReady({
    api,
    dataSourceApi,
  }: {
    api: InfiniteTableApi<Developer>;
    dataSourceApi: DataSourceApi<Developer>;
  }) {
    // note for the InfiniteTable (ready) output, you get back an object
    // with both the InfiniteTable API (the `api` property)
    // and the DataSource API (the `dataSourceApi` property)
  }
}
//#endregion
