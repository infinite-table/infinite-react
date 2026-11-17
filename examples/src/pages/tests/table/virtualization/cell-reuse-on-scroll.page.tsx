import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Row = {
  id: number;
  name: string;
  value: number;
  code: string;
};

const data: Row[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: i,
  name: `row ${i}`,
  value: i * 2,
  code: `c${i % 997}`,
}));

const columns: InfiniteTablePropColumns<Row> = {
  id: { field: 'id', type: 'number' },
  name: { field: 'name' },
  value: { field: 'value', type: 'number' },
  code: { field: 'code' },
};

const domProps = { style: { height: 600, width: 800 } };

export default function App() {
  return (
    <DataSource<Row> data={data} primaryKey="id">
      <InfiniteTable<Row>
        columns={columns}
        rowHeight={40}
        columnDefaultWidth={150}
        domProps={domProps}
      />
    </DataSource>
  );
}
