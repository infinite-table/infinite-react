import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceSortInfo,
  InfiniteTablePropMultiSortBehavior,
} from '@infinite-table/infinite-react';

import { getOrders, Order } from './getOrders';
const orders = getOrders();
const defaultSortInfo: DataSourceSortInfo<Order> = [];

export default () => {
  const [multiSortBehavior, setMultiSortBehavior] = React.useState<
    'append' | 'replace'
  >('replace');
  return (
    <React.StrictMode>
      <>
        {' '}
        <select
          style={{
            margin: '10px 0',
            display: 'inline-block',
            background: 'var(--infinite-background)',
            color: 'var(--infinite-cell-color)',
            padding: 'var(--infinite-space-3)',
          }}
          value={multiSortBehavior}
          onChange={(event) => {
            const multiSortBehavior = event.target
              .value as InfiniteTablePropMultiSortBehavior;

            setMultiSortBehavior(multiSortBehavior);
          }}
        >
          <option value="replace">replace</option>
          <option value="append">append</option>
        </select>
        <DataSource<Order>
          data={orders}
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
            multiSortBehavior={multiSortBehavior}
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
            }}
          />
        </DataSource>
      </>
    </React.StrictMode>
  );
};
