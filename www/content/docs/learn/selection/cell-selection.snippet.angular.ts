// Code shown on the Angular version of the "Cell Selection" page: the sibling
// of cell-selection.snippet.tsx, with the same `#region` names. Type-checked,
// templates included, by `npm run tsc:angular`.
//
// The regions that are the same code in every framework are shown from the
// .tsx file (the fences marked `neutral` in the page).
import { Component } from '@angular/core';

import { DataSource } from '@infinite-table/infinite-angular';
import type { DataSourcePropCellSelection_MultiCell } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  stack: string;
};

declare const data: Developer[];

@Component({
  selector: 'cell-selection-snippets',
  imports: [DataSource],
  template: `
    <!-- #region configuring-the-selection-mode -->
    <infinite-data-source primaryKey="id" [data]="data" selectionMode="multi-cell" />

    <!-- can be "single-row", "multi-row", "multi-cell" or false -->
    <!-- #endregion -->

    <infinite-data-source
      primaryKey="id"
      [data]="data"
      selectionMode="multi-cell"
      [defaultCellSelection]="defaultCellSelection"
    />
  `,
})
export class CellSelectionSnippets {
  protected readonly data = data;

  //#region using-default-selection
  // <infinite-data-source
  //   primaryKey="id"
  //   [data]="data"
  //   selectionMode="multi-cell"
  //   [defaultCellSelection]="defaultCellSelection"
  // />
  protected readonly defaultCellSelection: DataSourcePropCellSelection_MultiCell =
    {
      defaultSelection: false,
      selectedCells: [
        [3, 'stack'], // rowId + colId
        [5, 'stack'], // rowId + colId
        [0, 'firstName'], // rowId + colId
      ],
    };
  //#endregion
}
