import {
  InfiniteTable,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import * as React from 'react';

interface DataItem {
  id: string;
  [key: string]: string;
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
const COL_DEFAULT_WIDTH = 150;
const getColumns = (count: number) => {
  const columns: Record<string, InfiniteTableColumn<DataItem>> = {};
  let i = 0;
  while (Object.keys(columns).length < count) {
    const time = Math.floor(i / alphabet.length);
    const index = i % alphabet.length;
    const colName = alphabet[index] + (time + 1);
    const column: InfiniteTableColumn<DataItem> = {
      field: colName,
      // defaultWidth: Math.max(COL_DEFAULT_WIDTH + index, 40),
      render: ((i: number, { rowIndex, column }: any) => {
        return <span>{`Row ${rowIndex}, col ${column.field} = ${i}`}</span>;
      }).bind(null, i),
    };
    columns[colName] = column;
    i++;
  }
  return columns;
};

const btn = `border-1 border-gray-300 rounded px-2 py-1`;

const App = () => {
  const [columnCount, setColumnCount] = React.useState(150);
  const [rowHeight, setRowHeight] = React.useState(40);
  const [height, setHeight] = React.useState<number | string | null>(null);
  const columns = React.useMemo(() => {
    return getColumns(columnCount);
  }, [columnCount]);

  // const defaultColumnPinning: InfiniteTablePropColumnPinning =
  //   React.useMemo(() => {
  //     const ids = Array.from(columns.keys());

  //     return new Map([
  //       [ids[0], 'start'],
  //       [ids[1], 'start'],
  //       [ids[2], 'end'],
  //       [ids[3], 'end'],
  //     ]);
  //   }, [columns]);

  const [dataSourceCount, setDataSourceCount] = React.useState(100);
  const dataSource = React.useMemo(() => {
    return Promise.resolve(
      [...Array(dataSourceCount)].map((_x, rowIndex) => {
        const result = Object.keys(columns).reduce(
          (acc: DataItem, key: string) => {
            const col = columns[key] as InfiniteTableColumn<DataItem>;
            acc[col.field!] = `${col.field as string}-${rowIndex}`;
            return acc;
          },
          {} as DataItem,
        );

        result.id = `id-${rowIndex}`;

        return result as DataItem;
      }),
    );
  }, [columns, dataSourceCount]);

  const [expanded, setExpanded] = React.useState(true);

  // dataSource.length = 1;
  return (
    <div style={{ height: '100%' }}>
      <button className={btn} onClick={() => setExpanded(!expanded)}>
        {' '}
        Toggle configuration
      </button>
      <div style={{ display: expanded ? 'block' : 'none' }}>
        <div style={{ display: 'flex', flexFlow: 'row' }}>
          <button
            className={btn}
            onClick={() => {
              setColumnCount(10);
            }}
          >
            10 cols
          </button>
          <button
            className={btn}
            onClick={() => {
              setColumnCount(20);
            }}
          >
            20 cols
          </button>
          <button
            className={btn}
            onClick={() => {
              setColumnCount(30);
            }}
          >
            30 cols
          </button>
          <button
            className={btn}
            onClick={() => {
              setColumnCount(50);
            }}
          >
            50 cols
          </button>
          <button
            className={btn}
            onClick={() => {
              setColumnCount(100);
            }}
          >
            100 cols
          </button>
          <button
            className={btn}
            onClick={() => {
              setColumnCount(150);
            }}
          >
            150 cols
          </button>
        </div>
        <div style={{ display: 'flex', flexFlow: 'row' }}>
          <button
            className={btn}
            onClick={() => {
              setDataSourceCount(100);
            }}
          >
            100 rows
          </button>
          <button
            className={btn}
            onClick={() => {
              setDataSourceCount(1000);
            }}
          >
            1000 rows
          </button>
          <button
            className={btn}
            onClick={() => {
              setDataSourceCount(10000);
            }}
          >
            10k rows
          </button>
          <button
            className={btn}
            onClick={() => {
              setDataSourceCount(100000);
            }}
          >
            100k rows
          </button>
        </div>
        <div style={{ display: 'flex', flexFlow: 'row' }}>
          <button
            className={btn}
            onClick={() => {
              setHeight(300);
            }}
          >
            height=300
          </button>
          <button
            className={btn}
            onClick={() => {
              setHeight(200);
            }}
          >
            height=200
          </button>
          <button
            className={btn}
            onClick={() => {
              setHeight('60vh');
            }}
          >
            height=60vh
          </button>
          <button
            className={btn}
            onClick={() => {
              setHeight('80vh');
            }}
          >
            height=80vh
          </button>
          <button
            className={btn}
            onClick={() => {
              setHeight('90vh');
            }}
          >
            height=90vh
          </button>
        </div>
        <div style={{ display: 'flex', flexFlow: 'row' }}>
          <button
            className={btn}
            onClick={() => {
              setRowHeight(30);
            }}
          >
            rowHeight=30
          </button>
          <button
            className={btn}
            onClick={() => {
              setRowHeight(40);
            }}
          >
            rowHeight=40
          </button>
          <button
            className={btn}
            onClick={() => {
              setRowHeight(50);
            }}
          >
            rowHeight=50
          </button>
          <button
            className={btn}
            onClick={() => {
              setRowHeight(70);
            }}
          >
            rowHeight=70
          </button>
          <button
            className={btn}
            onClick={() => {
              setRowHeight(100);
            }}
          >
            rowHeight=100
          </button>
        </div>
        <p>
          {dataSourceCount} rows, {columnCount} columns, row height {rowHeight}
        </p>
      </div>
      <DataSource<DataItem> data={dataSource} primaryKey="id">
        <InfiniteTable<DataItem>
          header={false}
          domProps={{
            style: {
              margin: '5px',
              height: height || '60vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          // defaultColumnPinning={defaultColumnPinning}
          key={rowHeight}
          rowHeight={rowHeight}
          columnDefaultWidth={COL_DEFAULT_WIDTH}
          columnMinWidth={40}
          columns={columns}
        />
      </DataSource>
    </div>
  );
};

export default App;
