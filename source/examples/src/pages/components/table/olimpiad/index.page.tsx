import * as React from 'react';

import {
  DataSource,
  DataSourceAggregationReducer,
  InfiniteTable,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

import { OlimpicWinner } from '@examples/datasets/OlimpicWinner';
//@ts-ignore
import data from '@examples/datasets/olimpiad.json';

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
const sumAggregation: DataSourceAggregationReducer<OlimpicWinner, number> = {
  initialValue: 0,
  field: 'gold',
  reducer: sum,
};
const columnAggregations = { count: sumAggregation };
(globalThis as any).columnAggregations = columnAggregations;

function App() {
  const [cols, setColumns] = React.useState(columns);
  (globalThis as any).setColumns = setColumns;

  return (
    <React.StrictMode>
      <DataSource<OlimpicWinner>
        primaryKey="id"
        data={data as OlimpicWinner[]}
        groupBy={[{ field: 'country' }, { field: 'year' }]}
        aggregationReducers={columnAggregations}
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
          columnDefaultWidth={400}
          columnMinWidth={220}
          columns={cols}
        />
      </DataSource>
    </React.StrictMode>
  );
}

export default App;
