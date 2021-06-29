import * as React from 'react';

import {
  InfiniteTableColumn,
  InfiniteTableFactory,
  DataSource,
} from '@infinite-table/infinite-react';

import orders from '../../../datasets/orders.json';

interface Order {
  OrderId: number;
  CompanyName: string;
  ItemCount: number;
  OrderCost: number;
  ShipCountry: string;
  ShipVia: string;
}

orders.forEach((order, i) => {
  order.OrderId = i;
});

const Table = InfiniteTableFactory<Order>();

export default () => {
  const [counter, setCounter] = React.useState(0);

  return (
    <React.StrictMode>
      <div>
        <button
          onClick={() => {
            setCounter(counter + 1);
          }}
        >
          update counter
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
        >
          <div>
            <Table
              domProps={{
                style: {
                  margin: '5px',
                  height: '80vh',
                  border: '1px solid gray',
                  position: 'relative',
                },
              }}
              columnDefaultWidth={200}
              columnMinWidth={100}
              columns={
                new Map(
                  [
                    {
                      field: 'OrderId',
                      type: 'number',
                      render: ({ value }: { value: any }) => {
                        return `${value} - ${counter}!`;
                      },
                    },
                    {
                      field: 'CompanyName',
                      flex: 1,
                      id: 'sss',
                    },
                    {
                      field: 'ItemCount',
                      type: 'number',
                      flex: 2,
                      align: 'center',
                    },
                    { field: 'OrderCost', type: 'number' },
                    { field: 'ShipCountry' },
                    { field: 'ShipVia' },
                  ].map((c) => [
                    c.id ?? c.field,
                    c as InfiniteTableColumn<Order>,
                  ]),
                )
              }
            />
          </div>
        </DataSource>
      </div>
    </React.StrictMode>
  );
};
