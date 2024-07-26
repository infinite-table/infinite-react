import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTableColumn,
  DataSource,
  debounce,
  TableRenderRange,
  DataSourceApi,
} from '@infinite-table/infinite-react';

export const columns: Record<string, InfiniteTableColumn<DataItem>> = {};

/**
 * YOU CAN ADJUST THESE VALUES TO TEST DIFFERENT SCENARIOS
 */
const COLUMN_COUNT = 500;
const GENERATED_VALUE_MAX = 10000;
const INITIAL_ROW_COUNT = 10000;
const UPDATE_INTERVAL_MS = 100;
const RENDER_RANGE_CHANGE_DEBOUNCE_MS = 50;

Array.from({ length: COLUMN_COUNT }, (_, i) => {
  columns[`col${i}`] = {
    field: `col${i}`,
  };
});

type DataItem = {
  [key: string]: string;
} & {
  id: number;
};

const domProps = {
  style: { flex: 1, maxHeight: '90vh', maxWidth: '90vw' },
};
const data: DataItem[] = [];

(globalThis as any).currentData = data;

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

function subscribeToRange(
  range: TableRenderRange,
  callback: (updateInfo: {
    rowIndex: number;
    colId: string;
    value: any;
  }) => void,
) {
  const [startRowIndex, startColIndex] = range.start;
  const [endRowIndex, endColIndex] = range.end;

  const intervalId = setInterval(() => {
    const colIndex = getRandomInt(startColIndex, endColIndex);
    const rowIndex = getRandomInt(startRowIndex, endRowIndex);

    callback({
      rowIndex,
      colId: `col${colIndex}`,
      value: getRandomInt(0, GENERATED_VALUE_MAX),
    });
  }, UPDATE_INTERVAL_MS);

  function unsubscribeFromRange() {
    clearInterval(intervalId);

    console.log(
      'unsubscribe from range',
      `[row ${range.start[0]}, col ${range.start[1]}]-[row ${range.end[0]}, col ${range.end[1]}]`,
    );
    console.log('-----');
  }

  console.log(
    'subscribe to range',
    `[row ${range.start[0]}, col ${range.start[1]}]-[row ${range.end[0]}, col ${range.end[1]}]`,
  );

  return unsubscribeFromRange;
}
const Example = () => {
  const [refetchKey, setRefetchKey] = React.useState(0);
  const [count, setCount] = React.useState(INITIAL_ROW_COUNT);

  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<DataItem>>();

  React.useEffect(() => {
    if (isNaN(count)) {
      return;
    }
    data.length = count;
    for (let i = 0; i < count; i++) {
      data[i] = data[i] || {};
      data[i].id = i;
    }

    setRefetchKey((k) => k + 1);
  }, [count]);

  const [renderRange, setRenderRange] = React.useState<TableRenderRange>({
    start: [0, 0],
    end: [0, 0],
  });

  const onRenderRangeChange = React.useMemo(() => {
    return debounce(setRenderRange, { wait: RENDER_RANGE_CHANGE_DEBOUNCE_MS });
  }, []);

  React.useEffect(() => {
    return subscribeToRange(renderRange, ({ rowIndex, colId, value }) => {
      if (rowIndex >= data.length) {
        return;
      }
      dataSourceApi?.updateData({
        id: rowIndex,
        [colId]: value,
      });
    });
  }, [renderRange, count]);

  return (
    <React.StrictMode>
      Change row count
      <select
        defaultValue={count}
        onChange={(e) => setCount(Number(e.target.value))}
      >
        <option value={10}>10</option>
        <option value={100}>100</option>
        <option value={1000}>1000</option>
        <option value={10000}>10000</option>
        <option value={100000}>100000</option>
      </select>
      <DataSource<DataItem>
        primaryKey="id"
        refetchKey={refetchKey}
        data={data}
        onReady={setDataSourceApi}
      >
        <InfiniteTable<DataItem>
          domProps={domProps}
          onRenderRangeChange={onRenderRangeChange}
          columnDefaultWidth={100}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

function App() {
  return <Example />;
}

export default App;
