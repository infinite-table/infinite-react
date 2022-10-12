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

(globalThis as any).onSortInfoChange = onSortInfoChange;

export default () => {
  return (
    <React.StrictMode>
      <DataSource<Order>
        data={orders}
        onSortInfoChange={onSortInfoChange}
        primaryKey="OrderId"
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
          }}
        />
      </DataSource>
    </React.StrictMode>
  );
};
