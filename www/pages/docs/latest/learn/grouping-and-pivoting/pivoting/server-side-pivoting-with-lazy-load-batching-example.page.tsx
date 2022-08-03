import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  InfiniteTablePropColumns,
  GroupRowsState,
  DataSourceGroupBy,
  DataSourcePropAggregationReducers,
  DataSourcePivotBy,
  InfiniteTableColumn,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropGroupColumn,
} from '@infinite-table/infinite-react';

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

const aggregationReducers: DataSourcePropAggregationReducers<Developer> =
  {
    salary: {
      name: 'Salary (avg)',
      field: 'salary',
      reducer: 'avg',
    },
    age: {
      name: 'Age (avg)',
      field: 'age',
      reducer: 'avg',
    },
  };

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  age: { field: 'age' },

  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const numberFormat = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
});
const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const groupColumn: InfiniteTablePropGroupColumn<Developer> =
  {
    id: 'group-col',
    // while loading, we can render a custom loading icon
    renderGroupIcon: ({ renderBag: { groupIcon }, data }) =>
      !data ? '🤷‍' : groupIcon,
    // while we have no data, we can render a placeholder
    renderValue: ({ data, value }) =>
      !data ? ' Loading...' : value,
  };

const columnPinning: InfiniteTablePropColumnPinning = {
  'group-col': 'start',
};

const pivotColumnWithFormatter = ({
  column,
}: {
  column: InfiniteTableColumn<Developer>;
}) => {
  return {
    ...column,
    renderValue: ({ value }: { value: any }) =>
      value ? numberFormat.format(value as number) : 0,
  };
};
export default function RemotePivotExample() {
  const groupBy: DataSourceGroupBy<Developer>[] =
    React.useMemo(
      () => [
        {
          field: 'country',
        },
        { field: 'city' },
      ],
      []
    );

  const pivotBy: DataSourcePivotBy<Developer>[] =
    React.useMemo(
      () => [
        {
          field: 'preferredLanguage',
          // for totals columns
          column: pivotColumnWithFormatter,
        },
        {
          field: 'canDesign',
          columnGroup: ({ columnGroup }) => {
            return {
              ...columnGroup,
              header:
                columnGroup.pivotGroupKey === 'yes'
                  ? 'Designer 💅'
                  : 'Non-Designer 💻',
            };
          },
          column: pivotColumnWithFormatter,
        },
      ],
      []
    );

  const lazyLoad = React.useMemo(
    () => ({ batchSize: 10 }),
    []
  );
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={dataSource}
      groupBy={groupBy}
      pivotBy={pivotBy.length ? pivotBy : undefined}
      aggregationReducers={aggregationReducers}
      defaultGroupRowsState={groupRowsState}
      lazyLoad={lazyLoad}>
      {({ pivotColumns, pivotColumnGroups }) => {
        return (
          <InfiniteTable<Developer>
            scrollStopDelay={10}
            columnPinning={columnPinning}
            columns={columns}
            groupColumn={groupColumn}
            groupRenderStrategy="single-column"
            columnDefaultWidth={220}
            pivotColumns={pivotColumns}
            pivotColumnGroups={pivotColumnGroups}
          />
        );
      }}
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
      `/developers30k-sql?` +
      args
  ).then((r) => r.json());
};
