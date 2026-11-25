import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { rowData } from '../rowData';
import { columns } from '../columns';

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
    <infinite-data-source primaryKey="id" [data]="rowData" [fields]="fields">
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="140"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ColumnVisibilityUncontrolledWithoutValuePage {
  protected readonly rowData = rowData;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly fields = fields as any;
}
