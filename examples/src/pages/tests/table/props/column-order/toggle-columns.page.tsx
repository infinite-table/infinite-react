import * as React from 'react';
import { useState } from 'react';

import {
  DataSource,
  InfiniteTable,
  InfiniteTablePropColumnOrder,
} from '@infinite-table/infinite-react';

import { rowData, Car } from './rowData';
import { columns } from './columns';

const defaultColumnOrder = ['id', 'make', 'year', 'price'];
// rowData.length = 1;

const App = () => {
  const [columnOrder, setColumnOrder] =
    useState<InfiniteTablePropColumnOrder>(defaultColumnOrder);
  return (
    <React.StrictMode>
      <div>
        <button
          onClick={() => {
            if (Array.isArray(columnOrder) && columnOrder.length > 2) {
              setColumnOrder(['id', 'make']);
            } else {
              setColumnOrder(['id', 'make', 'year', 'price']);
            }
          }}
        >
          TOGGLE COLUMNS
        </button>
      </div>
      <DataSource<Car> primaryKey="id" data={rowData}>
        <InfiniteTable<Car>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              width: '50vw',
              border: '1px solid rgb(194 194 194 / 45%)',
              position: 'relative',
            },
          }}
          columnOrder={columnOrder}
          columnDefaultWidth={250}
          columnMinWidth={150}
          columns={columns}
          onColumnOrderChange={setColumnOrder}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
