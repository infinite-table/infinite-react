import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import {
  columns,
  defaultActiveCellIndex,
  developers100DataSource,
  height800DomProps,
} from './common';

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="developers100DataSource">
      <infinite-table
        [columns]="columns"
        [defaultActiveCellIndex]="defaultActiveCellIndex"
        [domProps]="height800DomProps"
      />
    </infinite-data-source>
  `,
})
export default class DefaultActiveCellIndexWithDelayPage {
  protected readonly developers100DataSource = developers100DataSource;
  protected readonly columns = columns;
  protected readonly defaultActiveCellIndex = defaultActiveCellIndex;
  protected readonly height800DomProps = height800DomProps;
}
