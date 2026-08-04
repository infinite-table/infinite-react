import * as React from 'react';

import {
  DataSourceApi,
  InfiniteTable,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import {
  type Developer,
  insertData as data,
  insertDataColumns as columns,
  mark,
  afterMark,
  height100DomProps,
} from './common';

(globalThis as any).mutations = undefined;

export default () => {
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<Developer>>();
  return (
    <>
      <button
        onClick={() => {
          dataSourceApi!.insertDataArray([mark, afterMark], {
            position: 'end',
          });
        }}
      >
        Add 2 items
      </button>

      <React.StrictMode>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          onReady={setDataSourceApi}
        >
          <InfiniteTable<Developer>
            domProps={height100DomProps}
            columnDefaultWidth={100}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
