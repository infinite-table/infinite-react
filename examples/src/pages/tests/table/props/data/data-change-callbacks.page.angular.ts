import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import {
  DataKind,
  columns,
  createDataChangeLog,
  domProps,
} from './data-change-callbacks.log';

const { handlers, data } = createDataChangeLog();

// onDataArrayChange as the function input: the spec reads both arguments
@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    @for (kind of kinds; track kind) {
      <infinite-data-source
        [data]="data[kind]"
        primaryKey="id"
        [onDataArrayChange]="handlers[kind].onDataArrayChange"
        (dataMutations)="handlers[kind].onDataMutations($event)"
        (ready)="handlers[kind].onReady($event)"
      >
        <infinite-table [columns]="columns" [domProps]="domProps" />
      </infinite-data-source>
    }
  `,
})
export default class DataChangeCallbacksPage {
  protected readonly kinds: DataKind[] = ['array', 'promise', 'fn'];
  protected readonly handlers = handlers;
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
}
