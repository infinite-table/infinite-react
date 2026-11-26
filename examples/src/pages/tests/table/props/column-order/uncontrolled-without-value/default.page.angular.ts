import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { columns } from '../columns';
import { rowData } from '../rowData';

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const fields = ['id', 'make', 'model', 'price'];

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="hideIdAndMake()">hide id and make columns</button>
    <infinite-data-source primaryKey="id" [data]="rowData" [fields]="fields">
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="140"
        [columnMinWidth]="50"
        [columns]="cols()"
      />
    </infinite-data-source>
  `,
})
export default class UncontrolledWithoutValuePage {
  protected readonly rowData = rowData;
  protected readonly domProps = domProps;
  protected readonly fields = fields as any;

  protected readonly cols = signal(columns);

  protected hideIdAndMake() {
    const newCols = {
      ...columns,
    };
    //@ts-ignore
    delete newCols.id;
    //@ts-ignore
    delete newCols.make;
    this.cols.set(newCols);
  }
}
