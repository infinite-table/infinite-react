import { Component, OnInit, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

import {
  COLUMN_WIDTH,
  makeRows,
  ROW_HEIGHT,
  VERTICAL_ROW_COUNT,
} from './largeContentData';
import type { LargeContentRow } from './largeContentData';

const columns: InfiniteTablePropColumns<LargeContentRow> = {
  id: { field: 'id', type: 'number' },
  name: { field: 'name' },
  value: { field: 'value', type: 'number' },
  code: { field: 'code' },
  group: { field: 'group' },
};

const domProps = { style: { height: '600px', width: '800px' } };

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="data()">
      <infinite-table
        [columns]="columns"
        [rowHeight]="ROW_HEIGHT"
        [columnDefaultWidth]="COLUMN_WIDTH"
        [domProps]="domProps"
      />
    </infinite-data-source>
  `,
})
export default class LargeContentVerticalPage implements OnInit {
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly ROW_HEIGHT = ROW_HEIGHT;
  protected readonly COLUMN_WIDTH = COLUMN_WIDTH;

  private readonly rowCount = signal(VERTICAL_ROW_COUNT);
  protected readonly data = computed(() => makeRows(this.rowCount()));

  ngOnInit() {
    (globalThis as any).setRowCount = (count: number) => {
      this.rowCount.set(count);
    };
  }
}
