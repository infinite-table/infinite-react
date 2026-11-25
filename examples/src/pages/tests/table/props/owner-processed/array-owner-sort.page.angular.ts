import { Component, computed, signal } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  multisort,
} from '@infinite-table/infinite-angular';
import type { DataSourceSingleSortInfo } from '@infinite-table/infinite-angular';

import { developers } from './developers';
import type { Developer } from './developers';

// the owner's own rule for sorting names: by length, not alphabetically
const byLength = (a: string, b: string) => a.length - b.length;

const shouldReloadData = { sortInfo: true };

const columns = {
  name: { field: 'name' as const },
  country: { field: 'country' as const },
  age: { field: 'age' as const, type: 'number' },
};

const domProps = { style: { height: '80vh' } };

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="rows()"
      [sortInfo]="sortInfo()"
      (sortInfoChange)="onSortInfoChange($any($event))"
      [shouldReloadData]="shouldReloadData"
    >
      <infinite-table [columns]="columns" [domProps]="domProps" />
    </infinite-data-source>
  `,
})
export default class ArrayOwnerSortPage {
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly shouldReloadData = shouldReloadData;

  protected readonly sortInfo = signal<DataSourceSingleSortInfo<Developer>[]>(
    [],
  );

  protected readonly rows = computed(() =>
    multisort(
      this.sortInfo().map((info) => ({ ...info, fn: byLength })),
      [...developers],
    ),
  );

  protected onSortInfoChange(value: DataSourceSingleSortInfo<Developer>[]) {
    this.sortInfo.set(value);
  }
}
