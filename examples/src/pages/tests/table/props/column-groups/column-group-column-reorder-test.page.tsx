import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumnGroup,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

type TestCols = {
  id: string;
  a1: string;
  b1: string;
  c1: string;
  d1: string;
  a2: string;
  b2: string;
  c2: string;
  d2: string;
  a3: string;
  b3: string;
  c3: string;
  d3: string;
};

const columns: InfiniteTablePropColumns<TestCols> = {
  a1: {
    field: 'a1',
    columnGroup: '1',
  },
  b1: {
    field: 'b1',
    columnGroup: '1',
  },
  c1: {
    field: 'c1',
    columnGroup: '1',
  },
  d1: {
    field: 'd1',
    columnGroup: '1',
  },
  a2: {
    field: 'a2',
    columnGroup: '2',
  },
  b2: {
    field: 'b2',
    columnGroup: '2',
  },
  c2: {
    field: 'c2',
    columnGroup: '2',
  },
  d2: {
    field: 'd2',
    columnGroup: '2',
  },
  a3: {
    field: 'a3',
    columnGroup: '3',
  },
  b3: {
    field: 'b3',
    columnGroup: '3',
  },
  c3: {
    field: 'c3',
    columnGroup: '3',
  },
  d3: {
    field: 'd3',
    columnGroup: '3',
  },
};

const columnGroups: Record<string, InfiniteTableColumnGroup> = {
  1: {
    header: 'One',
  },
  2: {
    header: 'Two',
  },
  3: {
    header: 'Three',
  },
};

export default function Example() {
  const [columnGroupVisibility, setColumnGroupVisibility] = React.useState({
    1: true,
    2: true,
    3: true,
  });
  return (
    <>
      <button
        onClick={() => {
          setColumnGroupVisibility((visibility) => {
            return {
              ...visibility,
              1: !visibility[1],
            };
          });
        }}
      >
        toggle group 1
      </button>
      <button
        onClick={() => {
          setColumnGroupVisibility((visibility) => {
            return {
              ...visibility,
              2: !visibility[2],
            };
          });
        }}
      >
        toggle group 2
      </button>
      <button
        onClick={() => {
          setColumnGroupVisibility((visibility) => {
            return {
              ...visibility,
              3: !visibility[3],
            };
          });
        }}
      >
        toggle group 3
      </button>
      <DataSource<TestCols> primaryKey="id" data={[]}>
        <InfiniteTable<TestCols>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              width: '80vw',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnGroupVisibility={columnGroupVisibility}
          draggableColumnsRestrictTo={'group'}
          columnGroups={columnGroups}
          columns={columns}
          columnDefaultWidth={90}
        />
      </DataSource>
    </>
  );
}
