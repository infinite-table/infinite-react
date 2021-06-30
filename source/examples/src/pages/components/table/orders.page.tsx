import * as React from 'react';

import {
  InfiniteTableFactory,
  DataSource,
} from '@infinite-table/infinite-react';

import orders from '../../../datasets/orders.json';
import {
  InfiniteTableColumn,
  InfiniteTableComputedColumn,
} from '@infinite-table/infinite-react';
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

orders.length = 2;
console.log(orders.length);

const Table = InfiniteTableFactory<Order>();

function header<T>({ column }: { column: InfiniteTableComputedColumn<T> }) {
  // console.log('render ', column.computedVisibleIndex);
  return `${column.id} ${column.computedVisibleIndex}`;
}

const OrdersPage = () => {
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

  const columnsMap = new Map(
    [
      {
        field: 'OrderId',
        type: 'number',
        header,
        render: ({ value }: { value: any }) => {
          return `${value} - ${counterRef.current}!`;
        },
      },
      {
        field: 'CompanyName',
        flex: 1,
        id: 'companyname',
      },
      // {
      //   field: 'ItemCount',
      //   type: 'number',
      //   id: 'ic1',
      //   align: 'center',
      // },
      // {
      //   field: 'ItemCount',
      //   type: 'number',
      //   id: 'ic2',
      //   align: 'center',
      // },
      // {
      //   field: 'ItemCount',
      //   type: 'number',
      //   id: 'ic3',
      //   align: 'center',
      // },
      // {
      //   field: 'ItemCount',
      //   type: 'number',
      //   id: 'ic4',
      //   align: 'center',
      // },
      // {
      //   field: 'ItemCount',
      //   type: 'number',
      //   id: 'ic5',
      //   align: 'center',
      // },
      // {
      //   field: 'ItemCount',
      //   type: 'number',
      //   id: 'ic6',
      //   align: 'center',
      // },
      // {
      //   field: 'ItemCount',
      //   type: 'number',
      //   id: 'ic7',
      //   align: 'center',
      // },
      // { field: 'OrderCost', type: 'number' },
      // { id: 'oc1', field: 'OrderCost', type: 'number' },
      // { id: 'oc2', field: 'OrderCost', type: 'number' },
      // { id: 'oc3', field: 'OrderCost', type: 'number' },
      // { id: 'oc4', field: 'OrderCost', type: 'number' },
      // { id: 'oc5', field: 'OrderCost', type: 'number' },
      // { id: 'oc6', field: 'OrderCost', type: 'number' },
      // { id: 'oc7', field: 'OrderCost', type: 'number' },
      // { id: 'oc8', field: 'OrderCost', type: 'number' },
      // { id: 'oc9', field: 'OrderCost', type: 'number' },
      // { id: 'oc10', field: 'OrderCost', type: 'number' },
      // { id: 'oc11', field: 'OrderCost', type: 'number' },
      // { id: 'oc12', field: 'OrderCost', type: 'number' },
      // { id: 'oc13', field: 'OrderCost', type: 'number' },
      // { field: 'ShipCountry', header: () => 'country' },
      // { field: 'ShipVia', header: () => 'via' },
    ]
      .map((c) => {
        c.header = header;
        (c as any).render = ({
          column,
          rowIndex,
        }: {
          column: InfiniteTableComputedColumn<Order>;
          rowIndex: number;
        }) => {
          // console.log(
          //   'render',
          //   rowIndex,
          //   'col',
          //   column.computedVisibleIndex,
          // );
          return `${rowIndex}-${column.computedVisibleIndex}`;
        };
        return c as InfiniteTableColumn<Order>;
      })
      .map((col) => {
        return [(col as any).id ?? col.field, col];
      }),
  );
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
              columns={columnsMap}
            />
          </div>
        </DataSource>
      </div>
    </React.StrictMode>
  );
};

export default OrdersPage;
