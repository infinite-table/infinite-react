import { Component, effect } from '@angular/core';
import sinon from 'sinon';

import {
  DataSource,
  InfiniteTable,
  injectDataSource,
} from '@infinite-table/infinite-angular';
import type { DataSourceData } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const columns: Record<string, any> = {
  id: { field: 'id' },
  salary: { field: 'salary' },
  age: { field: 'age' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  lastName: { field: 'lastName' },
  country: { field: 'country' },
  city: { field: 'city' },
  currency: { field: 'currency' },
  stack: { field: 'stack' },
  canDesign: { field: 'canDesign' },
};

const dataSource: DataSourceData<Developer> = ({
  pivotBy,
  aggregationReducers,
  groupBy,

  lazyLoadStartIndex,
  lazyLoadBatchSize,
  groupKeys = [],
  sortInfo,
}: any) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }
  const startLimit: string[] = [];
  if (lazyLoadBatchSize && lazyLoadBatchSize > 0) {
    const start = lazyLoadStartIndex || 0;
    startLimit.push(`start=${start}`);
    startLimit.push(`limit=${lazyLoadBatchSize}`);
  }
  const args = [
    ...startLimit,
    pivotBy
      ? 'pivotBy=' +
        JSON.stringify(pivotBy.map((p: any) => ({ field: p.field })))
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' +
        JSON.stringify(groupBy.map((p: any) => ({ field: p.field })))
      : null,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s: any) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,
    aggregationReducers
      ? 'reducers=' +
        JSON.stringify(
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            id: key,
            name: aggregationReducers[key].reducer,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql?` + args)
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

// renders nothing: keeps the length of the data array in a global
@Component({
  selector: 'data-array-length',
  template: '',
})
class Cmp {
  constructor() {
    const context = injectDataSource<Developer>();

    effect(() => {
      (globalThis as any).dataArrayLength = context.state().dataArray.length;
    });
  }
}

(globalThis as any).dataSource = spiedDataSource;

@Component({
  imports: [DataSource, InfiniteTable, Cmp],
  template: `
    <button (click)="onScrollToRowClick()">Scroll to row 50</button>
    <infinite-data-source
      [data]="spiedDataSource"
      primaryKey="id"
      [groupBy]="groupBy"
      [lazyLoad]="lazyLoad"
    >
      <infinite-table
        [columns]="columns"
        [rowHeight]="40"
        [scrollStopDelay]="10"
        (ready)="onReady($event)"
        [domProps]="domProps"
      />
      <data-array-length />
    </infinite-data-source>
  `,
})
export default class LazyLoadGroupedExamplePage {
  protected readonly spiedDataSource = spiedDataSource;
  protected readonly columns = columns;
  protected readonly groupBy = [{ field: 'country' as const }];
  protected readonly lazyLoad = { batchSize: 50 };
  protected readonly domProps = {
    style: {
      height: '90vh',
    },
  };

  protected onScrollToRowClick() {
    (globalThis as any).api.scrollRowIntoView(50, {
      scrollAdjustPosition: 'start',
    });
  }

  protected onReady({ api }: { api: any }) {
    (globalThis as any).api = api;
  }
}
