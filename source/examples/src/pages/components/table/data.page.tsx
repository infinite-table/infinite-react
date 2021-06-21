import * as React from 'react';

import {
  InfiniteTableColumn,
  InfiniteTableFactory,
} from '@src/components/Table';
import DataSource from '@src/components/DataSource';

import orders from '../../../datasets/orders.json';
import { useRef } from 'react';
// import { DataSourceSortInfo } from '@src/components/DataSource/types';
// import { useState } from 'react';

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

const columns = new Map<string, InfiniteTableColumn<Order>>([
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
      flex: 1,
      maxWidth: 400,
    },
  ],
  [
    'ItemCount',
    {
      field: 'ItemCount',
      type: 'number',
      align: 'center',
    },
  ],
  ['OrderCost', { field: 'OrderCost', type: 'number' }],
  ['ShipCountry', { field: 'ShipCountry', header: () => 'country' }],
  ['ShipVia', { field: 'ShipVia', header: () => 'via' }],
]);

export default () => {
  // const [_state, _dispatch] = React.useReducer(
  //   (state: any, action: any) => {
  //     const res = {
  //       ...state,
  //       name: action.type,
  //     };

  //     console.log({ state, res, action });
  //     return res;
  //   },
  //   {
  //     name: 'x',
  //   }
  // );
  const [counter, setCounter] = React.useState(0);

  const counterRef = useRef<number>(counter);
  counterRef.current = counter;
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
          onSortInfoChange={(sortInfo) => {
            console.log(sortInfo);
            // setSortInfo(sortInfo);
          }}
        >
          <div>
            {' '}
            counter = {counter}
            <Table
              domProps={{
                style: {
                  margin: '5px',
                  height: '80vh',
                  border: '1px solid gray',
                  position: 'relative',
                },
              }}
              rowHeight={60}
              columnDefaultWidth={100}
              columnMinWidth={100}
              columns={columns}
            />
          </div>
        </DataSource>
      </div>
    </React.StrictMode>
  );
};
