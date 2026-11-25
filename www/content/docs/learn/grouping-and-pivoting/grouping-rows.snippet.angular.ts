// Code shown on the Angular version of the "Grouping rows" page: the sibling
// of grouping-rows.snippet.tsx, with the same `#region` names. Type-checked,
// templates included, by `npm run tsc:angular`.
//
// The regions that are the same code in React and Angular are shown from the
// .tsx file (the fences marked `neutral` in the page).
import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

declare const data: Person[];
declare const columns: InfiniteTablePropColumns<Person>;

//#region intro
type Person = {
  name: string;
  age: number;
  country: string;
  id: string;
};

const groupBy: DataSourcePropGroupBy<Person> = [{ field: 'country' }];

@Component({
  selector: 'people-grid',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="data" [groupBy]="groupBy">
      <infinite-table [columns]="columns" />
    </infinite-data-source>
  `,
})
export class PeopleGrid {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
}
//#endregion

type Developer = {
  id: number;
  firstName: string;
  companyName: string;
  country: string;
  city: string;
  stack: string;
  age: number;
  salary: number;
};

export function groupByColumnRenderValue() {
  //#region group-by-column-render-value
  const groupBy: DataSourcePropGroupBy<Person> = [
    {
      field: 'country',
      column: {
        renderValue: ({ value }) => `Country: ${value}`, // #highlight
      },
    },
  ];
  //#endregion
  return groupBy;
}

export function multipleGroupColumns() {
  //#region multiple-groups-columns
  const groupBy: DataSourcePropGroupBy<Developer> = [
    {
      field: 'age',
      column: {
        defaultWidth: 100,
        renderValue: ({ value }) => `Age: ${value}`,
      },
    },
    {
      field: 'companyName',
    },
    {
      field: 'country',
    },
  ];
  //#endregion
  return groupBy;
}
