import * as React from 'react';

import { TableFactory } from '@components/Table';
import DataSource, { DataSourceSortInfo } from '@src/components/DataSource';

interface Order {
  OrderId: number;
  CompanyName: string;
  ItemCount: number;
  OrderCost: number;
  ShipCountry: string;
  ShipVia: string;
}

const Table = TableFactory<Order>();

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
(globalThis as any).sortInfos = [];
const onSortInfoChange = (sortInfo: DataSourceSortInfo<Order>) => {
  (globalThis as any).sortInfos.push(sortInfo);
};

export default () => {
  return (
    <React.StrictMode>
      <DataSource<Order>
        data={orders}
        onSortInfoChange={onSortInfoChange}
        primaryKey="OrderId"
        fields={[
          'OrderId',
          'CompanyName',
          'ItemCount',
          'OrderCost',
          'ShipCountry',
          'ShipVia',
        ]}
      >
        <Table
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
    </React.StrictMode>
  );
};
