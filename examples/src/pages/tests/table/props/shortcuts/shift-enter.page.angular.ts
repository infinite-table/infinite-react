import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { columns, data, height100DomProps } from './common';

const keyboardShortcuts = [
  {
    key: 'Shift+Enter',
    handler: () => {
      (globalThis as any).working = (globalThis as any).working || 0;
      (globalThis as any).working++;
    },
  },
];

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table
        [domProps]="height100DomProps"
        [keyboardShortcuts]="keyboardShortcuts"
        keyboardNavigation="cell"
        [columnDefaultWidth]="150"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ShiftEnterPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly height100DomProps = height100DomProps;
  protected readonly keyboardShortcuts = keyboardShortcuts;
}
