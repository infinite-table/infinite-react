import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTableApi } from '@infinite-table/infinite-angular';

import {
  activeRowDomProps,
  defaultColumns,
  developers100DataSource,
  type Developer,
} from './common';

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="scrollLeft()">scroll left = 100</button>
    <infinite-data-source primaryKey="id" [data]="developers100DataSource">
      <infinite-table
        (ready)="onReady($event)"
        [columns]="defaultColumns"
        [defaultActiveRowIndex]="99"
        keyboardNavigation="row"
        [domProps]="activeRowDomProps"
        [columnPinning]="columnPinning"
      />
    </infinite-data-source>
  `,
})
export default class ActiveRowIndexDefaultPage {
  protected readonly developers100DataSource = developers100DataSource;
  protected readonly defaultColumns = defaultColumns;
  protected readonly activeRowDomProps = activeRowDomProps;
  protected readonly columnPinning = {
    stack: true as const,
  };

  private infiniteTableApi: InfiniteTableApi<Developer> | null = null;

  protected onReady({ api }: { api: InfiniteTableApi<Developer> }) {
    this.infiniteTableApi = api;
  }

  protected scrollLeft() {
    this.infiniteTableApi!.scrollLeft = 100;
  }
}
