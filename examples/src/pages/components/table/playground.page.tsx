import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';

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

export default () => {
  const [counter, setCounter] = React.useState(0);

  return (
    <React.StrictMode>
      <div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={() => {
            setCounter(counter + 1);
          }}
        >
          update counter
        </button>
        <DataSource<Order> data={orders} primaryKey="OrderId">
          <div>
            <InfiniteTable<Order>
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
              columns={{
                OrderId: {
                  field: 'OrderId',
                  type: 'number',
                  render: ({ value }: { value: any }) => {
                    return `${value} - ${counter}!`;
                  },
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
              }}
            />
          </div>
        </DataSource>
      </div>
    </React.StrictMode>
  );
};
