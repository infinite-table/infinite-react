import {
  InfiniteTable,
  DataSourceData,
  InfiniteTablePropColumns,
  DataSourceProps,
  DataSource,
  useDataSourceSelector,
} from '@infinite-table/infinite-react';
import * as React from 'react';

const sinon = require('sinon');

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
      ? 'pivotBy=' + JSON.stringify(pivotBy.map((p) => ({ field: p.field })))
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' + JSON.stringify(groupBy.map((p) => ({ field: p.field })))
      : null,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,
    aggregationReducers
      ? 'reducers=' +
        JSON.stringify(
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            id: key,
            name: aggregationReducers[key].reducer,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql?` + args)
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

function Cmp() {
  const { dataArrayLength } = useDataSourceSelector((ctx) => {
    return {
      dataArrayLength: ctx.dataSourceState.dataArray.length,
      loading: ctx.dataSourceState.loading,
    };
  });
  (globalThis as any).dataArrayLength = dataArrayLength;
  return null;
}

export default function App() {
  const dataSourceProps: DataSourceProps<Developer> = {
    data: spiedDataSource,
    primaryKey: 'id',
    groupBy: [{ field: 'country' }],
    lazyLoad: { batchSize: 50 },
  };

  (globalThis as any).dataSource = spiedDataSource;

  return (
    <>
      <button
        onClick={() => {
          (globalThis as any).api.scrollRowIntoView(50, {
            scrollAdjustPosition: 'start',
          });
        }}
      >
        Scroll to row 50
      </button>
      <DataSource {...dataSourceProps}>
        <InfiniteTable<Developer>
          columns={columns}
          rowHeight={40}
          scrollStopDelay={10}
          onReady={({ api }) => {
            (globalThis as any).api = api;
          }}
          domProps={{
            style: {
              height: '90vh',
            },
          }}
        />
        <Cmp />
      </DataSource>
    </>
  );
}
