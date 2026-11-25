import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { columns, data, minHeight500DomProps } from './common';

//@ts-ignore
globalThis.dataSourceCalls = 0;

const dataSource = ({
  refetchKey,
}: {
  refetchKey?: number | string | object;
}) => {
  //@ts-ignore
  globalThis.dataSourceCalls += 1;
  console.log('refetchKey', refetchKey);
  return Promise.resolve(
    refetchKey && (refetchKey as number) % 2 === 0
      ? data.slice(0, 2)
      : data.slice(0, data.length),
  );
};

const shouldReloadData = {
  sortInfo: true,
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="refetch()">refetch</button>
    <infinite-data-source
      [refetchKey]="refetchKey()"
      [data]="dataSource"
      primaryKey="id"
      [shouldReloadData]="shouldReloadData"
    >
      <infinite-table [columns]="columns" [domProps]="domProps" />
    </infinite-data-source>
  `,
})
export default class SortModeRemotePage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = minHeight500DomProps;
  protected readonly shouldReloadData = shouldReloadData;

  protected readonly refetchKey = signal(1);

  protected refetch() {
    this.refetchKey.set(this.refetchKey() + 1);
  }
}
