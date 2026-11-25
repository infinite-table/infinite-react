import { Component, signal } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  RowSelectionState,
} from '@infinite-table/infinite-angular';

import { data, height80vhDomProps } from './common';

const columns: Record<string, any> = {
  firstName: {
    field: 'firstName',
    renderSelectionCheckBox: true,
  },
  lastName: {
    field: 'lastName',
  },
  stack: {
    field: 'stack',
  },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  age: {
    field: 'age',
  },
  canDesign: {
    field: 'canDesign',
  },
  id: { field: 'id' },
};

const initialRowSelection = {
  selectedRows: [2, 3],
  defaultSelection: false,
};

(globalThis as any).rowSelection = initialRowSelection;

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div>Selected {{ selectedCount(rowSelection()) }}</div>
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      selectionMode="multi-row"
      [rowSelection]="rowSelection()"
      (rowSelectionChange)="onRowSelectionChange($event)"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        (cellClick)="onCellClick($event)"
        [keyboardSelection]="true"
        keyboardNavigation="row"
        [columnDefaultWidth]="200"
      />
    </infinite-data-source>
  `,
})
export default class DefaultWithRowNavigationPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = height80vhDomProps;

  protected readonly rowSelection = signal<any>(initialRowSelection);

  protected onRowSelectionChange(sel: any) {
    this.rowSelection.set(sel);
    (globalThis as any).rowSelection = sel;
  }

  protected onCellClick({ rowIndex, api, dataSourceApi }: any) {
    const pk = dataSourceApi.getPrimaryKeyByIndex(rowIndex);
    api.rowSelectionApi.toggleRowSelection(pk);
  }

  protected selectedCount(sel: any) {
    return sel instanceof RowSelectionState ? sel.getSelectedCount() : false;
  }
}
