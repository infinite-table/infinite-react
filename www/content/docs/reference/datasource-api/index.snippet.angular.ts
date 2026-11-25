// Code shown on the Angular version of index.page.md: the sibling of
// index.snippet.tsx, with the same `#region` names (the regions that are the
// same code for every framework are shown from the .tsx file). Type-checked,
// templates included, by `npm run tsc:angular`.
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
};

// the page calls the type of the rows `DATA_TYPE`
type DATA_TYPE = Developer;

declare const data: DATA_TYPE[];
declare const columns: InfiniteTablePropColumns<DATA_TYPE>;

//#region intro
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

  protected onReady(api: DataSourceApi<DATA_TYPE>) {
    // api is accessible here // #highlight
    // you may want to store it in a field of your component, to use it later
  }
}
//#endregion

//#region intro-infinitetable-onready
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
    api, // #highlight
    dataSourceApi, // #highlight
  }: {
    api: InfiniteTableApi<DATA_TYPE>;
    dataSourceApi: DataSourceApi<DATA_TYPE>;
  }) {
    // both api and dataSourceApi are accessible here
  }
}
//#endregion
