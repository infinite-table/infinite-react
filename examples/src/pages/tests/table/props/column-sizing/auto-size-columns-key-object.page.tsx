import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  InfiniteTablePropColumnSizing,
} from '@infinite-table/infinite-react';

type Item = {
  id: number;
  name: string;
};

const data: Item[] = Array.from({ length: 500 }, (_, id) => ({
  id,
  name: `Item ${id}`,
}));

const columns: InfiniteTablePropColumns<Item> = {
  id: { field: 'id' },
  name: { field: 'name' },
};

const domProps = {
  style: {
    height: '60vh',
  },
};

export default function DataTestPage() {
  const [key, setKey] = React.useState(0);
  const [columnSizing, setColumnSizing] =
    React.useState<InfiniteTablePropColumnSizing>({});

  const autoSizeColumnsKey = key
    ? { key, columnsToResize: ['id'], includeHeader: false }
    : undefined;

  return (
    <React.StrictMode>
      <button data-name="auto-size" onClick={() => setKey((k) => k + 1)}>
        Auto size
      </button>
      <button
        data-name="set-width"
        onClick={() =>
          setColumnSizing((sizing) => ({ ...sizing, id: { width: 300 } }))
        }
      >
        Set width
      </button>
      <DataSource<Item> data={data} primaryKey="id">
        <InfiniteTable<Item>
          rowHeight={40}
          columnDefaultWidth={200}
          columnMinWidth={20}
          columnSizing={columnSizing}
          onColumnSizingChange={setColumnSizing}
          autoSizeColumnsKey={autoSizeColumnsKey}
          domProps={domProps}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}
