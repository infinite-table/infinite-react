import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourceDataParams } from '@infinite-table/infinite-angular';

import { columns, data, type Developer } from './common';

//@ts-ignore
globalThis.dataSourceCalls = 0;

const dataSource = ({ refetchKey }: DataSourceDataParams<Developer>) => {
  //@ts-ignore
  globalThis.dataSourceCalls += 1;
  return refetchKey && (refetchKey as number) % 2 === 0
    ? data.slice(0, 2)
    : data.slice(0, data.length);
};

const domProps = {
  style: {
    margin: '5px',
    height: '500px',
    width: '1000px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="refetchKey.set(refetchKey() + 1)">refetch</button>
    <infinite-data-source
      [refetchKey]="refetchKey()"
      [data]="dataSource"
      primaryKey="id"
    >
      <infinite-table [domProps]="domProps" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class RefetchKeyPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  protected readonly refetchKey = signal(1);
}
