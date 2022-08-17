import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  InfiniteTablePropColumns,
  GroupRowsState,
  DataSourceGroupBy,
  DataSourcePropAggregationReducers,
  DataSourcePivotBy,
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
  preferredLanguage: { field: 'preferredLanguage' },
  age: { field: 'age' },

  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  country: {
    field: 'country',
    renderValue: ({ value }) => {
      return <>* - {value}</>;
    },
  },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: {
    field: 'city',
    renderValue: ({ value }) => {
      return <>x - {value}</>;
    },
  },
  currency: { field: 'currency' },
};

// const numberFormat = new Intl.NumberFormat(undefined, {
//   style: 'currency',
//   currency: 'USD',
// });
const groupRowsState = new GroupRowsState({
  expandedRows: [['France'], ['France', 'Persan']],
  collapsedRows: true,
});

const groupColumn: InfiniteTablePropGroupColumn<Developer> = {
  id: 'group-col',
  renderValue: (arg) => {
    const { rootGroupBy: groupBy, columnsMap, rowInfo } = arg;

    const groupByItem =
      groupBy[rowInfo.dataSourceHasGrouping ? rowInfo.groupNesting - 1 : 0];

    if (!groupByItem) {
      return <>{arg.value}</>;
    }

    const groupColumn = columnsMap.get(groupByItem.field);

    // return <>{arg.value}</>;
    // const groupByCol = groupBy
    return <>{groupColumn?.renderValue?.(arg) ?? arg.value}</>;
  },

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

console.log('env var for tests', process.env.NEXT_PUBLIC_BASE_URL_FOR_TESTS);

const defaultRowSelection = {
  defaultSelection: false,

  selectedRows: [
    ['France', 'Cabariot', 73],
    ['France', 'Persan', 4],
    ['France', 'Vernou-sur-Brenne', 33],
    ['France', 'Villelaure', 38],
    ['France', 'Villelaure', 64],

    // ,
    // 84,
    // ['Germany'],
    // ['Germany', 'Puderbach', 84],
  ],
  deselectedRows: [
    // ['Germany', 'Puderbach'],
    // ['Germany', 'Puderbach', 84],
  ],
};
export default function RemotePivotExample() {
  const groupBy: DataSourceGroupBy<Developer>[] = React.useMemo(
    () => [
      {
        field: 'country',
      },
      {
        field: 'city',
      },

      // { field: 'stack' },
    ],
    [],
  );

  const pivotBy: DataSourcePivotBy<Developer>[] = React.useMemo(
    () => [
      // {
      //   field: 'preferredLanguage',
      //   // for totals columns
      //   column: pivotColumnWithFormatter,
      // },
      // {
      //   field: 'canDesign',
      //   columnGroup: ({ columnGroup }) => {
      //     return {
      //       ...columnGroup,
      //       header:
      //         columnGroup.pivotGroupKey === 'yes'
      //           ? 'Designer 💅'
      //           : 'Non-Designer 💻',
      //     };
      //   },
      //   column: pivotColumnWithFormatter,
      // },
    ],
    [],
  );

  const lazyLoad = React.useMemo(() => ({ batchSize: 5 }), []);
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={dataSource}
      groupBy={groupBy}
      pivotBy={pivotBy.length ? pivotBy : undefined}
      aggregationReducers={aggregationReducers}
      defaultGroupRowsState={groupRowsState}
      defaultRowSelection={defaultRowSelection}
      lazyLoad={lazyLoad}
      selectionMode="multi-row"
    >
      {({ pivotColumns, pivotColumnGroups }) => {
        return (
          <InfiniteTable<Developer>
            domProps={domProps}
            scrollStopDelay={250}
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
    groupRowsState
      ? 'expandedRows=' + JSON.stringify(groupRowsState.expandedRows)
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
    process.env.NEXT_PUBLIC_BASE_URL_FOR_TESTS + `/developers10-sql?` + args,
  )
    .then((r) => r.json())
    .then(
      (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(data);
          }, 0);
        }),
    );
};
