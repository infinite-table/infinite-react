import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { carsales, columns, rowHeightDomProps } from './common';

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    Current row height: {{ rowHeight() }}
    <br />
    Press buttons below to increment/decrement row height by 10
    <div style="display: flex; flex-flow: row">
      <button data-name="up" (click)="rowHeight.set(rowHeight() + 10)">
        UP
      </button>
      <button data-name="down" (click)="rowHeight.set(rowHeight() - 10)">
        DOWN
      </button>
    </div>
    <infinite-data-source [data]="carsales" primaryKey="id">
      <infinite-table
        [domProps]="rowHeightDomProps"
        [rowHeight]="rowHeight()"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class RowHeightBasicPage {
  protected readonly carsales = carsales;
  protected readonly columns = columns;
  protected readonly rowHeightDomProps = rowHeightDomProps;

  protected readonly rowHeight = signal(40);
}
