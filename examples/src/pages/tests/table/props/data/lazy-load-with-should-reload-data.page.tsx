import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

const sinon = require('sinon');

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  salary: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  lastName: { field: 'lastName' },
  country: { field: 'country' },
  salary: { field: 'salary' },
};

const lazyLoad = { batchSize: 50 };
const shouldReloadData = {
  sortInfo: true,
  filterValue: true,
  groupBy: true,
  pivotBy: true,
};

export default function App() {
  return (
    <DataSource<Developer>
      data={spiedDataSource}
      primaryKey="id"
      lazyLoad={lazyLoad}
      shouldReloadData={shouldReloadData}
    >
      <InfiniteTable<Developer>
        columns={columns}
        rowHeight={40}
        scrollStopDelay={10}
        domProps={{
          style: {
            height: '90vh',
          },
        }}
      />
    </DataSource>
  );
}

const dataSource: DataSourceData<Developer> = ({
  lazyLoadStartIndex,
  lazyLoadBatchSize,
  sortInfo,
}) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }
  const args = [
    `start=${lazyLoadStartIndex || 0}`,
    `limit=${lazyLoadBatchSize}`,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?` + args)
    .then((r) => r.json())
    .then((data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(data);
        }, 20);
      });
    });
};

const spiedDataSource = sinon.spy(dataSource);

(globalThis as any).dataSource = spiedDataSource;
