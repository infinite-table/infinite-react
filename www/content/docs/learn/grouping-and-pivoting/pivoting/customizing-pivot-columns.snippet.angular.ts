// Code shown on the Angular version of the "Customizing Pivot Columns" page:
// the sibling of customizing-pivot-columns.snippet.tsx, with the same
// `#region` names. The regions that are the same code for React and Angular
// are not repeated here: their fences are marked `neutral` in the page.
// Type-checked, templates included, by `npm run tsc:angular`.
import { Component } from '@angular/core';

import {
  InfiniteTable,
  type InfiniteTablePropColumns,
  type InfiniteTableProps,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  preferredLanguage: string;
  canDesign: 'yes' | 'no';
  license: string;
  age: number;
  salary: number;
};

declare const columns: InfiniteTablePropColumns<Developer>;

@Component({
  selector: 'pivot-column-snippets',
  imports: [InfiniteTable],
  template: `
    <!-- #region global-the-pivotcolumn-prop -->
    <infinite-table
      [columns]="columns"
      [pivotColumn]="{
        defaultSortable: true,
        defaultWidth: 180,
      }"
    />
    <!-- #endregion -->

    <infinite-table [columns]="columns" [pivotColumn]="pivotColumn" />
  `,
})
export class PivotColumnSnippets {
  protected readonly columns = columns;

  //#region pivot-column-function
  // <infinite-table [columns]="columns" [pivotColumn]="pivotColumn" />
  protected readonly pivotColumn: InfiniteTableProps<Developer>['pivotColumn'] =
    ({ column }) => ({
      defaultSortable: !column.pivotTotalColumn,
    });
  //#endregion
}
