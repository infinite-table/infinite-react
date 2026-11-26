// Code shown on the Angular version of the "Row Selection" page: the sibling
// of row-selection.snippet.tsx, with the same `#region` names. Type-checked,
// templates included, by `npm run tsc:angular`.
//
// The regions that are the same code in every framework are shown from the
// .tsx file (the fences marked `neutral` in the page).
import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropFilterFunction,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  preferredLanguage: string;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;
declare const columnsWithACheckboxColumn: InfiniteTablePropColumns<Developer>;

@Component({
  selector: 'row-selection-snippets',
  imports: [DataSource, InfiniteTable],
  template: `
    <!-- #region configure-the-selection-mode-on-the-datasource -->
    <infinite-data-source primaryKey="id" [data]="data" selectionMode="single-row" />

    <!-- can be "single-row", "multi-row", "multi-cell" or false -->
    <!-- #endregion -->

    <!-- #region single-row-selection -->
    <!-- #highlight -->
    <infinite-data-source primaryKey="id" [data]="data" [defaultRowSelection]="4">
      <infinite-table [columns]="columns" />
    </infinite-data-source>
    <!-- #endregion -->

    <!-- #region choosing-how-users-select-rows -->
    <infinite-data-source selectionMode="multi-row" primaryKey="id" [data]="data">
      <!-- #highlight -->
      <infinite-table multiRowSelectionWith="click" [columns]="columnsWithACheckboxColumn" />
    </infinite-data-source>
    <!-- #endregion -->

    <infinite-data-source
      primaryKey="id"
      [data]="data"
      selectionMode="multi-row"
      multiRowSelectionTarget="visible"
      [filterFunction]="filterFunction"
    />
  `,
})
export class RowSelectionSnippets {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly columnsWithACheckboxColumn = columnsWithACheckboxColumn;

  //#region selecting-all-rows-when-the-data-is-filtered
  // <infinite-data-source
  //   primaryKey="id"
  //   [data]="data"
  //   selectionMode="multi-row"
  //   multiRowSelectionTarget="visible" // #highlight
  //   [filterFunction]="filterFunction"
  // />
  protected readonly filterFunction: DataSourcePropFilterFunction<Developer> =
    ({ data }) => data.preferredLanguage === 'TypeScript';
  //#endregion
}
