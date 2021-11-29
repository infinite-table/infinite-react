import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTableColumn,
  DataSource,
} from '@infinite-table/infinite-react';

import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from 'react-query';

const queryClient = new QueryClient();

export const columns = new Map<
  string,
  InfiniteTableColumn<Employee>
>([
  ['id', { field: 'id' }],
  [
    'country',
    {
      field: 'country',
    },
  ],
  ['city', { field: 'city' }],
  ['team', { field: 'team' }],
  ['department', { field: 'department' }],
  ['firstName', { field: 'firstName' }],
  ['lastName', { field: 'lastName' }],
  ['salary', { field: 'salary' }],
  ['age', { field: 'age' }],
]);

type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  streetName: string;
  streetNo: number;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const PAGE_SIZE = 100;

const dataSource = (page = 1) => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/employees10k?_limit=${PAGE_SIZE}&_page=${page}`
  )
    .then(async (r) => {
      const data = await r.json();
      // we need the remote count, so we take it from headers
      const total = Number(r.headers.get('X-Total-Count')!);
      return { data, total };
    })
    .then(
      ({
        data,
        total,
      }: {
        data: Employee[];
        total: number;
      }) => {
        return {
          data,
          hasMore: total > PAGE_SIZE * page,
          page,
        };
      }
    )
    .then(
      (
        response
      ): Promise<{
        data: Employee[];
        hasMore: boolean;
        page: number;
      }> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(response);
          }, 150);
        });
      }
    );
};

const Example = () => {
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ['employees'],
    ({ pageParam: page }) => dataSource(page),
    {
      keepPreviousData: true,

      getPreviousPageParam: (firstPage) =>
        firstPage.page - 1,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.page + 1 : undefined,

      select: (data) => {
        // each page has data: Employee[], hasMore: boolean, page: number
        // so we need to flatten that into a single `pages` array
        // (react-query requires it to be called `pages`)
        const result = {
          pages: data.pages.flatMap((x) => x.data),
          pageParams: data.pageParams,
        };

        return result;
      },
    }
  );

  const onScrollToBottom = React.useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage]);

  return (
    <React.StrictMode>
      <DataSource<Employee>
        primaryKey="id"
        // take the data from `data.pages`,
        // as returned from our react-query select function
        data={data?.pages || []}
        loading={isFetchingNextPage}>
        <InfiniteTable<Employee>
          columnDefaultWidth={200}
          columns={columns}
          onScrollToBottom={onScrollToBottom}
        />
      </DataSource>
    </React.StrictMode>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}

export default App;
