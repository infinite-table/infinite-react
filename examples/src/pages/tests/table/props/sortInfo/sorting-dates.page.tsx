import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceSortInfo,
} from '@infinite-table/infinite-react';

import { Order, orders } from './orders-dataset';
const defaultSortInfo: DataSourceSortInfo<Order> = [];

export default () => {
  return (
    <React.StrictMode>
      <>
        <DataSource<Order>
          data={orders}
          primaryKey="OrderId"
          defaultSortInfo={defaultSortInfo}
          sortTypes={{}}
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
              orderCost: { field: 'OrderCost', type: 'number' },
              shipDate: {
                field: 'ShipDate',
                defaultWidth: 200,
                type: 'date',
                valueFormatter: ({ value }) => value.toLocaleDateString(),
              },
            }}
          />
        </DataSource>
      </>
    </React.StrictMode>
  );
};
