import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceApi,
  InfiniteTableApi,
  InfiniteTablePropColumns,
  DataSourcePropSortInfo,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

const data: Developer[] = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  firstName: `Dev ${index}`,
  salary: 1000 + index * 10,
}));

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  salary: { field: 'salary', type: 'number' },
};

const defaultSortInfo: DataSourcePropSortInfo<Developer> = {
  field: 'salary',
  dir: -1,
};

const domProps = {
  style: {
    height: '80vh',
  },
};

// the same name the grid uses for one of its own profiler entries
const USER_MEASURE_NAME = 'Sort';

// a measure made by the app itself, that the grid has to leave alone
if (typeof performance !== 'undefined') {
  performance.measure(USER_MEASURE_NAME, { start: 0, end: 1 });
}

/**
 * With a `debugId`, the grid adds entries to the custom tracks of the
 * Chrome DevTools profiler. Every data update makes a few of them.
 */
export default function App() {
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<Developer>>();
  const [updates, setUpdates] = React.useState(0);

  const onReady = React.useCallback(
    ({
      dataSourceApi,
    }: {
      api: InfiniteTableApi<Developer>;
      dataSourceApi: DataSourceApi<Developer>;
    }) => {
      setDataSourceApi(dataSourceApi);
    },
    [],
  );

  return (
    <>
      <button
        onClick={() => {
          const count = updates + 1;
          setUpdates(count);
          dataSourceApi?.updateData({
            id: count % data.length,
            salary: 5000 + count,
          });
        }}
      >
        update
      </button>
      <span data-name="updates">{updates}</span>
      <DataSource<Developer>
        data={data}
        primaryKey="id"
        debugId="profiled"
        defaultSortInfo={defaultSortInfo}
      >
        <InfiniteTable<Developer>
          debugId="profiled"
          onReady={onReady}
          domProps={domProps}
          columns={columns}
          columnDefaultWidth={150}
        />
      </DataSource>
    </>
  );
}
