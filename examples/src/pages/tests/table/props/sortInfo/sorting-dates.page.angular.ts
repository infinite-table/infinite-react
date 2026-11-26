import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { orders } from './orders-dataset';

const defaultSortInfo: any[] = [];

const sortTypes = {};

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
  shipDate: {
    field: 'ShipDate' as const,
    defaultWidth: 200,
    type: 'date',
    valueFormatter: ({ value }: { value: any }) => value.toLocaleDateString(),
  },
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
      [defaultSortInfo]="defaultSortInfo"
      [sortTypes]="sortTypes"
    >
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class SortingDatesPage {
  protected readonly orders = orders;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly defaultSortInfo = defaultSortInfo;
  protected readonly sortTypes = sortTypes;
}
