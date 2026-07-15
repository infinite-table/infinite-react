import * as React from 'react';

import {
  InfiniteTable,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import {
  type Developer,
  insertData as data,
  insertDataColumns as columns,
  height100DomProps,
} from './common';

const dataSource = () => {
  return new Promise<Developer[]>((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 500);
  });
};
export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer> data={dataSource} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={height100DomProps}
            loadingText={
              <span title="Loading text">Loading developers ...</span>
            }
            columnDefaultWidth={100}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
