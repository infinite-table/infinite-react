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
    'id',
    {
      field: 'id',
      type: 'number',
      header: 'Identifier',
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
  ['cat', { field: 'category' }],
  ['count', { field: 'sales', type: 'number' }],
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
const columnAggregations = new Map([['sales', sumAggregation]]);

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
        defaultGroupBy={['make', 'year']}
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
          columns={cols}
          rowProps={rowProps}
        />
      </DataSource>
    </React.StrictMode>
  );
}

export default App;
