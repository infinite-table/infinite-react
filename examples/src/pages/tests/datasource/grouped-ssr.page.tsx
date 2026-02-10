import * as React from 'react';

import {
  DataSource,
  DataSourceData,
  useDataSourceSelector,
} from '@infinite-table/infinite-react';

const Cmp = () => {
  const { dataArray, loading } = useDataSourceSelector((ctx) => {
    return {
      dataArray: ctx.dataSourceState.dataArray,
      loading: ctx.dataSourceState.loading,
    };
  });

  return (
    <div>
      {loading ? 'loading' : null}
      {loading
        ? null
        : dataArray.map((d) => d.data?.country || 'loading').join(', ')}
    </div>
  );
};

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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql?` + args)
    .then((r) => r.json())
    .then((data) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(data), 1000);
      });
    });
};

export default () => {
  const lazyLoad = React.useMemo(() => ({ batchSize: 5 }), []);
  return (
    <DataSource<Developer>
      data={dataSource}
      primaryKey="id"
      lazyLoad={lazyLoad}
    >
      <Cmp />
    </DataSource>
  );
};
