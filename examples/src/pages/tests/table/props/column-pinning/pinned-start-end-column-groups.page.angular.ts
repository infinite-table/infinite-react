import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import {
  GRID_HEIGHT,
  GRID_WIDTH,
  ROW_HEIGHT,
  columnGroups,
  columnPinning,
  getColumns,
  rows,
} from './pinnedStartEndData';

const columns = getColumns({ withGroups: true });

const domProps = {
  style: {
    margin: '20px',
    width: `${GRID_WIDTH}px`,
    height: `${GRID_HEIGHT}px`,
    border: '1px solid gray',
  },
};

const onReady = ({ api }: { api: any }) => {
  (globalThis as any).api = api;
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="rows">
      <infinite-table
        [domProps]="domProps"
        [rowHeight]="ROW_HEIGHT"
        [columnPinning]="columnPinning"
        [columns]="columns"
        [columnGroups]="columnGroups"
        (ready)="onReady($event)"
      />
    </infinite-data-source>
  `,
})
export default class PinnedStartEndColumnGroupsPage {
  protected readonly rows = rows;
  protected readonly columns = columns;
  protected readonly columnGroups = columnGroups;
  protected readonly columnPinning = columnPinning;
  protected readonly ROW_HEIGHT = ROW_HEIGHT;
  protected readonly domProps = domProps;
  protected readonly onReady = onReady;
}
