import { Component, effect, signal } from '@angular/core';
import sinon from 'sinon';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { columns, developers10kDataSource } from './common';

const onColumnSizingChangeSpy = sinon.spy((_columnSizing: any) => {});
const onViewportReservedWidthChangeSpy = sinon.spy((_width: number) => {});

(globalThis as any).onColumnSizingChange = onColumnSizingChangeSpy;
(globalThis as any).onViewportReservedWidthChange =
  onViewportReservedWidthChangeSpy;

const onColumnSizingChange = (columnSizing: any) => {
  onColumnSizingChangeSpy(columnSizing);
};

const domProps = {
  style: {
    margin: '5px',
    height: '500px',
    width: '80vw',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="reservedWidth.set(0)">
      Fit - current reserved width is {{ reservedWidth() }}
    </button>
    <infinite-data-source [data]="developers10kDataSource" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        [columnMinWidth]="50"
        (columnSizingChange)="onColumnSizingChange($event)"
        [viewportReservedWidth]="reservedWidth()"
        (viewportReservedWidthChange)="onViewportReservedWidthChange($event!)"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ViewportReservedWidthPage {
  protected readonly developers10kDataSource = developers10kDataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly onColumnSizingChange = onColumnSizingChange;

  protected readonly reservedWidth = signal(0);

  constructor() {
    effect(() => {
      (globalThis as any).viewportReservedWidth = this.reservedWidth();
    });
  }

  protected onViewportReservedWidthChange(width: number) {
    onViewportReservedWidthChangeSpy(width);
    this.reservedWidth.set(width);
  }
}
