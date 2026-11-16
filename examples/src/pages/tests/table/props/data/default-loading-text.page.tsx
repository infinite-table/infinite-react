import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';

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

export default function DataTestPage() {
  return (
    <React.StrictMode>
      <DataSource<Developer> data={dataSource} primaryKey="id">
        <InfiniteTable<Developer>
          domProps={height100DomProps}
          columnDefaultWidth={100}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}
