import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';
import sinon from 'sinon';

import { getOrders } from './getOrders';
import type { Order } from './getOrders';

const orders = getOrders();

const onSortInfoChange = sinon.spy((_sortInfo: any) => {});

(globalThis as any).onSortInfoChange = onSortInfoChange;

const columns: InfiniteTablePropColumns<Order> = {
  OrderId: {
    field: 'OrderId',
    type: 'number',
  },
  CompanyName: {
    field: 'CompanyName',
  },
  ItemCount: { field: 'ItemCount', type: 'number' },
  OrderCost: { field: 'OrderCost', type: 'number' },
  ShipCountry: { field: 'ShipCountry' },
  ShipVia: { field: 'ShipVia' },
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
      primaryKey="OrderId"
      (sortInfoChange)="onSortInfoChange($event)"
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
export default class UncontrolledSingleSortPage {
  protected readonly orders = orders;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly onSortInfoChange = onSortInfoChange;
}
