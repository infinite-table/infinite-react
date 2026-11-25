// Code shown on the Angular version of the "Disabled Rows" page: the sibling
// of disabled-rows.snippet.tsx, with the same `#region` names (the fences
// marked `neutral` in the page are shown from the .tsx file). Type-checked,
// templates included, by `npm run tsc:angular`.
import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type DATA_TYPE = {
  id: string;
  firstName: string;
};

declare const columns: InfiniteTablePropColumns<DATA_TYPE>;

@Component({
  selector: 'disabled-rows-snippet',
  imports: [DataSource, InfiniteTable],
  template: `
    <!-- #region intro -->
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [defaultRowDisabledState]="{
        enabledRows: true,
        disabledRows: ['id1', 'id4', 'id5'],
      }"
    >
      <infinite-table [columns]="columns" />
    </infinite-data-source>
    <!-- #endregion -->
  `,
})
export class DisabledRowsSnippet {
  protected readonly data: DATA_TYPE[] = [];
  protected readonly columns = columns;
}
