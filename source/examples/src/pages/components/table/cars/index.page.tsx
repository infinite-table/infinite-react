import * as React from 'react';

import {
  DataSource,
  DataSourceAggregationReducer,
  InfiniteTable,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

import { CarSale } from '@examples/datasets/CarSale';
//@ts-ignore
import carsales from '@examples/datasets/carsales';

const columns = new Map<string, InfiniteTableColumn<CarSale>>([
  [
    'Group column',
    {
      type: 'number',
      header: 'Group',
      sortable: false,

      render: ({ value, rowInfo }) => {
        return (
          <div
            style={{
              paddingLeft:
                ((rowInfo.groupNesting || 0) + (rowInfo.isGroupRow ? 0 : 1)) *
                30,
            }}
          >
            {rowInfo.groupKeys ? rowInfo.value : value ?? null}
          </div>
        );
      },
    },
  ],

  ['make', { field: 'make' }],
  ['model', { field: 'model' }],
  ['color', { field: 'color' }],
  [
    'cat',
    {
      field: 'category',
      render: ({ value, rowInfo }) => (
        <>{rowInfo.isGroupRow ? 'hello' : value}</>
      ),
    },
  ],
  [
    'count',
    {
      field: 'sales',
      type: 'number',
      render: ({ value, rowInfo }) => {
        if (rowInfo.isGroupRow) {
          return (
            <>
              Total sales <b>{rowInfo.groupKeys?.join(', ')}</b>:{' '}
              <b>{rowInfo.reducerResults!.count}</b>
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
      render: ({ value, rowInfo }) => {
        return rowInfo.isGroupRow ? null : `Year: ${value}`;
      },
    },
  ],
]);

// const columnPinning: InfiniteTablePropColumnPinning = new Map([
//   ['id', 'start'],
//   ['make', 'end'],
//   ['cat', 'end'],
// ]);

const countAggreation: DataSourceAggregationReducer<CarSale, number> = {
  initialValue: 0,
  reducer: (a) => a + 1,
};
const reducers = { count: countAggreation };
const columnOrder = ['Group column', 'model', 'cat', 'color', 'count', 'year'];

function App() {
  const [cols, setColumns] = React.useState(columns);
  (globalThis as any).setColumns = setColumns;

  const [columnDefaultWidth, setColumnDefaultWidth] = React.useState(400);
  const [columnMinWidth, setColumnMinWidth] = React.useState(200);

  const rowProps = ({
    rowIndex,
    data,
  }: {
    rowIndex: number;
    data: CarSale | Partial<CarSale> | null;
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
          setColumnDefaultWidth(columnDefaultWidth - 100);
          setColumnMinWidth(columnDefaultWidth - 40);
        }}
      >
        change
      </button>
      <DataSource<CarSale>
        primaryKey="id"
        data={carsales}
        groupBy={[{ field: 'make' }, { field: 'year' }]}
        aggregationReducers={reducers}
      >
        <InfiniteTable
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              width: '80vw',
              border: '1px solid rgb(194 194 194 / 45%)',
              position: 'relative',
            },
          }}
          columnDefaultWidth={columnDefaultWidth}
          columnMinWidth={columnMinWidth}
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
