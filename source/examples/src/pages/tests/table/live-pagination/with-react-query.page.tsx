import * as React from 'react';
import fetch from 'isomorphic-fetch';

import {
  InfiniteTable,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import { useCallback } from 'react';

import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from 'react-query';

const queryClient = new QueryClient();

export const columns = new Map<string, InfiniteTableColumn<Employee>>([
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

const dataSource = (page = 1) => {
  const pageSize = 100;

  return fetch(
    `${process.env
      .NEXT_PUBLIC_DATAURL!}/employees1k?_limit=${pageSize}&_page=${page}`,
  )
    .then(async (r) => {
      const data = await r.json();

      const total = Number(r.headers.get('X-Total-Count')!);
      return { data, total };
    })
    .then(({ data, total }: { data: Employee[]; total: number }) => {
      return { data, hasMore: total > pageSize * page, page };
    })
    .then(
      (
        response,
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
      },
    );
};

const domProps = {
  style: {
    margin: '5px',
    height: '60vh',
    width: '95vw',
    border: '1px solid gray',
    position: 'relative',
  } as React.CSSProperties,
};

const Example = () => {
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery(['employees'], ({ pageParam: page }) => dataSource(page), {
      keepPreviousData: true,

      getPreviousPageParam: (firstPage) => firstPage.page - 1,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.page + 1 : undefined,

      select: (data) => {
        const result = {
          pages: data.pages.flatMap((x) => x.data),
          pageParams: data.pageParams,
        };

        return result;
      },
    });

  const onScrollToBottom = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage]);

  return (
    <React.StrictMode>
      <DataSource<Employee>
        primaryKey="id"
        data={data?.pages || []}
        loading={isFetchingNextPage}
      >
        <InfiniteTable<Employee>
          domProps={domProps}
          columnDefaultWidth={440}
          columnMinWidth={50}
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
