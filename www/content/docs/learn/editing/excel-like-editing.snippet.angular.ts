// Code shown on the Angular version of excel-like-editing.page.md: the
// sibling of excel-like-editing.snippet.tsx, with the same `#region` names
// (the `simulating-formulas-with-column-valuegetter` region is the same code
// for every framework, so the page shows it from the .tsx file).
// Type-checked, templates included, by `npm run tsc:angular`.
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

declare const dataSource: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

//#region intro
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
        [keyboardShortcuts]="[keyboardShortcuts.instantEdit]"
      />
    </infinite-data-source>
  `,
})
export class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly keyboardShortcuts = keyboardShortcuts; // #highlight
}
//#endregion
