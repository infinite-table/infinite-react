import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
  DataSourceData,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import { useState } from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  index: {
    renderValue: ({ rowInfo }) => {
      return `${rowInfo.indexInAll}`;
    },
    defaultFlex: 1,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    header: 'This is my preferred language',
    defaultFlex: 3,
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultFlex: 2,
  },
  age: { field: 'age', defaultWidth: 200 },
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const sinon = require('sinon');

const onColumnSizingChange = sinon.spy((_rowHeight: number) => {});
const onViewportReservedWidthChange = sinon.spy((_width: number) => {});

(globalThis as any).onColumnSizingChange = onColumnSizingChange;
(globalThis as any).onViewportReservedWidthChange =
  onViewportReservedWidthChange;

export default () => {
  const [width, setWidth] = useState(802);
  return (
    <React.StrictMode>
      <>
        <button data-name="inc" onClick={() => setWidth((w) => w + 100)}>
          + 100px
        </button>
        <button data-name="inc" onClick={() => setWidth((w) => w - 100)}>
          - 100px
        </button>
        <DataSource<Developer> data={dataSource} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={{
              style: {
                margin: '5px',
                height: 500,
                width,
                border: '1px solid gray',
                position: 'relative',
              },
            }}
            columnMinWidth={50}
            onColumnSizingChange={(columnSizing) => {
              onColumnSizingChange(columnSizing);
            }}
            onViewportReservedWidthChange={(reservedWidth) => {
              onViewportReservedWidthChange(reservedWidth);
            }}
            columns={columns}
          />
        </DataSource>
      </>
    </React.StrictMode>
  );
};
