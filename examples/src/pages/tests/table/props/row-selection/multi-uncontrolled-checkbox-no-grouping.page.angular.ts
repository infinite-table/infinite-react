import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { data, height80vhDomProps } from './common';

const columns: Record<string, any> = {
  id: { field: 'id', renderSelectionCheckBox: true },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="data" selectionMode="multi-row">
      <infinite-table [domProps]="domProps" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class MultiUncontrolledCheckboxNoGroupingPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = height80vhDomProps;
}
