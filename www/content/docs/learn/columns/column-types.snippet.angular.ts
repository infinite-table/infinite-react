// Code shown on the Angular version of the "Column Types" page: the sibling of
// column-types.snippet.tsx, with the same `#region` names (the regions that
// are the same code for every framework are shown from the .tsx file).
// Type-checked, templates included, by `npm run tsc:angular`.
import { Component } from '@angular/core';

import { InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumns,
  InfiniteTablePropColumnTypes,
} from '@infinite-table/infinite-angular';

//#region intro
type Person = {
  name: string;
  dob: string;
  age: number;
};
const columns: InfiniteTablePropColumns<Person> = {
  age: {
    field: 'age',
    type: 'custom',
  },
  date: {
    field: 'dob',
    // will be type default
  },
  name: {
    field: 'name',
    // will have both of those types
    type: ['default', 'custom'],
  },
};

const columnTypes: InfiniteTablePropColumnTypes<Person> = {
  default: {
    defaultWidth: 200,
  },
  custom: {
    align: 'center',
  },
};

// <infinite-table [columnTypes]="columnTypes" [columns]="columns" />
//#endregion

@Component({
  selector: 'column-types-snippet',
  imports: [InfiniteTable],
  template: `
    <infinite-table [columnTypes]="columnTypes" [columns]="columns" />
  `,
})
export class ColumnTypesSnippet {
  protected readonly columns = columns;
  protected readonly columnTypes = columnTypes;
}
