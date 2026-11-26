import { Component } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import sinon from 'sinon';

import { getOrders } from './getOrders';

const orders = getOrders();

const onSortInfoChange = sinon.spy((_sortInfo: any) => {});

(globalThis as any).onSortInfoChange = onSortInfoChange;

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
  <infinite-data-source
    [data]="orders"
    (sortInfoChange)="onSortInfoChange($event)"
    primaryKey="OrderId"
  >
    <infinite-table
      [domProps]="domProps"
      [rowHeight]="40"
      [columnDefaultWidth]="150"
      [columns]="columns"
    />
  </infinite-data-source>
  `,
})
export default class UncontrolledSingleSortViaColumnMenuPage {
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly onSortInfoChange = onSortInfoChange;
  protected readonly orders = orders;
}
