// Code shown on the Angular version of infinite-table-props.page.md: the
// sibling of infinite-table-props.keyboardshortcuts.snippet.tsx, with the same
// `#region` name. Type-checked, templates included, by `npm run tsc:angular`.
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
};

declare const dataSource: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

//#region keyboardshortcuts
import { Component } from '@angular/core';
import {
  DataSource,
  InfiniteTable,
  keyboardShortcuts, // #highlight
} from '@infinite-table/infinite-angular';

@Component({
  selector: 'app-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        [columns]="columns"
        [keyboardShortcuts]="keyboardShortcuts"
      />
    </infinite-data-source>
  `,
})
export class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly keyboardShortcuts = [
    keyboardShortcuts.instantEdit, // #highlight
  ];
}
//#endregion
