// Code shown on the Angular version of index.page.md: the sibling of
// index.snippet.tsx, with the same `#region` names (the filter type one is
// shown from index.snippet.tsx on every framework). Type-checked, templates
// included, by `npm run tsc:angular`.
import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropFilterValue,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  age: number;
  salary: number;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

@Component({
  selector: 'filtering-snippets',
  imports: [DataSource, InfiniteTable],
  template: `
    <!-- #region specifying-an-initial-filter-value-for-the -->
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [defaultFilterValue]="[
        {
          field: 'age',
          filter: {
            operator: 'gt',
            value: 30,
            type: 'number',
          },
        },
      ]"
    >
      <infinite-table [columns]="columns" />
    </infinite-data-source>
    <!-- #endregion -->

    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [defaultFilterValue]="defaultFilterValue"
    />
  `,
})
export class FilteringSnippets {
  protected readonly data = data;
  protected readonly columns = columns;

  //#region filtering-columns-not-bound-to-a-field
  // <infinite-data-source [defaultFilterValue]="defaultFilterValue" />
  protected readonly defaultFilterValue: DataSourcePropFilterValue<Developer> =
    [
      {
        id: 'salary',
        valueGetter: ({ data }) => data.salary,
        filter: {
          operator: 'gt',
          value: '',
          type: 'number',
        },
      },
    ];
  //#endregion
}
