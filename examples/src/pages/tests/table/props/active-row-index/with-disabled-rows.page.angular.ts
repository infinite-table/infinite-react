import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import {
  activeRowDomProps,
  disabledRowColumns,
  developers10DataSource,
} from './common';

(globalThis as any).activeRowIndex = 0;

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="developers10DataSource"
      selectionMode="multi-row"
      [rowDisabledState]="rowDisabledState"
      [defaultRowSelection]="defaultRowSelection"
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
export default class WithDisabledRowsPage {
  protected readonly developers10DataSource = developers10DataSource;
  protected readonly disabledRowColumns = disabledRowColumns;
  protected readonly activeRowDomProps = activeRowDomProps;

  protected readonly rowDisabledState = {
    enabledRows: true as const,
    disabledRows: [3, 5, 6],
  };

  protected readonly defaultRowSelection = {
    selectedRows: [5, 6, 7, 8],
    defaultSelection: false as const,
  };

  protected readonly activeRowIndex = signal<number | null | undefined>(0);

  protected onActiveRowIndexChange(index: number | null | undefined) {
    this.activeRowIndex.set(index);
    (globalThis as any).activeRowIndex = index;
  }
}
