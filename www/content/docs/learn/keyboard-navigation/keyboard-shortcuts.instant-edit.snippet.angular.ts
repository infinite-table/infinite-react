// Code shown on the Angular version of keyboard-shortcuts.page.md: the
// sibling of keyboard-shortcuts.instant-edit.snippet.tsx, with the same
// `#region` name. Type-checked, templates included, by `npm run tsc:angular`.
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
};

declare const dataSource: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

//#region instant-edit
import { Component } from '@angular/core';
import {
  DataSource,
  InfiniteTable,
  keyboardShortcuts, // #highlight
} from '@infinite-table/infinite-angular';

@Component({
  selector: 'instant-edit-grid',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table [columns]="columns" [keyboardShortcuts]="keyboardShortcuts" />
    </infinite-data-source>
  `,
})
export class InstantEditGrid {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly keyboardShortcuts = [keyboardShortcuts.instantEdit]; // #highlight
}
//#endregion
