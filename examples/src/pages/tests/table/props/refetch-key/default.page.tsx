import * as React from 'react';

import {
  DataSourceDataParams,
  InfiniteTable,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import { useState } from 'react';

import { columns, data, type Developer } from './common';

//@ts-ignore
globalThis.dataSourceCalls = 0;
export default () => {
  const [refetchKey, setRefetchKey] = useState(1);

  const dataSource = React.useCallback(
    ({ refetchKey }: DataSourceDataParams<Developer>) => {
      //@ts-ignore
      globalThis.dataSourceCalls += 1;
      return refetchKey && (refetchKey as number) % 2 === 0
        ? data.slice(0, 2)
        : data.slice(0, data.length);
    },
    [],
  );
  return (
    <>
      <React.StrictMode>
        <button onClick={() => setRefetchKey((k) => k + 1)}>refetch</button>
        <DataSource<Developer>
          refetchKey={refetchKey}
          data={dataSource}
          primaryKey="id"
        >
          <InfiniteTable<Developer>
            domProps={{
              style: {
                margin: '5px',
                height: 500,
                width: 1000,
                border: '1px solid gray',
                position: 'relative',
              },
            }}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
