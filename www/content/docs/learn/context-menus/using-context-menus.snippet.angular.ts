// Code shown on the Angular version of the "Using Context Menus" page: the
// sibling of using-context-menus.snippet.tsx, for the region that is not the
// same code in Angular (the fences marked `neutral` in the page are shown from
// the .tsx file). Type-checked, templates included, by `npm run tsc:angular`.
import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumns,
  InfiniteTablePropGetCellContextMenuItems,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  age: number;
  currency: string;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

//#region intro
const getCellContextMenuItems: InfiniteTablePropGetCellContextMenuItems<
  Developer
> = ({ column, value }) => {
  if (column.id === 'currency') {
    return [
      {
        label: `Convert ${value}`,
        key: 'currency-convert',
      },
    ];
  }

  if (column.id === 'age') {
    return null;
  }

  return [
    {
      label: `Welcome ${value}`,
      key: 'hi',
    },
  ];
};

// <infinite-data-source [data]="data" primaryKey="id">
//   <infinite-table
//     [getCellContextMenuItems]="getCellContextMenuItems"
//     [columns]="columns"
//   />
// </infinite-data-source>
//#endregion

@Component({
  selector: 'context-menu-snippet',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table
        [getCellContextMenuItems]="getCellContextMenuItems"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export class ContextMenuSnippet {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly getCellContextMenuItems = getCellContextMenuItems;
}
