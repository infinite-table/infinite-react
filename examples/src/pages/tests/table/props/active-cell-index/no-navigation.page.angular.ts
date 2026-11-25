import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { columns, developers100DataSource, height800DomProps } from './common';

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="developers100DataSource">
      <infinite-table
        [columns]="columns"
        [keyboardNavigation]="false"
        [domProps]="height800DomProps"
      />
    </infinite-data-source>
  `,
})
export default class NoNavigationPage {
  protected readonly developers100DataSource = developers100DataSource;
  protected readonly columns = columns;
  protected readonly height800DomProps = height800DomProps;
}
