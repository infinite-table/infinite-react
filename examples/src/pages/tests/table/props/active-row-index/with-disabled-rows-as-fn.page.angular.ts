import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import {
  activeRowDomProps,
  disabledRowColumns,
  developers10DataSource,
} from './common';

(globalThis as any).activeRowIndex = 0;

const isRowDisabled = (rowInfo: any) =>
  rowInfo.indexInAll === 3 ||
  rowInfo.indexInAll === 5 ||
  rowInfo.indexInAll === 6;

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="developers10DataSource"
      selectionMode="multi-row"
      [isRowDisabled]="isRowDisabled"
    >
      <infinite-table
        [columns]="disabledRowColumns"
        [activeRowIndex]="activeRowIndex()"
        (activeRowIndexChange)="onActiveRowIndexChange($event)"
        keyboardNavigation="row"
        [domProps]="activeRowDomProps"
      />
    </infinite-data-source>
  `,
})
export default class WithDisabledRowsAsFnPage {
  protected readonly developers10DataSource = developers10DataSource;
  protected readonly disabledRowColumns = disabledRowColumns;
  protected readonly activeRowDomProps = activeRowDomProps;
  protected readonly isRowDisabled = isRowDisabled;

  protected readonly activeRowIndex = signal<number | null | undefined>(0);

  protected onActiveRowIndexChange(index: number | null | undefined) {
    this.activeRowIndex.set(index);
    (globalThis as any).activeRowIndex = index;
  }
}
