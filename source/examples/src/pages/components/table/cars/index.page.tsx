import * as React from 'react';

import {
  DataSource,
  InfiniteTableFactory,
  InfiniteTableColumn,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnPinning,
} from '@src/index';

import { rowData, Car } from './rowData';
import { useState } from 'react';

const Table = InfiniteTableFactory<Car>();

const columns = new Map<string, InfiniteTableColumn<Car>>([
  [
    'id',
    {
      field: 'id',
      render: ({ value, enhancedData }) => {
        return enhancedData.isGroupRow
          ? JSON.stringify(enhancedData.groupKeys)
          : `${value}`;
      },
    },
  ],
  [
    'make',
    {
      field: 'make',
      // render: ({ value }) => <input value={value as string} />,
    },
  ],
  [
    'model',
    {
      field: 'model',
      // render: ({ value }) => <input value={value as string} />,
      // draggable: false,
      // name: 'NOT DRAGGABLE This is a long name for the model',
    } as InfiniteTableColumn<Car>,
  ],
  ['price', { field: 'price', name: 'Price' }],
  [
    'year',
    {
      field: 'year',
      // flex: 1,
      header: ({ column }) => {
        const dir = column.computedSortInfo?.dir;
        return (
          <>
            Year{' '}
            {dir === 1 ? ' - ascending' : dir === -1 ? ' - descending' : ''}
          </>
        );
      },
    },
  ],
  ['rating', { field: 'rating' }],
]);

(globalThis as any).columns = columns;

const defaultColumnOrder = ['id', 'make', 'model', 'year', 'price'];

const columnPinning: InfiniteTablePropColumnPinning = new Map([
  ['id', 'start'],
  ['make', 'end'],
  ['price', 'end'],
]);

const App = () => {
  const [cols, setColumns] = React.useState(columns);
  (globalThis as any).setColumns = setColumns;

  const [columnOrder, setColumnOrder] =
    useState<InfiniteTablePropColumnOrder>(defaultColumnOrder);
  const rowProps = ({
    rowIndex,
    data,
  }: {
    rowIndex: number;
    data: Car | null;
  }) => {
    return {
      onClick() {
        console.log('clicked', rowIndex, data);
      },
    };
  };
  return (
    <React.StrictMode>
      <button
        onClick={() => {
          setColumnOrder(['id', 'make']);
        }}
      >
        set cols: id, make
      </button>
      <DataSource<Car>
        primaryKey="id"
        defaultGroupBy={['make', 'year']}
        data={rowData}
        fields={['id', 'make', 'model', 'price']}
      >
        <Table
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              width: '80vw',
              border: '1px solid rgb(194 194 194 / 45%)',
              position: 'relative',
            },
          }}
          columnPinning={columnPinning}
          columnOrder={columnOrder}
          columnDefaultWidth={250}
          columnMinWidth={150}
          columns={cols}
          rowProps={rowProps}
          onColumnOrderChange={(columnOrder) => {
            console.log(columnOrder, 'is the new col order');

            setColumnOrder(columnOrder);
          }}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
