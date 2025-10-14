import {
  InfiniteTable,
  DataSource,
  InfiniteTableProps,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import * as React from 'react';
import orders from '../../../../datasets/orders.json';

import { Checkbox } from '@/components/ui/checkbox';

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
    renderSelectionCheckBox: true,
  },
  CompanyName: {
    field: 'CompanyName',
    // defaultFlex: 1,
  },
  ItemCount: {
    field: 'ItemCount',
    type: 'number',
    // defaultFlex: 2,
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
  wrapRowsHorizontally: true,
  columns,
  domProps,
  // rowHeight: 40,
  columnHeaderHeight: 53,
  // keyboardNavigation: 'row',
  components: {
    CheckBox: (props) => {
      const { domProps, checked, defaultChecked, onChange, ...rest } = props;
      return (
        <Checkbox
          {...rest}
          className={domProps?.className}
          style={domProps?.style}
          checked={checked == null ? 'indeterminate' : checked}
          defaultChecked={
            defaultChecked == null ? 'indeterminate' : defaultChecked
          }
          onCheckedChange={(checked) => {
            onChange?.(checked === 'indeterminate' ? null : checked);
          }}
        />
      );
    },
  },

  columnMinWidth: 100,
};
export default function Example() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexFlow: 'row',
      }}
      className="infinite-theme-mode--light"
    >
      <div style={containerStyle} className=" infinite-theme-name--shadcn">
        <DataSource<Order>
          primaryKey="OrderId"
          data={orders.slice(0, 10)}
          selectionMode="multi-row"
          defaultGroupBy={[{ field: 'ShipCountry' }]}
          defaultRowSelection={{
            defaultSelection: false,
            selectedRows: [],
          }}
        >
          <InfiniteTable<Order> {...infiniteProps} />
        </DataSource>
      </div>
      <div
        style={{ ...containerStyle, background: 'white' }}
        className="dark infinite-theme-name--shadcn"
      >
        <DataSource<Order>
          primaryKey="OrderId"
          data={orders.slice(0, 10)}
          defaultGroupBy={[{ field: 'ShipCountry' }]}
          selectionMode="multi-row"
          defaultRowSelection={{
            defaultSelection: false,
            selectedRows: [],
          }}
        >
          <InfiniteTable<Order> {...infiniteProps} />
        </DataSource>
      </div>
    </div>
  );
}
