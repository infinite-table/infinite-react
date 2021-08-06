import * as React from 'react';

import {
  DataSource,
  InfiniteTableFactory,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

import { CarSale } from '@examples/datasets/CarSale';
//@ts-ignore
import carsales from '@examples/datasets/carsales';
import { InfiniteTableColumnAggregator } from '@infinite-table/infinite-react/components/InfiniteTable/types/InfiniteTableProps';

const Table = InfiniteTableFactory<CarSale>();

const columns = new Map<string, InfiniteTableColumn<CarSale>>([
  [
    'Group column',
    {
      type: 'number',
      header: 'Group',
      sortable: false,

      render: ({ value, enhancedData }) => {
        return (
          <div
            style={{
              paddingLeft:
                ((enhancedData.groupNesting || 0) +
                  (enhancedData.isGroupRow ? 0 : 1)) *
                30,
            }}
          >
            {enhancedData.groupKeys ? enhancedData.value : value ?? null}
          </div>
        );
      },
    },
  ],

  ['make', { field: 'make' }],
  ['model', { field: 'model' }],
  [
    'cat',
    {
      field: 'category',
      render: ({ value, enhancedData }) => (
        <>{enhancedData.isGroupRow ? 'hello' : value}</>
      ),
    },
  ],
  [
    'count',
    {
      field: 'sales',
      type: 'number',
      render: ({ value, enhancedData }) => {
        if (enhancedData.isGroupRow) {
          console.log(enhancedData);
          return (
            <>
              Total sales <b>{enhancedData.groupKeys?.join(', ')}</b>:{' '}
              <b>{enhancedData.reducerResults![0]}</b>
            </>
          );
        }
        return <>{value}</>;
      },
    },
  ],
  [
    'year',
    {
      field: 'year',
      type: 'number',
      render: ({ value, enhancedData }) => {
        return enhancedData.isGroupRow ? null : `Year: ${value}`;
      },
    },
  ],
]);

// const columnPinning: InfiniteTablePropColumnPinning = new Map([
//   ['id', 'start'],
//   ['make', 'end'],
//   ['cat', 'end'],
// ]);

const sumAggregation: InfiniteTableColumnAggregator<CarSale, number> = {
  initialValue: 0,
  reducer: (a, b) => a + b,
};
const columnAggregations = new Map([
  ['count', sumAggregation],
  // ['model', sumAggregation],
]);
const columnOrder = ['Group column', 'model', 'cat', 'count', 'year'];

(globalThis as any).columnAggregations = columnAggregations;

function App() {
  const [cols, setColumns] = React.useState(columns);
  (globalThis as any).setColumns = setColumns;

  const rowProps = ({
    rowIndex,
    data,
  }: {
    rowIndex: number;
    data: CarSale | null;
  }) => {
    return {
      onClick() {
        console.log('clicked', rowIndex, data);
      },
    };
  };
  return (
    <React.StrictMode>
      <DataSource<CarSale>
        primaryKey="id"
        data={carsales}
        groupBy={['make', 'year']}
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
          columnAggregations={columnAggregations}
          columnDefaultWidth={250}
          columnMinWidth={150}
          columnOrder={columnOrder}
          columns={cols}
          rowProps={rowProps}
          onReady={(api) => {
            (window as any).api = api;
          }}
        />
      </DataSource>
    </React.StrictMode>
  );
}

export default App;
