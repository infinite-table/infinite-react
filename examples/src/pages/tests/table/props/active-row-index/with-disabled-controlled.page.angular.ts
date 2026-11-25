import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourceApi } from '@infinite-table/infinite-angular';

import {
  activeRowDomProps,
  disabledRowColumns,
  developers10DataSource,
  type Developer,
} from './common';

(globalThis as any).activeRowIndex = 0;

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div style="margin-bottom: 10px">
      <button (click)="disableAllRows()">Disable All Rows</button>
      <button (click)="enableAllRows()" style="margin-left: 10px">
        Enable All Rows
      </button>
      <button (click)="toggleRow1()" style="margin-left: 10px">
        Toggle Row 1
      </button>
    </div>
    <infinite-data-source
      (ready)="onReady($event)"
      primaryKey="id"
      [data]="developers10DataSource"
      selectionMode="multi-row"
      [rowDisabledState]="rowDisabledState()"
      (rowDisabledStateChange)="onRowDisabledStateChange($event)"
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
export default class WithDisabledControlledPage {
  protected readonly developers10DataSource = developers10DataSource;
  protected readonly disabledRowColumns = disabledRowColumns;
  protected readonly activeRowDomProps = activeRowDomProps;

  protected readonly activeRowIndex = signal<number | null | undefined>(0);

  protected readonly rowDisabledState = signal<any>({
    enabledRows: true,
    disabledRows: [3, 5, 6],
  });

  private dataSourceApi: DataSourceApi<Developer> | null = null;

  protected onReady(api: DataSourceApi<Developer>) {
    this.dataSourceApi = api;
  }

  protected onActiveRowIndexChange(index: number | null | undefined) {
    this.activeRowIndex.set(index);
    (globalThis as any).activeRowIndex = index;
  }

  protected onRowDisabledStateChange(s: any) {
    this.rowDisabledState.set(s.getState());
  }

  protected disableAllRows() {
    this.dataSourceApi?.disableAllRows();
  }

  protected enableAllRows() {
    this.dataSourceApi?.enableAllRows();
  }

  protected toggleRow1() {
    if (this.dataSourceApi) {
      const isRowDisabled = this.dataSourceApi.isRowDisabled(1);
      this.dataSourceApi.setRowEnabledAt(1, isRowDisabled);
    }
  }
}
