import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourceApi } from '@infinite-table/infinite-angular';

import {
  type Developer,
  insertData as data,
  insertDataColumns as columns,
  mark,
  afterMark,
  height100DomProps,
} from './common';

(globalThis as any).mutations = undefined;

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="onAddClick()">Add 2 items</button>

    <infinite-data-source
      [data]="data"
      primaryKey="id"
      (ready)="onReady($event)"
    >
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="100"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class InsertDataArrayEndPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = height100DomProps;

  private dataSourceApi: DataSourceApi<Developer> | null = null;

  protected onReady(api: DataSourceApi<Developer>) {
    this.dataSourceApi = api;
  }

  protected onAddClick() {
    this.dataSourceApi!.insertDataArray([mark, afterMark], {
      position: 'end',
    });
  }
}
