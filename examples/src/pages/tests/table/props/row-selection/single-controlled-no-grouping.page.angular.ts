import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { data, height80vhDomProps } from './common';

const columns: Record<string, any> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div>Selected {{ rowSelectionText() }}</div>
    <infinite-data-source primaryKey="id" [data]="data" [(rowSelection)]="rowSelection">
      <infinite-table [domProps]="domProps" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class SingleControlledNoGroupingPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = height80vhDomProps;

  protected readonly rowSelection = signal<any>(3);

  protected readonly rowSelectionText = computed(() =>
    JSON.stringify(this.rowSelection()),
  );
}
