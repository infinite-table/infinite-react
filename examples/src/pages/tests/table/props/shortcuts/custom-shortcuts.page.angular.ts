import { Component } from '@angular/core';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-angular';

import { columns, data, height100DomProps } from './common';

const combinations: number[] = [];
(globalThis as any).combinations = combinations;

function handler(index: number) {
  return () => {
    combinations[index] = combinations[index] || 0;
    combinations[index]++;
  };
}

const keyboardShortcuts = [
  {
    key: 'cmd+shift+x',
    handler: handler(0),
  },

  {
    key: 'alt+shift+arrowleft',
    handler: handler(1),
  },
  {
    key: 'Shift+PageDown',
    handler: handler(2),
  },
  {
    key: 'alt+shift+*',
    handler: handler(3),
  },
];

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        [keyboardShortcuts]="keyboardShortcuts"
        keyboardNavigation="cell"
        [columnDefaultWidth]="150"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class CustomShortcutsPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = height100DomProps;
  protected readonly keyboardShortcuts = keyboardShortcuts;
}
