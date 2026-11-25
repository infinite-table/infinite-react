import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTableApi,
  InfiniteTablePropColumnOrder,
} from '@infinite-table/infinite-angular';

import { rowData, Car } from './rowData';
import { columns } from './columns';

(globalThis as any).calls = [];
const onColumnOrderChange = (
  columnOrder: InfiniteTablePropColumnOrder | undefined,
) => {
  (globalThis as any).calls.push(columnOrder);
};

const onReady = ({ api }: { api: InfiniteTableApi<Car> }) => {
  (globalThis as any).api = api;
};

const fields: (keyof Car)[] = ['id', 'make', 'model', 'price'];

const domProps = {
  style: {
    margin: '5px',
    // height: '80vh',
    height: '350px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    current height {{ height() }}
    <button (click)="height.set(height() - 40)">height -= 40</button>
    <infinite-data-source primaryKey="id" [data]="rowData" [fields]="fields">
      <infinite-table
        [domProps]="domProps"
        [header]="true"
        [virtualizeColumns]="true"
        (columnOrderChange)="onColumnOrderChange($event)"
        (ready)="onReady($event)"
        [columnDefaultWidth]="140"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class VirtualizationRangePage {
  protected readonly rowData = rowData;
  protected readonly columns = columns;
  protected readonly fields = fields;
  protected readonly domProps = domProps;
  protected readonly onColumnOrderChange = onColumnOrderChange;
  protected readonly onReady = onReady;

  protected readonly height = signal(350);
}
