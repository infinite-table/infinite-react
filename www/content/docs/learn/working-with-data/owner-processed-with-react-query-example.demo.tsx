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

type Developer = {
  id: number;
  firstName: string;
  country: string;
  stack: string;
  age: number;
};

const developers: Developer[] = [
  { id: 1, firstName: 'Bob', country: 'USA', stack: 'backend', age: 30 },
  { id: 2, firstName: 'Alice', country: 'France', stack: 'frontend', age: 25 },
  { id: 3, firstName: 'Carl', country: 'USA', stack: 'full-stack', age: 40 },
  { id: 4, firstName: 'Dana', country: 'France', stack: 'backend', age: 35 },
  { id: 5, firstName: 'Eve', country: 'Germany', stack: 'frontend', age: 28 },
  { id: 6, firstName: 'Frank', country: 'Germany', stack: 'backend', age: 45 },
];

// pretend this runs on a server: it filters and sorts the rows,
// with the same functions the DataSource uses
function fetchDevelopers(
  sortInfo: DataSourceSingleSortInfo<Developer>[],
  filterValue: DataSourcePropFilterValue<Developer>,
) {
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
  const rows = multisort(sortInfo, filtered);

  return new Promise<Developer[]>((resolve) => {
    setTimeout(() => resolve(rows), 600);
  });
}

const columns: Record<string, InfiniteTableColumn<Developer>> = {
  firstName: { field: 'firstName', header: 'First name' },
  country: { field: 'country' },
  stack: { field: 'stack' },
  age: { field: 'age', type: 'number' },
};

const queryClient = new QueryClient();
const noRows: Developer[] = [];

function Developers() {
  const [sortInfo, setSortInfo] = React.useState<
    DataSourceSingleSortInfo<Developer>[]
  >([]);
  const [filterValue, setFilterValue] = React.useState<
    DataSourcePropFilterValue<Developer>
  >([]);

  const { data, isFetching } = useQuery({
    queryKey: ['developers', sortInfo, filterValue],
    queryFn: () => fetchDevelopers(sortInfo, filterValue),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <p style={{ color: 'var(--infinite-cell-color)' }}>
        {isFetching ? 'Loading...' : 'Sort or filter a column'}
      </p>
      <DataSource<Developer>
        primaryKey="id"
        data={data ?? noRows}
        sortInfo={sortInfo}
        onSortInfoChange={setSortInfo}
        filterValue={filterValue}
        onFilterValueChange={setFilterValue}
        shouldReloadData={{ sortInfo: true, filterValue: true }}
      >
        <InfiniteTable<Developer> columns={columns} showColumnFilters />
      </DataSource>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Developers />
    </QueryClientProvider>
  );
}
