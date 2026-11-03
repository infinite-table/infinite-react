import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Row = { id: number; name: string };

const rowCount = 200;

const columns: InfiniteTablePropColumns<Row> = {
  id: { field: 'id' },
  name: { field: 'name' },
};

const domProps = {
  style: { height: '80vh' },
};

const lazyLoad = { batchSize: 20 };

const globals = globalThis as any;

// every call of a batch starting at one of these indexes fails
globals.failingBatches = [] as number[];
globals.batchCalls = [] as number[];

const data: DataSourceData<Row> = ({ lazyLoadStartIndex = 0, lazyLoadBatchSize = rowCount }) => {
  globals.batchCalls.push(lazyLoadStartIndex);

  if (globals.failingBatches.includes(lazyLoadStartIndex)) {
    return Promise.reject(new Error(`Rows from ${lazyLoadStartIndex} unavailable`));
  }

  const end = Math.min(lazyLoadStartIndex + lazyLoadBatchSize, rowCount);
  const rows: Row[] = [];
  for (let id = lazyLoadStartIndex; id < end; id++) {
    rows.push({ id, name: `Row ${id}` });
  }
  return Promise.resolve({ data: rows, totalCount: rowCount });
};

export default function App() {
  return (
    <DataSource<Row> primaryKey="id" data={data} lazyLoad={lazyLoad}>
      <InfiniteTable<Row> domProps={domProps} columns={columns} />
    </DataSource>
  );
}
