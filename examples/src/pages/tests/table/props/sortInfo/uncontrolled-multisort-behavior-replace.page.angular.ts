import { Component } from '@angular/core';
import sinon from 'sinon';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { getOrders } from './getOrders';

const orders = getOrders();

const onSortInfoChange = sinon.spy((_sortInfo: any) => {});

const defaultSortInfo: any[] = [];

(globalThis as any).defaultSortInfo = defaultSortInfo;
(globalThis as any).onSortInfoChange = onSortInfoChange;

const columns: Record<string, any> = {
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
      [defaultSortInfo]="defaultSortInfo"
    >
      <infinite-table
        [domProps]="domProps"
        [rowHeight]="40"
        multiSortBehavior="replace"
        [columnDefaultWidth]="150"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class UncontrolledMultisortBehaviorReplacePage {
  protected readonly orders = orders;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly defaultSortInfo = defaultSortInfo;
  protected readonly onSortInfoChange = onSortInfoChange;
}
