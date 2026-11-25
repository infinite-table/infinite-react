import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumnOrder } from '@infinite-table/infinite-angular';

import { rowData } from './rowData';
import { columns } from './columns';

const defaultColumnOrder = ['id', 'make', 'year', 'price'];

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    width: '50vw',
    border: '1px solid rgb(194 194 194 / 45%)',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div>
      <button (click)="toggleColumns()">TOGGLE COLUMNS</button>
    </div>
    <infinite-data-source primaryKey="id" [data]="rowData">
      <infinite-table
        [domProps]="domProps"
        [columnOrder]="columnOrder()"
        [columnDefaultWidth]="250"
        [columnMinWidth]="150"
        [columns]="columns"
        (columnOrderChange)="onColumnOrderChange($event!)"
      />
    </infinite-data-source>
  `,
})
export default class ToggleColumnsPage {
  protected readonly rowData = rowData;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  protected readonly columnOrder =
    signal<InfiniteTablePropColumnOrder>(defaultColumnOrder);

  protected toggleColumns() {
    const columnOrder = this.columnOrder();
    if (Array.isArray(columnOrder) && columnOrder.length > 2) {
      this.columnOrder.set(['id', 'make']);
    } else {
      this.columnOrder.set(['id', 'make', 'year', 'price']);
    }
  }

  protected onColumnOrderChange(order: InfiniteTablePropColumnOrder) {
    this.columnOrder.set(order);
  }
}
