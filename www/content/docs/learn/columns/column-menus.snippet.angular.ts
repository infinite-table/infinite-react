// Code shown on the Angular version of the "Column Menus" page: the sibling
// of column-menus.snippet.tsx, for the regions that are not the same code in
// Angular. Type-checked, templates included, by `npm run tsc:angular`.
import { Component, TemplateRef, viewChild } from '@angular/core';

import { InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

//#region custom-menu-icon
@Component({
  selector: 'custom-menu-icon-snippet',
  imports: [InfiniteTable],
  template: `
    <infinite-table [columns]="columns" />

    <ng-template #globe>
      <div>🌎</div>
    </ng-template>
  `,
})
export class CustomMenuIconSnippet {
  private readonly globeTemplate =
    viewChild.required<TemplateRef<unknown>>('globe');

  protected readonly columns: InfiniteTablePropColumns<Developer> = {
    name: {
      field: 'firstName',
      renderMenuIcon: () => this.globeTemplate(), // #highlight
    },
    salary: {
      field: 'salary',
      renderMenuIcon: false,
    },
  };
}
//#endregion
