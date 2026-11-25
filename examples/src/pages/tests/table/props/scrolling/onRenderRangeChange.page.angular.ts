import { Component } from '@angular/core';
import sinon from 'sinon';

import {
  DataSource,
  InfiniteTable,
  debounce,
} from '@infinite-table/infinite-angular';
import type {
  ScrollStopInfo,
  TableRenderRange,
} from '@infinite-table/infinite-angular';

import {
  columns,
  developers10kDataSource,
  renderRangeDomProps,
} from './common';

const onRenderRangeChange = sinon.spy((_scrollInfo: ScrollStopInfo) => {});

(globalThis as any).onRenderRangeChange = onRenderRangeChange;

const fn = debounce(
  (range: TableRenderRange) => {
    console.log(range);
    onRenderRangeChange(range as any);
  },
  { wait: 20 },
);

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="developers10kDataSource" primaryKey="id">
      <infinite-table
        [domProps]="renderRangeDomProps"
        [columnMinWidth]="50"
        [columnDefaultWidth]="350"
        (renderRangeChange)="fn($event)"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class OnRenderRangeChangePage {
  protected readonly developers10kDataSource = developers10kDataSource;
  protected readonly columns = columns;
  protected readonly renderRangeDomProps = renderRangeDomProps;
  protected readonly fn = fn;
}
