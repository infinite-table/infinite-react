import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';

import { DataSourceSortInfo } from '@infinite-table/infinite-react';
import { useState } from 'react';

interface Order {
  OrderId: number;
  CompanyName: string;
  ItemCount: number;
  OrderCost: number;
  ShipCountry: string;
  ShipVia: string;
}

const orders = [
  {
    OrderId: 1,
    CompanyName: 'Ltd company',
    ItemCount: 10,
    OrderCost: 950.5,
    ShipVia: 'Federal Shipping',
    ShipCountry: 'Canada',
  },
  {
    OrderId: 20,
    CompanyName: 'Abc',
    ItemCount: 13,
    OrderCost: 717.21,
    ShipVia: 'United Package',
    ShipCountry: 'Germany',
  },
  {
    OrderId: 2,
    CompanyName: 'Another one',
    ItemCount: 13,
    OrderCost: 1009.71,
    ShipVia: 'Speedy Express',
    ShipCountry: 'Finland',
  },
  {
    OrderId: 3,
    CompanyName: 'Because',
    ItemCount: 14,
    OrderCost: 760.76,
    ShipVia: 'United Package',
    ShipCountry: 'France',
  },
];
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
          fields={[
            'OrderId',
            'CompanyName',
            'ItemCount',
            'OrderCost',
            'ShipCountry',
            'ShipVia',
          ]}
          sortInfo={sortInfo}
          onSortInfoChange={(sortInfo) => {
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
