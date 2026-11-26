// Code shown on the Angular version of the "Working with Columns" page: the
// sibling of index.snippet.tsx, with the same `#region` names. Type-checked,
// templates included, by `npm run tsc:angular`.
import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

//#region intro
export type Employee = {
  id: number;
  companyName: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  department: string;
  team: string;
  salary: number;
};

// InfiniteTableColumn is a generic type, you have to bind it to a specific data-type
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

// we're binding it here to the `Employee` type
// which means the `column.field` has to be `keyof Employee`
const columns: Record<string, InfiniteTableColumn<Employee>> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
  },
  city: {
    field: 'city',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
};
// <infinite-table [columns]="columns" />
//#endregion

declare const data: Employee[];

//#region column-order
@Component({
  selector: 'column-order-snippet',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="data">
      <infinite-table [columns]="columns" [(columnOrder)]="columnOrder" />
    </infinite-data-source>
  `,
})
export class ColumnOrderSnippet {
  protected readonly data = data;
  protected readonly columns = columns;

  // a model: the grid writes the new order back when the user reorders the columns
  protected readonly columnOrder = signal(['firstName', 'id', 'curency']);
}
//#endregion
