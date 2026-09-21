import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
  DataSource,
} from '@infinite-table/infinite-react';

type Row = {
  id: number;
  label: string;
  a: number;
  b: number;
  c: number;
};

const data: Row[] = [...new Array(10)].map((_, i) => ({
  id: i,
  label: `Row ${i}`,
  a: i,
  b: i * 2,
  c: i * 3,
}));

/**
 * The fixed columns alone (3 x 200) exceed the grid width (500), so the only
 * flex column (`label`) is stuck at the min width and has no space to flex
 * into. Resizing it has to give it a fixed width - a flex value cannot
 * represent the requested size in this state.
 */
const columns: InfiniteTablePropColumns<Row> = {
  label: { field: 'label', defaultFlex: 1, renderMenuIcon: false },
  a: { field: 'a', defaultWidth: 200, renderMenuIcon: false },
  b: { field: 'b', defaultWidth: 200, renderMenuIcon: false },
  c: { field: 'c', defaultWidth: 200, renderMenuIcon: false },
};

const sinon = require('sinon');

const onColumnSizingChange = sinon.spy((_columnSizing: any) => {});

(globalThis as any).onColumnSizingChange = onColumnSizingChange;

export default () => {
  return (
    <React.StrictMode>
      <DataSource<Row> data={data} primaryKey="id">
        <InfiniteTable<Row>
          domProps={{
            style: {
              margin: '5px',
              height: 400,
              width: 500,
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnMinWidth={50}
          onColumnSizingChange={(columnSizing) => {
            onColumnSizingChange(columnSizing);
          }}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};
