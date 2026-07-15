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
    }, 500000);
  });
};
export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer> data={dataSource} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={height100DomProps}
            components={{
              LoadMask: () => {
                return (
                  <div
                    title="LoadMask"
                    style={{
                      color: 'magenta',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.4,
                      background: 'white',
                      width: '100%',
                      height: '100%',
                      zIndex: 100,
                    }}
                  >
                    xxx
                  </div>
                );
              },
            }}
            columnDefaultWidth={100}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
