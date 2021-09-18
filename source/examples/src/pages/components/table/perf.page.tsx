import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTableColumn,
  InfiniteTablePropColumnPinning,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

interface DataItem {
  id: string;
  [key: string]: string;
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

const getColumns = (count: number) => {
  const columns = new Map<string, InfiniteTableColumn<DataItem>>();
  let i = 0;
  while (columns.size < count) {
    const time = Math.floor(i / alphabet.length);
    const index = i % alphabet.length;
    const colName = alphabet[index] + (time + 1);
    const column: InfiniteTableColumn<DataItem> = {
      field: colName,
      render: ((i: number, { rowIndex, column }: any) => {
        // console.log('render', { rowIndex, columnName: column.id });
        return (
          <span>
            Row {rowIndex}, col {column.field} = {i}
          </span>
        );
      }).bind(null, i),
    };
    columns.set(colName, column);
    i++;
  }
  return columns;
};

const App = () => {
  const [columnCount, setColumnCount] = React.useState(100);
  const [rowHeight, setRowHeight] = React.useState(40);
  const [height, setHeight] = React.useState<number | string | null>(null);
  const columns = React.useMemo(() => {
    return getColumns(columnCount);
  }, [columnCount]);

  const defaultColumnPinning: InfiniteTablePropColumnPinning =
    React.useMemo(() => {
      const ids = Array.from(columns.keys());

      return new Map([
        [ids[0], 'start'],
        [ids[1], 'start'],
        [ids[2], 'end'],
        [ids[3], 'end'],
      ]);
    }, [columns]);

  const [dataSourceCount, setDataSourceCount] = React.useState(100);
  const dataSource = React.useMemo(() => {
    return [...Array(dataSourceCount)].map((_x, rowIndex) => {
      const result = Array.from(columns.values()).reduce(
        (acc: DataItem, col: InfiniteTableColumn<DataItem>) => {
          acc[col.field!] = `${col.field as string}-${rowIndex}`;
          return acc;
        },
        {} as DataItem,
      );

      result.id = `id-${rowIndex}`;

      return result;
    });
  }, [columns, dataSourceCount]);

  const [expanded, setExpanded] = React.useState(true);

  // dataSource.length = 1;
  return (
    <React.StrictMode>
      <div style={{ height: '100%' }}>
        <button onClick={() => setExpanded(!expanded)}>
          {' '}
          Toggle configuration
        </button>
        <div style={{ display: expanded ? 'block' : 'none' }}>
          <div style={{ display: 'flex', flexFlow: 'row' }}>
            <button
              onClick={() => {
                setColumnCount(10);
              }}
            >
              10 cols
            </button>
            <button
              onClick={() => {
                setColumnCount(20);
              }}
            >
              20 cols
            </button>
            <button
              onClick={() => {
                setColumnCount(30);
              }}
            >
              30 cols
            </button>
            <button
              onClick={() => {
                setColumnCount(50);
              }}
            >
              50 cols
            </button>
            <button
              onClick={() => {
                setColumnCount(100);
              }}
            >
              100 cols
            </button>
            <button
              onClick={() => {
                setColumnCount(150);
              }}
            >
              150 cols
            </button>
          </div>
          <div style={{ display: 'flex', flexFlow: 'row' }}>
            <button
              onClick={() => {
                setDataSourceCount(100);
              }}
            >
              100 rows
            </button>
            <button
              onClick={() => {
                setDataSourceCount(1000);
              }}
            >
              1000 rows
            </button>
            <button
              onClick={() => {
                setDataSourceCount(10000);
              }}
            >
              10k rows
            </button>
            <button
              onClick={() => {
                setDataSourceCount(100000);
              }}
            >
              100k rows
            </button>
          </div>
          <div style={{ display: 'flex', flexFlow: 'row' }}>
            <button
              onClick={() => {
                setHeight(300);
              }}
            >
              height=300
            </button>
            <button
              onClick={() => {
                setHeight(200);
              }}
            >
              height=200
            </button>
            <button
              onClick={() => {
                setHeight('60vh');
              }}
            >
              height=60vh
            </button>
            <button
              onClick={() => {
                setHeight('80vh');
              }}
            >
              height=80vh
            </button>
            <button
              onClick={() => {
                setHeight('90vh');
              }}
            >
              height=90vh
            </button>
          </div>
          <div style={{ display: 'flex', flexFlow: 'row' }}>
            <button
              onClick={() => {
                setRowHeight(30);
              }}
            >
              rowHeight=30
            </button>
            <button
              onClick={() => {
                setRowHeight(40);
              }}
            >
              rowHeight=40
            </button>
            <button
              onClick={() => {
                setRowHeight(50);
              }}
            >
              rowHeight=50
            </button>
            <button
              onClick={() => {
                setRowHeight(70);
              }}
            >
              rowHeight=70
            </button>
            <button
              onClick={() => {
                setRowHeight(100);
              }}
            >
              rowHeight=100
            </button>
          </div>
          <p>
            {dataSourceCount} rows, {columnCount} columns, row height 40
          </p>
        </div>
        <DataSource<DataItem>
          data={dataSource}
          primaryKey="id"
          fields={[
            'id',
            ...Array.from(columns.values()).map((c) => c.field as string),
          ]}
        >
          <InfiniteTable<DataItem>
            virtualizeColumns={true}
            domProps={{
              style: {
                margin: '5px',
                height: height || '60vh',
                border: '1px solid gray',
                position: 'relative',
              },
            }}
            defaultColumnPinning={defaultColumnPinning}
            key={rowHeight}
            rowHeight={'--it-row-height'}
            columnDefaultWidth={150}
            columnMinWidth={40}
            columns={columns}
          />
        </DataSource>
      </div>
    </React.StrictMode>
  );
};

export default App;
