import {
  InfiniteTable,
  DataSource,
  DataSourceData,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
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
          JSON.stringify(sortInfo.map((s) => ({ field: s.field, dir: s.dir })))
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
            }, 1000);
          }),
      );
  };
  return dataSource;
}

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

// const defaultColumnPinning: InfiniteTablePropColumnPinning = new Map([
//   ['labels', 'start'],
// ]);
const domProps = { style: { height: '90vh' } };

// const groupRowsState = new GroupRowsState({
//   expandedRows: [],
//   collapsedRows: true,
// });

export default function App() {
  const [size, setSize] = React.useState('1k');
  const dataSource = React.useMemo(() => {
    return getDataSource(size);
  }, [size]);
  const [grouping, setGrouping] = React.useState(false);
  return (
    <>
      <button
        onClick={() => {
          setGrouping(!grouping);
        }}
      >
        toggle grouping = currently {grouping ? 'grouping' : 'not grouping'}
      </button>
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
        lazyLoad={{ batchSize: 20 }}
        //   defaultGroupRowsState={groupRowsState}
        groupBy={undefined}
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          // hideEmptyGroupColumns
          //   defaultColumnPinning={defaultColumnPinning}
          columns={columns}
          columnDefaultWidth={220}
        />
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
