import { Component, ElementRef, viewChild } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
};

const data: Developer[] = [
  { id: 1, firstName: 'John', lastName: 'Bob', age: 20 },
  { id: 2, firstName: 'Marry', lastName: 'Bob', age: 25 },
  { id: 3, firstName: 'Bill', lastName: 'Bobson', age: 30 },
];

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
  lastName: { field: 'lastName' },
  age: { field: 'age', type: 'number' },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div
      #app
      style="
        display: flex;
        flex-direction: column;
        height: 100%;
        color: var(--infinite-cell-color);
      "
    >
      <p style="padding: 10px">
        The table sits in a short pane that clips its content. Open a column
        menu - it is rendered into document.body and kept within this app.
      </p>
      <div style="height: 360px; overflow: hidden">
        <infinite-data-source [data]="data" primaryKey="id">
          <infinite-table
            [columns]="columns"
            [menuPortalContainer]="menuPortalContainer"
            [menuConstrainTo]="menuConstrainTo"
          />
        </infinite-data-source>
      </div>
    </div>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;

  private readonly app = viewChild.required<ElementRef<HTMLElement>>('app');

  protected readonly menuPortalContainer = document.body;
  protected readonly menuConstrainTo = () => this.app().nativeElement;
}
