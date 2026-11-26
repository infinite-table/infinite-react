import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import {
  GRID_HEIGHT,
  GRID_WIDTH,
  ROW_HEIGHT,
  columnPinning,
  getColumns,
  rows,
} from './pinnedStartEndData';

const columns = getColumns();

const size = signal({ width: GRID_WIDTH, height: GRID_HEIGHT });
(globalThis as any).setGridSize = (width: number, height: number) => {
  size.set({ width, height });
};

const onReady = ({ api }: { api: any }) => {
  (globalThis as any).api = api;
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="rows">
      <infinite-table
        [domProps]="domProps()"
        [rowHeight]="ROW_HEIGHT"
        [columnPinning]="columnPinning"
        [columns]="columns"
        (ready)="onReady($event)"
      />
    </infinite-data-source>
  `,
})
export default class PinnedStartEndPage {
  protected readonly rows = rows;
  protected readonly columns = columns;
  protected readonly columnPinning = columnPinning;
  protected readonly ROW_HEIGHT = ROW_HEIGHT;
  protected readonly onReady = onReady;

  protected readonly domProps = computed(() => ({
    style: {
      margin: '20px',
      width: `${size().width}px`,
      height: `${size().height}px`,
      border: '1px solid gray',
    },
  }));
}
