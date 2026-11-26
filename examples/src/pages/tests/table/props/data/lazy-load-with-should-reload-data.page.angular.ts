import { Component } from '@angular/core';
import sinon from 'sinon';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  salary: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  lastName: { field: 'lastName' },
  country: { field: 'country' },
  salary: { field: 'salary' },
};

const lazyLoad = { batchSize: 50 };
const shouldReloadData = {
  sortInfo: true,
  filterValue: true,
  groupBy: true,
  pivotBy: true,
};

const dataSource: DataSourceData<Developer> = ({
  lazyLoadStartIndex,
  lazyLoadBatchSize,
  sortInfo,
}: any) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }
  const args = [
    `start=${lazyLoadStartIndex || 0}`,
    `limit=${lazyLoadBatchSize}`,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s: any) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?` + args)
    .then((r) => r.json())
    .then((data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(data);
        }, 20);
      });
    });
};

const spiedDataSource = sinon.spy(dataSource);

(globalThis as any).dataSource = spiedDataSource;

const domProps = {
  style: {
    height: '90vh',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="spiedDataSource"
      primaryKey="id"
      [lazyLoad]="lazyLoad"
      [shouldReloadData]="shouldReloadData"
    >
      <infinite-table
        [columns]="columns"
        [rowHeight]="40"
        [scrollStopDelay]="10"
        [domProps]="domProps"
      />
    </infinite-data-source>
  `,
})
export default class LazyLoadWithShouldReloadDataPage {
  protected readonly spiedDataSource = spiedDataSource;
  protected readonly lazyLoad = lazyLoad;
  protected readonly shouldReloadData = shouldReloadData;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
}
