import {
  InfiniteTable,
  DataSource,
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
  columnHeaderHeight: 53,

  columnMinWidth: 100,
};
export default function Example() {
  const [darkMode, setDarkMode] = React.useState(true);
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexFlow: 'row',
      }}
      className={`infinite-theme-mode--${darkMode ? 'dark' : 'light'}`}
    >
      <div>
        <button
          onClick={() => {
            setDarkMode(!darkMode);
          }}
          className="text-white bg-red-400 rounded-md p-4"
        >
          toggle
        </button>
      </div>
      <div style={containerStyle}>
        <DataSource<Order>
          primaryKey="OrderId"
          data={orders}
          selectionMode="multi-cell"
        >
          <InfiniteTable<Order> {...infiniteProps} />
        </DataSource>
      </div>
      <div
        style={{ ...containerStyle, background: 'white' }}
        className="infinite-theme-name--minimalist"
      >
        <DataSource<Order>
          primaryKey="OrderId"
          data={orders}
          selectionMode="multi-cell"
        >
          <InfiniteTable<Order> {...infiniteProps} />
        </DataSource>
      </div>
    </div>
  );
}
