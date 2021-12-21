import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';

import { DataSourceSortInfo } from '@infinite-table/infinite-react';
import { useState } from 'react';
import { getOrders } from './getOrders';

interface Order {
  OrderId: number;
  CompanyName: string;
  ItemCount: number;
  OrderCost: number;
  ShipCountry: string;
  ShipVia: string;
}
const orders = getOrders();
export default function ControlledPageTest() {
  const [sortInfo, setSortInfo] = useState<DataSourceSortInfo<Order>>({
    dir: 1,
    field: 'CompanyName',
  });

  const [enabled, setEnabled] = useState(false);

  console.log('rerender with', sortInfo);
  return (
    <React.StrictMode>
      <div>
        <p>Currently the sorting is {enabled ? 'enabled' : 'disabled'}</p>
        <button
          onClick={() => {
            setEnabled(!enabled);
          }}
        >
          Toggle - click the toggle to {enabled ? 'disable' : 'enable'} sortInfo
        </button>
        <DataSource<Order>
          data={orders}
          primaryKey="OrderId"
          sortInfo={sortInfo}
          onSortInfoChange={(sortInfo: DataSourceSortInfo<Order> | null) => {
            console.log(sortInfo);
            if (enabled) {
              setSortInfo(sortInfo);
            }
          }}
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
            columns={
              new Map([
                [
                  'OrderId',
                  {
                    field: 'OrderId',
                    type: 'number',
                  },
                ],
                [
                  'CompanyName',
                  {
                    field: 'CompanyName',
                  },
                ],
                ['ItemCount', { field: 'ItemCount', type: 'number' }],
                ['OrderCost', { field: 'OrderCost', type: 'number' }],
                ['ShipCountry', { field: 'ShipCountry' }],
                ['ShipVia', { field: 'ShipVia' }],
              ])
            }
          />
        </DataSource>
      </div>
    </React.StrictMode>
  );
}
