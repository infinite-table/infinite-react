import {
  DataSource,
  DataSourcePropFilterValue,
  DataSourceSingleSortInfo,
  InfiniteTable,
  InfiniteTableColumn,
  defaultFilterFunction,
  filterTypes,
  multisort,
} from '@infinite-table/infinite-react';
import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query';
import * as React from 'react';

import { developers, type Developer } from './developers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

// every query stays pending until the test calls `releaseQuery()`
const pendingQueries: (() => void)[] = [];
(globalThis as any).queryCalls = 0;
(globalThis as any).releaseQuery = () => {
  pendingQueries.splice(0).forEach((resolve) => resolve());
};

function queryDevelopers(
  sortInfo: DataSourceSingleSortInfo<Developer>[],
  filterValue: DataSourcePropFilterValue<Developer>,
) {
  (globalThis as any).queryCalls++;

  return new Promise<Developer[]>((resolve) => {
    pendingQueries.push(() => {
      const filtered = developers.filter((data, index, dataArray) =>
        defaultFilterFunction({
          data,
          index,
          dataArray,
          primaryKey: data.id,
          filterValue,
          filterTypes,
        }),
      );
      resolve(multisort(sortInfo, filtered));
    });
  });
}

const columns: Record<string, InfiniteTableColumn<Developer>> = {
  name: { field: 'name' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
};

const domProps = { style: { height: '80vh' } };
const noRows: Developer[] = [];

function Grid() {
  const [sortInfo, setSortInfo] = React.useState<
    DataSourceSingleSortInfo<Developer>[]
  >([]);
  const [filterValue, setFilterValue] = React.useState<
    DataSourcePropFilterValue<Developer>
  >([]);

  const { data } = useQuery({
    queryKey: ['developers', sortInfo, filterValue],
    queryFn: () => queryDevelopers(sortInfo, filterValue),
    placeholderData: keepPreviousData,
  });

  return (
    <DataSource<Developer>
      primaryKey="id"
      data={data ?? noRows}
      sortInfo={sortInfo}
      onSortInfoChange={setSortInfo}
      filterValue={filterValue}
      onFilterValueChange={setFilterValue}
      filterDelay={0}
      shouldReloadData={{ sortInfo: true, filterValue: true }}
    >
      <InfiniteTable<Developer>
        columns={columns}
        showColumnFilters
        domProps={domProps}
      />
    </DataSource>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Grid />
    </QueryClientProvider>
  );
}
