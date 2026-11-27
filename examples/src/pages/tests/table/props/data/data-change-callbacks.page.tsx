import * as React from 'react';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-react';

import {
  DataKind,
  Row,
  columns,
  createDataChangeLog,
  domProps,
} from './data-change-callbacks.log';

const { handlers, data } = createDataChangeLog();

const kinds: DataKind[] = ['array', 'promise', 'fn'];

export default () => {
  return (
    <>
      {kinds.map((kind) => (
        <DataSource<Row>
          key={kind}
          data={data[kind]}
          primaryKey="id"
          onDataArrayChange={handlers[kind].onDataArrayChange}
          onDataMutations={handlers[kind].onDataMutations}
          onReady={handlers[kind].onReady}
        >
          <InfiniteTable<Row> columns={columns} domProps={domProps} />
        </DataSource>
      ))}
    </>
  );
};
