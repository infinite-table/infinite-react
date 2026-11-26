import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTableColumn,
  InfiniteTablePropColumnVisibility,
} from '@infinite-table/infinite-angular';

import { rowData, Car } from '../rowData';
import { columns } from '../columns';

const groupColumn: InfiniteTableColumn<Car> = {
  header: 'Grouping',
  field: 'make',
};

const groupBy = [
  {
    field: 'make' as const,
  },
];

const defaultColumnPinning = {
  'group-by': true as const,
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="hideAll()">hide all</button>
    <button (click)="showAll()">show all</button>
    <infinite-data-source primaryKey="id" [data]="rowData" [groupBy]="groupBy">
      <infinite-table
        [domProps]="domProps"
        [defaultColumnPinning]="defaultColumnPinning"
        [columnVisibility]="columnVisibility()"
        (columnVisibilityChange)="onColumnVisibilityChange($event!)"
        groupRenderStrategy="single-column"
        [columns]="columns"
        [groupColumn]="groupColumn"
      />
    </infinite-data-source>
  `,
})
export default class ColumnVisibilityWithGroupingPage {
  protected readonly rowData = rowData;
  protected readonly columns = columns;
  protected readonly groupColumn = groupColumn;
  protected readonly groupBy = groupBy;
  protected readonly defaultColumnPinning = defaultColumnPinning;
  protected readonly domProps = domProps;

  protected readonly columnVisibility =
    signal<InfiniteTablePropColumnVisibility>({});

  protected hideAll() {
    this.columnVisibility.set({
      id: false,
      make: false,
      model: false,
      price: false,
      year: false,
      'group-by': false,
    });
  }

  protected showAll() {
    this.columnVisibility.set({});
  }

  protected onColumnVisibilityChange(
    visibility: InfiniteTablePropColumnVisibility,
  ) {
    this.columnVisibility.set(visibility);
  }
}
