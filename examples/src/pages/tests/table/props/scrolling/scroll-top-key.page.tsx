import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
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
  const [scrollTopKey, setScrollTopKey] = React.useState(0);

  return (
    <React.StrictMode>
      <button
        data-name="scroll-to-top"
        onClick={() => setScrollTopKey((key) => key + 1)}
      >
        Scroll to top
      </button>
      <DataSource<Item> data={data} primaryKey="id">
        <InfiniteTable<Item>
          rowHeight={40}
          scrollTopKey={scrollTopKey}
          domProps={domProps}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}
