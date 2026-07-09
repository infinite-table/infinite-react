import * as React from 'react';

import {
  InfiniteTable,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

import {
  columns,
  data,
  minHeight500DomProps,
  type Developer,
} from './common';

InfiniteTable.Body.rowHoverClassName.push('hover-row');

export default () => {
  const dataSource = React.useCallback(() => {
    return Promise.resolve(data.slice(0, data.length - 1));
  }, []);

  return (
    <>
      <React.StrictMode>
        <DataSource<Developer> data={dataSource} primaryKey="id">
          <InfiniteTable<Developer>
            columns={columns}
            rowClassName={'custom-row'}
            domProps={minHeight500DomProps}
          ></InfiniteTable>
        </DataSource>
      </React.StrictMode>
    </>
  );
};
