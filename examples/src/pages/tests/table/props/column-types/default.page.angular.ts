import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import {
  columns,
  columnTypes,
  columnTypesDomProps,
  developers10DataSource,
} from './common';

const onReady = ({ api }: { api: any }) => {
  (globalThis as any).api = api;
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="developers10DataSource">
      <infinite-table
        [domProps]="columnTypesDomProps"
        (ready)="onReady($event)"
        [columnTypes]="columnTypes"
        [columnDefaultWidth]="400"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ColumnTypesDefaultPage {
  protected readonly developers10DataSource = developers10DataSource;
  protected readonly columns = columns;
  protected readonly columnTypes = columnTypes;
  protected readonly columnTypesDomProps = columnTypesDomProps;
  protected readonly onReady = onReady;
}
