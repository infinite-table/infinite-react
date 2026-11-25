// Code shown on the Angular version of index.page.md: the sibling of
// index.filterfunction.snippet.tsx, with the same `#region` name.
// Type-checked, templates included, by `npm run tsc:angular`.
import { Component } from '@angular/core';
import { DataSource } from '@infinite-table/infinite-angular';
import type { DataSourcePropFilterFunction } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  name: string;
  age: number;
};

declare const data: Developer[];

//#region filterfunction
import { defaultFilterFunction } from '@infinite-table/infinite-angular';

// the built-in column filtering
// <infinite-data-source [filterFunction]="defaultFilterFunction" />

// your own logic only
const olderThan30: DataSourcePropFilterFunction<Developer> = (param) =>
  param.data.age > 30;
// <infinite-data-source [filterFunction]="olderThan30" />

// the column filters, and your own condition
const filteredAndOlderThan30: DataSourcePropFilterFunction<Developer> = (
  param,
) => defaultFilterFunction(param) && param.data.age > 30;
// <infinite-data-source [filterFunction]="filteredAndOlderThan30" />
//#endregion

@Component({
  selector: 'filter-function-snippet',
  imports: [DataSource],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [filterFunction]="defaultFilterFunction"
    />
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [filterFunction]="olderThan30"
    />
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [filterFunction]="filteredAndOlderThan30"
    />
  `,
})
export class FilterFunctionSnippet {
  protected readonly data = data;
  protected readonly defaultFilterFunction = defaultFilterFunction;
  protected readonly olderThan30 = olderThan30;
  protected readonly filteredAndOlderThan30 = filteredAndOlderThan30;
}
