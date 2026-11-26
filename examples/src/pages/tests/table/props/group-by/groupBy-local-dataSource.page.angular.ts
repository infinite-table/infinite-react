import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { carsales, columns, groupByCarsalesDomProps } from './common';

const dataSource = (params: any) => {
  console.log('refetch data');

  (globalThis as any).callCount = ((globalThis as any).callCount || 0) + 1;
  (globalThis as any).groupBy = params.groupBy;
  return Promise.resolve(carsales);
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="toggleGroup()">toggle group</button>
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [groupBy]="groupBy()"
    >
      <infinite-table
        [domProps]="groupByCarsalesDomProps"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class GroupByLocalDataSourcePage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupByCarsalesDomProps = groupByCarsalesDomProps;

  protected readonly groupBy = signal<any[]>([
    {
      field: 'year',
    },
  ]);

  protected toggleGroup() {
    if (this.groupBy().length) {
      this.groupBy.set([]);
    } else {
      this.groupBy.set([
        {
          field: 'year',
        },
      ]);
    }
  }
}
