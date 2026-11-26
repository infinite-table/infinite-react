import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { getOrders } from './getOrders';

const orders = getOrders();
const defaultSortInfo: any[] = [];

const selectStyle = {
  margin: '10px 0',
  display: 'inline-block',
  background: 'var(--infinite-background)',
  color: 'var(--infinite-cell-color)',
  padding: 'var(--infinite-space-3)',
};

const columns = {
  orderId: {
    field: 'OrderId' as const,
    type: 'number',
  },
  companyName: {
    field: 'CompanyName' as const,
  },
  itemCount: { field: 'ItemCount' as const, type: 'number' },
  orderCost: { field: 'OrderCost' as const, type: 'number' },
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <select
      [style]="selectStyle"
      [value]="multiSortBehavior()"
      (change)="onMultiSortBehaviorChange($event)"
    >
      <option value="replace">replace</option>
      <option value="append">append</option>
    </select>
    <infinite-data-source
      [data]="orders"
      primaryKey="OrderId"
      [defaultSortInfo]="defaultSortInfo"
    >
      <infinite-table
        [domProps]="domProps"
        [rowHeight]="40"
        [multiSortBehavior]="multiSortBehavior()"
        [columnDefaultWidth]="150"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class MultisortBehaviorRuntimeSelectionPage {
  protected readonly orders = orders;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly defaultSortInfo = defaultSortInfo;
  protected readonly selectStyle = selectStyle;

  protected readonly multiSortBehavior = signal<'append' | 'replace'>('replace');

  protected onMultiSortBehaviorChange(event: Event) {
    this.multiSortBehavior.set(
      (event.target as HTMLSelectElement).value as 'append' | 'replace',
    );
  }
}
