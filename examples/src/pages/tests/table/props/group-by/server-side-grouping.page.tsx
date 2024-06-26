import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourcePropAggregationReducers,
  DataSourceData,
  InfiniteTablePropColumnPinning,
} from '@infinite-table/infinite-react';
import type {
  InfiniteTablePropColumns,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';
import * as React from 'react';

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
function getDataSource(size: string) {
  const dataSource: DataSourceData<Developer> = ({
    pivotBy,
    aggregationReducers,
    groupBy,

    lazyLoadStartIndex,
    lazyLoadBatchSize,
    groupKeys = [],
  }) => {
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
      process.env.NEXT_PUBLIC_BASE_URL + `/developers${size}-sql?` + args,
    )
      .then((r) => r.json())
      .then(
        (data: Developer[]) =>
          new Promise<Developer[]>((resolve) => {
            setTimeout(() => {
              resolve(data);
            }, 500);
          }),
      );
  };
  return dataSource;
}

const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
  avgSalary: { name: 'Salary (avg)', field: 'salary', reducer: 'avg' },
  // avgAge: { name: 'Age (avg)', field: 'age', reducer: 'avg' },
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

const defaultColumnPinning: InfiniteTablePropColumnPinning = {
  labels: 'start',
};
const domProps = { style: { height: '90vh' } };

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

export default function RemotePivotExample() {
  const groupBy: DataSourceGroupBy<Developer>[] = React.useMemo(
    () => [
      {
        field: 'country',
      },
      {
        field: 'city',
      },
    ],
    [],
  );

  // const pivotBy: DataSourcePivotBy<Developer>[] = React.useMemo(
  //   () => [
  //     { field: 'preferredLanguage' },
  //     // {
  //     //   field: 'country',
  //     //   columnGroup: ({ columnGroup }) => {
  //     //     return {
  //     //       header: `Country${
  //     //         columnGroup.pivotTotalColumnGroup ? ' total' : ''
  //     //       }: ${columnGroup.pivotGroupKey}`,
  //     //     };
  //     //   },
  //     // },
  //     // {
  //     //   field: 'canDesign',
  //     //   // column: ({ column: pivotCol }) => {
  //     //   //   const lastKey = pivotCol.pivotGroupKey;

  //     //   //   return {
  //     //   //     defaultWidth: 500,
  //     //   //     header:
  //     //   //       (lastKey === 'yes' ? '💅 Designer ' : '💻 Non-designer ') +
  //     //   //       pivotCol.pivotAggregator.id,
  //     //   //   };
  //     //   // },
  //     //   // columnGroup: ({ columnGroup: pivotCol }) => {
  //     //   //   const lastKey = pivotCol.pivotGroupKey;

  //     //   //   return {
  //     //   //     header: lastKey === 'yes' ? '💅 Designer' : '💻 Non-designer',
  //     //   //   };
  //     //   // },
  //     // },
  //     {
  //       field: 'canDesign',

  //       column: ({ column }) => ({
  //         header: column.header + '!',
  //       }),
  //     },
  //   ],
  //   [],
  // );

  const [size, setSize] = React.useState('1k');
  const dataSource = React.useMemo(() => {
    return getDataSource(size);
  }, [size]);
  return (
    <>
      <select
        value={size}
        onChange={(e) => {
          setSize(e.target.value);
        }}
      >
        <option value="10">10 items</option>
        <option value="100">100 items</option>
        <option value="1k">1k items</option>
        <option value="10k">10k items</option>
        <option value="50k">50k items</option>
      </select>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        loading={false}
        groupBy={groupBy}
        aggregationReducers={aggregationReducers}
        defaultGroupRowsState={groupRowsState}
        lazyLoad={{ batchSize: 5 }}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <div>
              <InfiniteTable<Developer>
                domProps={domProps}
                scrollStopDelay={10}
                hideEmptyGroupColumns
                defaultColumnPinning={defaultColumnPinning}
                columns={columns}
                pivotColumns={pivotColumns}
                pivotColumnGroups={pivotColumnGroups}
                columnDefaultWidth={220}
              />
            </div>
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
