import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceSortInfo,
} from '@infinite-table/infinite-react';

import { getOrders, Order } from './getOrders';
const orders = getOrders();

const sinon = require('sinon');

const onSortInfoChange = sinon.spy(
  (_sortInfo: DataSourceSortInfo<Order>) => {},
);

const defaultSortInfo: DataSourceSortInfo<Order> = [
  {
    dir: 1,
    id: 'itemCount',
    // field: 'ItemCount',
  },
  // {
  //   dir: 1,
  //   field: 'ItemCount',
  // },
  { dir: 1, field: 'CompanyName' },
];

(globalThis as any).defaultSortInfo = defaultSortInfo;
(globalThis as any).onSortInfoChange = onSortInfoChange;

export default () => {
  return (
    <React.StrictMode>
      <DataSource<Order>
        data={orders}
        onSortInfoChange={onSortInfoChange}
        primaryKey="OrderId"
        defaultSortInfo={defaultSortInfo}
      >
        <InfiniteTable<Order>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          rowHeight={40}
          columnDefaultWidth={150}
          columns={{
            orderId: {
              field: 'OrderId',
              type: 'number',
            },
            companyName: {
              field: 'CompanyName',
            },
            itemCount: { field: 'ItemCount', type: 'number' },
            itemCount2: { field: 'ItemCount', type: 'number' },
            orderCost: { field: 'OrderCost', type: 'number' },
            shipCountry: { field: 'ShipCountry' },
            shipVia: { field: 'ShipVia' },
          }}
        />
      </DataSource>
    </React.StrictMode>
  );
};
