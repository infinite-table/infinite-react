import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import {
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
      [defaultFilterValue]="[]"
      [filterDelay]="filterDelay"
      (filterValueChange)="onFilterValueChange($event)"
    >
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="200"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class FilterDelayPendingPage {
  protected readonly developers = developers;
  protected readonly filterDelay = FILTER_DELAY;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  protected onFilterValueChange(filterValue: any) {
    recordFilterValueChange(filterValue);
  }
}
