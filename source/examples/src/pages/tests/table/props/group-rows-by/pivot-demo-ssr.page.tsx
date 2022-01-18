import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourcePropAggregationReducers,
  DataSourceData,
} from '@infinite-table/infinite-react';

import type {
  InfiniteTableColumn,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  DataSourceGroupBy,
  DataSourcePivotBy,
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

const dataSource: DataSourceData<Developer> = ({
  pivotBy,
  aggregationReducers,
  groupBy,
  groupIndex = 0,
}) => {
  const args = [
    pivotBy
      ? 'pivotBy=' + JSON.stringify(pivotBy.map((p) => ({ field: p.field })))
      : null,
    groupBy
      ? 'groupBy=' +
        JSON.stringify([groupBy[groupIndex]].map((p) => ({ field: p.field })))
      : null,
    aggregationReducers
      ? 'reducers=' +
        JSON.stringify(
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            name: aggregationReducers[key].name,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(process.env.NEXT_PUBLIC_DATAURL + '/developers10-sql?' + args)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
  initialValue: 0,
  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => Math.floor(arr.length ? sum / arr.length : 0),
};

const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
  salary: { name: 'avg', field: 'salary', ...avgReducer },
  age: { name: 'avg', field: 'age', ...avgReducer },
};

const columns: InfiniteTablePropColumns<Developer> = new Map<
  string,
  InfiniteTableColumn<Developer>
>([
  ['preferredLanguage', { field: 'preferredLanguage' }],
  ['age', { field: 'age' }],
  [
    'salary',
    {
      field: 'salary',
      type: 'number',

      // render: ({ rowInfo, data }) => {
      //   return rowInfo.isGroupRow ? rowInfo.collapsed : data.age;
      // },
    },
  ],
  ['canDesign', { field: 'canDesign' }],
  ['country', { field: 'country' }],
  ['firstName', { field: 'firstName' }],
  ['stack', { field: 'stack' }],
  ['id', { field: 'id' }],
  ['hobby', { field: 'hobby' }],
  ['city', { field: 'city' }],
  ['currency', { field: 'currency' }],
]);

const domProps = { style: { height: '100vh' } };

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

export default function GroupByExample() {
  const groupBy: DataSourceGroupBy<Developer>[] = React.useMemo(
    () => [
      {
        field: 'preferredLanguage',
      },
      { field: 'stack' },
    ],
    [],
  );

  const pivotBy: DataSourcePivotBy<Developer>[] = React.useMemo(
    () => [
      // { field: 'currency' },
      {
        field: 'country',
        columnGroup: ({ columnGroup }) => {
          return {
            header: `Country${
              columnGroup.pivotTotalColumnGroup ? ' total' : ''
            }: ${columnGroup.pivotGroupKey}`,
          };
        },
      },
      {
        field: 'canDesign',
        // column: ({ column: pivotCol }) => {
        //   const lastKey = pivotCol.pivotGroupKey;

        //   return {
        //     defaultWidth: 500,
        //     header:
        //       (lastKey === 'yes' ? '💅 Designer ' : '💻 Non-designer ') +
        //       pivotCol.pivotAggregator.id,
        //   };
        // },
        // columnGroup: ({ columnGroup: pivotCol }) => {
        //   const lastKey = pivotCol.pivotGroupKey;

        //   return {
        //     header: lastKey === 'yes' ? '💅 Designer' : '💻 Non-designer',
        //   };
        // },
      },
    ],
    [],
  );

  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={groupBy}
        pivotBy={pivotBy}
        aggregationReducers={aggregationReducers}
        defaultGroupRowsState={groupRowsState}
        fullLazyLoad
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              domProps={domProps}
              columns={columns}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              columnDefaultWidth={220}
            />
          );
        }}
      </DataSource>
      {/* <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={groupBy}
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          columnDefaultWidth={180}
          columnAggregations={columnAggregations}
        />
      </DataSource> */}
    </>
  );
}
