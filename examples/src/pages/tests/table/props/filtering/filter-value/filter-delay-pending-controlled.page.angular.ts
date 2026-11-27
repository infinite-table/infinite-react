import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceFilterValueItem,
  DataSourcePropFilterValue,
} from '@infinite-table/infinite-angular';

import {
  Developer,
  FILTER_DELAY,
  columns,
  developers,
  domProps,
  recordFilterValueChange,
} from './filter-delay-pending.data';

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="developers"
      primaryKey="id"
      [filterValue]="filterValue()"
      (filterValueChange)="onFilterValueChange($event)"
      [filterDelay]="filterDelay"
    >
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="200"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class FilterDelayPendingControlledPage {
  protected readonly developers = developers;
  protected readonly filterDelay = FILTER_DELAY;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly filterValue = signal<
    DataSourcePropFilterValue<Developer> | undefined
  >([]);

  constructor() {
    // a view or a restored state replacing the filters - called by the spec
    (globalThis as any).setFilterValue = (
      value: DataSourceFilterValueItem<Developer>[],
    ) => {
      this.filterValue.set(value);
    };
  }

  protected onFilterValueChange(
    value: DataSourcePropFilterValue<Developer> | undefined,
  ) {
    recordFilterValueChange(value);
    this.filterValue.set(value);
  }
}
