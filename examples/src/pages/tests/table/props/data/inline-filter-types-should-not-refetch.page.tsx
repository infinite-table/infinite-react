import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { useState } from 'react';

const sinon = require('sinon');

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  lastName: { field: 'lastName' },
  country: { field: 'country' },
};

export default function App() {
  const [renderCount, setRenderCount] = useState(0);

  return (
    <>
      <button onClick={() => setRenderCount((count) => count + 1)}>
        Rerender ({renderCount})
      </button>
      <DataSource<Developer>
        data={spiedDataSource}
        primaryKey="id"
        // a new object on every render, with the same content
        filterTypes={{
          custom: {
            label: 'Custom',
            emptyValues: [''],
            defaultOperator: 'eq',
            operators: [{ name: 'eq', fn: () => true }],
          },
        }}
      >
        <InfiniteTable<Developer>
          columns={columns}
          domProps={{
            style: {
              height: '80vh',
            },
          }}
        />
      </DataSource>
    </>
  );
}

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql`).then(
    (r) => r.json(),
  );
};

const spiedDataSource = sinon.spy(dataSource);

(globalThis as any).dataSource = spiedDataSource;
