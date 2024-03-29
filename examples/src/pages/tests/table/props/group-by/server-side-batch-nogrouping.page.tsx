import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  InfiniteTablePropColumns,
  GroupRowsState,
  DataSourcePropAggregationReducers,
  // InfiniteTableColumn,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropGroupColumn,
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

const domProps = {
  style: {
    height: '80vh',
  },
};
const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
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
  preferredLanguage: {
    field: 'preferredLanguage',
  },
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

// const numberFormat = new Intl.NumberFormat(undefined, {
//   style: 'currency',
//   currency: 'USD',
// });
const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const groupColumn: InfiniteTablePropGroupColumn<Developer> = {
  id: 'group-col',
  // while loading, we can render a custom loading icon
  // renderGroupIcon: ({ groupIcon, data }) => (!data ? '🤷‍' : groupIcon),
  // // while we have no data, we can render a placeholder
  // renderValue: ({ data, value }) => (!data ? ' Loading...' : value),
  // renderGroupIcon: ({ rowInfo, value, groupIcon }) => {
  //   if (!rowInfo.dataSourceHasGrouping) {
  //     return null;
  //   }

  //   let pre = '';

  //   if (!rowInfo.selfLoaded) {
  //     pre = '...';
  //   } else {
  //     if (rowInfo.childrenLoading) {
  //       pre = 'loading';
  //     } else if (!rowInfo.childrenRequested) {
  //       pre = 'not loaded';
  //     } else if (
  //       rowInfo.directChildrenLoadedCount < rowInfo.directChildrenCount
  //     ) {
  //       pre = ' more to load';
  //     }
  //   }
  //   // const pre = !rowInfo.selfLoaded
  //   //   ? '...'
  //   //   : !rowInfo.childrenRequested
  //   //   ? 'never loaded'
  //   //   : rowInfo.childrenLoading
  //   //   ? 'x.x.x.'
  //   //   : rowInfo.directChildrenLoadedCount < rowInfo.directChildrenCount
  //   //   ? ' more to load'
  //   //   : null;

  //   return (
  //     <>
  //       {pre}
  //       {groupIcon}
  //     </>
  //   );
  // },
};

const columnPinning: InfiniteTablePropColumnPinning = {
  'group-col': 'start',
};

// const pivotColumnWithFormatter = ({
//   column,
// }: {
//   column: InfiniteTableColumn<Developer>;
// }) => {
//   return {
//     ...column,
//     renderValue: ({ value }: { value: any }) =>
//       value ? numberFormat.format(value as number) : 0,
//   };
// };

console.log('env var for tests', process.env.NEXT_PUBLIC_BASE_URL);
export default function RemotePivotExample() {
  const lazyLoad = React.useMemo(() => ({ batchSize: 5 }), []);
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={dataSource}
      aggregationReducers={aggregationReducers}
      defaultGroupRowsState={groupRowsState}
      lazyLoad={lazyLoad}
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        scrollStopDelay={250}
        columnPinning={columnPinning}
        columns={columns}
        groupColumn={groupColumn}
        groupRenderStrategy="single-column"
        columnDefaultWidth={220}
      />
    </DataSource>
  );
}

const dataSource: DataSourceData<Developer> = ({
  pivotBy,

  lazyLoadStartIndex,
  lazyLoadBatchSize,

  groupRowsState,
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
  console.log({ groupRowsState });
  const args = [
    ...startLimit,
    pivotBy
      ? 'pivotBy=' + JSON.stringify(pivotBy.map((p) => ({ field: p.field })))
      : null,
    // `groupKeys=${JSON.stringify(groupKeys)}`,
    // groupBy
    //   ? 'groupBy=' + JSON.stringify(groupBy.map((p) => ({ field: p.field })))
    //   : null,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,
    groupRowsState
      ? 'expandedRows=' + JSON.stringify(groupRowsState.expandedRows)
      : null,
    // aggregationReducers
    //   ? 'reducers=' +
    //     JSON.stringify(
    //       Object.keys(aggregationReducers).map((key) => ({
    //         field: aggregationReducers[key].field,
    //         id: key,
    //         name: aggregationReducers[key].reducer,
    //       })),
    //     )
    //   : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers30k-sql?` + args)
    .then((r) => r.json())
    .then(
      (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(data);
          }, 1150);
        }),
    );
};
