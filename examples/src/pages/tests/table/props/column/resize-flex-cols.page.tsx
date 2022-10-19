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
    renderMenuIcon: false,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    header: 'This is my preferred language',
    defaultFlex: 3,
    renderMenuIcon: false,
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultFlex: 2,
    renderMenuIcon: false,
  },
  age: { field: 'age', defaultWidth: 200, renderMenuIcon: false },
};

const dataSource: DataSourceData<Developer> = ({}) => {
  const url = process.env.NEXT_PUBLIC_BASE_URL + `/developers10-sql`;
  console.log('fetching', url);
  return fetch(url)
    .then((r) => r.json())
    .then((data: Developer[]) => {
      console.log('got response from', url, 'of lenfth', data.length);
      return data;
    });
};

const sinon = require('sinon');

const onColumnSizingChange = sinon.spy((_rowHeight: number) => {});
const onViewportReservedWidthChange = sinon.spy((_width: number) => {});

(globalThis as any).onColumnSizingChange = onColumnSizingChange;
(globalThis as any).onViewportReservedWidthChange =
  onViewportReservedWidthChange;

const initialWidth = ((globalThis as any).initialWidth = 802);
export default () => {
  const [width, setWidth] = useState(initialWidth);
  return (
    <React.StrictMode>
      <>
        <button data-name="inc" onClick={() => setWidth((w) => w + 100)}>
          + 100px
        </button>
        <button data-name="inc" onClick={() => setWidth((w) => w - 100)}>
          - 100px
        </button>
        <label
          style={{ color: 'magenta' }}
          data-name="label"
          data-value={width}
        >
          current width: {width}
        </label>
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
