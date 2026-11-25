import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropCellSelection_MultiCell,
  InfiniteTablePropColumnPinning,
} from '@infinite-table/infinite-angular';

import { columns, developers1kDataSource, height80vhDomProps } from './common';

const cellSelection: DataSourcePropCellSelection_MultiCell = {
  selectedCells: [
    // [2, 'firstName'],
    ['*', 'firstName'],
    // [7, 'preferredLanguage'],
    // [3, 'id'],
    [3, '*'],
    [4, '*'],
    [5, '*'],
    [11, 'preferredLanguage'],
    [15, 'stack'],
  ],
  // deselectedCells: [[3, 'stack']],
  defaultSelection: false,
};

const columnPinning: InfiniteTablePropColumnPinning = {
  // firstName: 'start',
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="developers1kDataSource"
      selectionMode="multi-cell"
      [defaultCellSelection]="cellSelection"
    >
      <infinite-table
        [columnPinning]="columnPinning"
        debugId="test"
        [domProps]="domProps"
        [columns]="columns"
        [keyboardSelection]="true"
        keyboardNavigation="cell"
        [columnDefaultWidth]="200"
      />
    </infinite-data-source>
  `,
})
export default class CellSelectionDefaultPage {
  protected readonly developers1kDataSource = developers1kDataSource;
  protected readonly columns = columns;
  protected readonly domProps = height80vhDomProps;
  protected readonly cellSelection = cellSelection;
  protected readonly columnPinning = columnPinning;
}
