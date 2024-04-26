import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  InfiniteTableProps,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';
import orders from '../../../../datasets/orders.json';

interface Order {
  OrderId: number;
  CompanyName: string;
  ItemCount: number;
  OrderCost: number;
  ShipCountry: string;
  ShipVia: string;
}

const columns: InfiniteTablePropColumns<Order> = {
  OrderId: {
    field: 'OrderId',
    type: 'number',
  },
  CompanyName: {
    field: 'CompanyName',
    defaultFlex: 1,
  },
  ItemCount: {
    field: 'ItemCount',
    type: 'number',
    defaultFlex: 2,
    align: 'center',
  },
  OrderCost: { field: 'OrderCost', type: 'number' },
  ShipCountry: { field: 'ShipCountry' },
  ShipVia: { field: 'ShipVia' },
};

const domProps = {
  style: {
    height: '100%',
  },
};
const containerStyle = {
  flex: 1,
  height: '100%',
  padding: 10,
};
const infiniteProps: InfiniteTableProps<Order> = {
  columns,
  domProps,
  rowHeight: 53,
};
export default function Example() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexFlow: 'row',
      }}
      className="infinite-theme-name--minimalist"
    >
      <div style={containerStyle} className="infinite-theme-mode--dark">
        <DataSource<Order> primaryKey="OrderId" data={orders}>
          <InfiniteTable<Order> {...infiniteProps} />
        </DataSource>
      </div>
      <div
        style={{ ...containerStyle, background: 'white' }}
        className="infinite-theme-mode--light"
      >
        <DataSource<Order> primaryKey="OrderId" data={orders}>
          <InfiniteTable<Order> {...infiniteProps} />
        </DataSource>
      </div>
    </div>
  );
}
