import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTableApi,
  DataSourcePropCellSelection_MultiCell,
} from '@infinite-table/infinite-angular';

import {
  columns,
  developers10DataSource,
  height80vhDomProps,
  type Developer,
} from './common';

const cellSelection: DataSourcePropCellSelection_MultiCell = {
  selectedCells: [
    [2, 'id'],
    [8, 'preferredLanguage'],
    [5, 'stack'],
  ],
  deselectedCells: [[3, 'stack']],
  defaultSelection: false,
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="developers10DataSource"
      selectionMode="multi-cell"
      [defaultCellSelection]="cellSelection"
    >
      <infinite-table
        (ready)="onReady($event)"
        [domProps]="domProps"
        [columns]="columns"
        [keyboardSelection]="true"
        keyboardNavigation="cell"
        [columnDefaultWidth]="200"
      />
    </infinite-data-source>
  `,
})
export default class GetSelectedCellsPage {
  protected readonly developers10DataSource = developers10DataSource;
  protected readonly columns = columns;
  protected readonly domProps = height80vhDomProps;
  protected readonly cellSelection = cellSelection;

  private api: InfiniteTableApi<Developer> | null = null;

  protected onReady({ api }: { api: InfiniteTableApi<Developer> }) {
    this.api = api;
  }
}
