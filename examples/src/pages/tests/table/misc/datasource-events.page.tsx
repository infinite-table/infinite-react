import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTableColumn,
  DataSource,
  DataSourceSingleSortInfo,
  DataSourceDataParams,
  DataSourceLivePaginationCursorFn,
} from '@infinite-table/infinite-react';

import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useCallback } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const emptyArray: Employee[] = [];

export const columns: Record<string, InfiniteTableColumn<Employee>> = {
  id: { field: 'id' },

  country: {
    field: 'country',
  },
  city: { field: 'city' },
  team: { field: 'team' },
  department: { field: 'department' },
  firstName: { field: 'firstName' },
  lastName: { field: 'lastName' },
  salary: { field: 'salary' },
  age: { field: 'age' },
};

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

const PAGE_SIZE = 5;

const dataSource = ({
  sortInfo,
  livePaginationCursor = 0,
}: {
  sortInfo?: DataSourceSingleSortInfo<Employee>;
  livePaginationCursor: number;
}) => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/employees1k?_limit=${PAGE_SIZE}&_sort=${sortInfo?.field}&_order=${
        sortInfo?.dir === 1 ? 'asc' : 'desc'
      }&_start=${livePaginationCursor}`,
  )
    .then(async (r) => {
      const data = await r.json();
      // we need the remote count, so we take it from headers
      const total = Number(r.headers.get('X-Total-Count')!);
      return { data, total };
    })
    .then(({ data, total }: { data: Employee[]; total: number }) => {
      const page = livePaginationCursor / PAGE_SIZE + 1;

      const prevPageCursor = livePaginationCursor - PAGE_SIZE; //Math.max(PAGE_SIZE * (page - 2), 0);
      return {
        data,
        hasMore: total > PAGE_SIZE * page,
        page,
        prevPageCursor,
        nextPageCursor: prevPageCursor + PAGE_SIZE + data.length,
      };
    })
    .then(
      (
        response,
      ): Promise<{
        data: Employee[];
        hasMore: boolean;
        page: number;
        nextPageCursor: number;
        prevPageCursor: number;
      }> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(response);
          }, 550);
        });
      },
    );
};

const log = (...args: any[]) => {
  console.log(...args);
};

const domProps = {
  style: { flex: 1 },
};
const Example = () => {
  const [dataParams, setDataParams] = React.useState<
    Partial<DataSourceDataParams<Employee>>
  >({
    groupBy: [],
    sortInfo: undefined,
    livePaginationCursor: null,
  });

  const {
    data,
    fetchNextPage: fetchNext,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['employees', dataParams.sortInfo, dataParams.groupBy],
    queryFn: ({ pageParam = 0 }) => {
      const params = {
        livePaginationCursor: pageParam,
        sortInfo: dataParams.sortInfo as
          | DataSourceSingleSortInfo<Employee>
          | undefined,
      };

      //@ts-ignore
      return dataSource(params);
    },

    //@ts-ignore
    keepPreviousData: true,
    //@ts-ignore
    getPreviousPageParam: (firstPage) => firstPage.prevPageCursor ?? -PAGE_SIZE,
    //@ts-ignore
    getNextPageParam: (lastPage) => {
      //@ts-ignore
      const nextPageCursor = lastPage.hasMore
        ? //@ts-ignore
          lastPage.nextPageCursor
        : undefined;

      return nextPageCursor;
    },

    select: (data) => {
      //@ts-ignore
      const flatData = data.pages.flatMap((x) => x.data); //@ts-ignore
      const nextPageCursor = data.pages[data.pages.length - 1].nextPageCursor;

      const result = {
        pages: flatData,
        pageParams: [nextPageCursor],
      };

      return result;
    },
  });

  const onDataParamsChange = useCallback(
    (dataParams: DataSourceDataParams<Employee>) => {
      console.log('params changed', dataParams);
      if (!dataParams.changes) {
        // debugger;
      }
      const params = {
        groupBy: dataParams.groupBy,
        sortInfo: dataParams.sortInfo,
        livePaginationCursor: dataParams.livePaginationCursor,
      };

      setDataParams(params);
    },
    [],
  );

  const [scrollTopId, setScrollTop] = React.useState(0);

  React.useEffect(() => {
    // when sorting changes, scroll to the top
    setScrollTop(Date.now());
  }, [dataParams.sortInfo]);

  const fetchNextPage = () => {
    if (isFetchingNextPage) {
      log('fetch next page cancelled: already fetching');
      return;
    }

    fetchNext();
  };

  const livePaginationCursorFn: DataSourceLivePaginationCursorFn<Employee> =
    useCallback(({ length }) => {
      return length;
    }, []);

  React.useEffect(() => {
    fetchNextPage();
  }, [dataParams.livePaginationCursor]);

  return (
    <React.StrictMode>
      <div
        style={{
          display: 'flex',
          flex: 1,
          color: 'var(--infinite-row-color)',
          flexFlow: 'column',
          background: 'var(--infinite-background)',
        }}
      >
        <div style={{ padding: 10 }}>
          <b>Open the console tab</b> and make sure that more than 5 records are
          displayed
          <br />
          Then <b>sort by clicking on country header</b>
        </div>

        <DataSource<Employee>
          primaryKey="id"
          // take the data from `data.pages`,
          // as returned from our react-query select function

          sortInfo={dataParams?.sortInfo} //@ts-ignore
          data={data?.pages || emptyArray}
          loading={isFetchingNextPage}
          onDataParamsChange={onDataParamsChange}
          livePagination
          livePaginationCursor={livePaginationCursorFn}
        >
          <InfiniteTable<Employee>
            domProps={domProps}
            scrollTopKey={scrollTopId}
            columnDefaultWidth={200}
            columns={columns}
          />
        </DataSource>
      </div>
    </React.StrictMode>
  );
};

function App() {
  return (
    //@ts-ignore
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}

export default App;
