import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  InfiniteTablePropColumns,
  DataSourceProps,
} from '@infinite-table/infinite-react';
import * as React from 'react';
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
  country: { field: 'country', header: 'Country' },
  id: { field: 'id', header: 'ID', defaultWidth: 100 },
  salary: {
    field: 'salary',
    header: 'Salary',
    renderValue: ({ value, rowInfo }) => {
      if (rowInfo.isGroupRow) {
        return (
          <>
            Avg: <b>{value}</b>
          </>
        );
      }
      return value;
    },
  },
  age: { field: 'age', header: 'Age' },
  firstName: { field: 'firstName', header: 'First Name' },
  preferredLanguage: {
    field: 'preferredLanguage',
    header: 'Preferred Language',
  },
  lastName: { field: 'lastName', header: 'Last Name' },

  city: { field: 'city', header: 'City' },
  currency: { field: 'currency', header: 'Currency' },
  stack: { field: 'stack', header: 'Stack' },
  canDesign: { field: 'canDesign', header: 'Can Design' },
  hobby: { field: 'hobby', header: 'Hobby' },
};

const groupBy: DataSourceProps<Developer>['groupBy'] = [
  {
    field: 'country',
  },
  {
    field: 'stack',
  },
];

const aggregationReducers: DataSourceProps<Developer>['aggregationReducers'] = {
  salary: {
    field: 'salary',
    reducer: 'avg',
  },
};

export default function App() {
  const lazyLoad = useMemo(() => ({ batchSize: 40 }), []);
  return (
    <DataSource<Developer>
      data={dataSource}
      primaryKey="id"
      groupBy={groupBy}
      lazyLoad={lazyLoad}
      aggregationReducers={aggregationReducers}
    >
      <InfiniteTable<Developer>
        columns={columns}
        columnDefaultWidth={130}
        groupColumn={{
          id: 'group-col',
          defaultSortable: false,
        }}
        groupRenderStrategy="single-column"
      />
    </DataSource>
  );
}

const dataSource: DataSourceData<Developer> = ({
  pivotBy,
  aggregationReducers,
  groupBy,

  lazyLoadStartIndex,
  lazyLoadBatchSize,
  groupRowsState,
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
    `prefetchGroupKeys=${JSON.stringify(groupRowsState?.expandedRows || [])}`,
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
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql?` + args,
  ).then((r) => r.json());
};
