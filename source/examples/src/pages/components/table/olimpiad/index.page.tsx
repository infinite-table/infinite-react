import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

import { OlimpicWinner } from '@examples/datasets/OlimpicWinner';
//@ts-ignore
import data from '@examples/datasets/olimpiad.json';
import { InfiniteTableColumnAggregator } from '@infinite-table/infinite-react/components/InfiniteTable/types';

const columns = new Map<string, InfiniteTableColumn<OlimpicWinner>>([
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

  ['name', { field: 'athlete' }],
  ['age', { field: 'age' }],
  [
    'year',
    {
      field: 'year',
      render: ({ value, rowInfo }) => {
        if (rowInfo.isGroupRow) {
          console.log(rowInfo);
          return (
            <>
              Total <b>{rowInfo.groupKeys?.join(', ')}</b>:{' '}
              <b>{rowInfo.reducerResults![0]} gold medals</b>
            </>
          );
        }
        return <>{value}</>;
      },
    },
  ],
]);

const sum = (a: number, b: number) => a + b;
const sumAggregation: InfiniteTableColumnAggregator<OlimpicWinner, number> = {
  initialValue: 0,
  getter: (data: OlimpicWinner) => {
    return data.gold;
  },
  reducer: sum,
};
const columnAggregations = new Map([
  ['count', sumAggregation],
  // ['model', sumAggregation],
]);

(globalThis as any).columnAggregations = columnAggregations;

function App() {
  const [cols, setColumns] = React.useState(columns);
  (globalThis as any).setColumns = setColumns;

  return (
    <React.StrictMode>
      <DataSource<OlimpicWinner>
        primaryKey="id"
        data={data as OlimpicWinner[]}
        groupRowsBy={[{ field: 'country' }, { field: 'year' }]}
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
          columnAggregations={columnAggregations}
          columnDefaultWidth={400}
          columnMinWidth={220}
          columns={cols}
        />
      </DataSource>
    </React.StrictMode>
  );
}

export default App;
