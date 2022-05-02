import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { useMemo } from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  salary: { field: 'salary' },
  age: { field: 'age' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  lastName: { field: 'lastName' },
  country: { field: 'country' },
  city: { field: 'city' },
  currency: { field: 'currency' },
  stack: { field: 'stack' },
  canDesign: { field: 'canDesign' },
};

export default function App() {
  const lazyLoad = useMemo(() => ({ batchSize: 40 }), []);
  return (
    <DataSource<Developer>
      data={dataSource}
      primaryKey="id"
      lazyLoad={lazyLoad}>
      <InfiniteTable<Developer> columns={columns} />
    </DataSource>
  );
}

const dataSource: DataSourceData<Developer> = ({
  pivotBy,
  aggregationReducers,
  groupBy,

  lazyLoadStartIndex,
  lazyLoadBatchSize,
  groupKeys = [],
  sortInfo,
}) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }
  const startLimit: string[] = [];
  if (lazyLoadBatchSize && lazyLoadBatchSize > 0) {
    const start = lazyLoadStartIndex || 0;
    startLimit.push(`start=${start}`);
    startLimit.push(`limit=${lazyLoadBatchSize}`);
  }
  const args = [
    ...startLimit,
    pivotBy
      ? 'pivotBy=' +
        JSON.stringify(
          pivotBy.map((p) => ({ field: p.field }))
        )
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' +
        JSON.stringify(
          groupBy.map((p) => ({ field: p.field }))
        )
      : null,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s) => ({
            field: s.field,
            dir: s.dir,
          }))
        )
      : null,
    aggregationReducers
      ? 'reducers=' +
        JSON.stringify(
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            id: key,
            name: aggregationReducers[key].reducer,
          }))
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/developers10k-sql?` +
      args
  ).then((r) => r.json());
};
