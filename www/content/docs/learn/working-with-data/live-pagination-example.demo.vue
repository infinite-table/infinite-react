<script setup lang="ts">
import '@infinite-table/infinite-vue/index.css';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  InfiniteTableColumn,
  DataSourceSingleSortInfo,
  DataSourceDataParams,
  DataSourceLivePaginationCursorFn,
} from '@infinite-table/infinite-vue';
import { computed, ref, shallowRef, watch } from 'vue';

const columns: Record<string, InfiniteTableColumn<Employee>> = {
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

type Page = {
  data: Employee[];
  hasMore: boolean;
  page: number;
  nextPageCursor: number;
  prevPageCursor: number;
};

const PAGE_SIZE = 10;

const dataSource = ({
  sortInfo,
  livePaginationCursor = 0,
}: {
  sortInfo: DataSourceSingleSortInfo<Employee> | null;
  livePaginationCursor: number;
}) => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/employees10k?_limit=${PAGE_SIZE}&_sort=${sortInfo?.field}&_order=${
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

      const prevPageCursor = Math.max(PAGE_SIZE * (page - 1), 0);
      return {
        data,
        hasMore: total > PAGE_SIZE * page,
        page,
        prevPageCursor,
        nextPageCursor: prevPageCursor + data.length,
      };
    })
    .then((response): Promise<Page> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(response);
        }, 150);
      });
    });
};

const dataParams = shallowRef<Partial<DataSourceDataParams<Employee>>>({
  groupBy: [],
  sortInfo: undefined,
  livePaginationCursor: null,
});

// the pages loaded so far, with the current sorting
const pages = shallowRef<Page[]>([]);

// all the rows of those pages - this is the `data` of the DataSource
const data = computed(() => pages.value.flatMap((page) => page.data));

const isFetchingNextPage = ref(false);
let isFetchingFirstPage = false;

// when the sorting or the grouping changes, the pages are loaded again, from the first one
const queryKey = computed(() =>
  JSON.stringify([dataParams.value.sortInfo, dataParams.value.groupBy]),
);

// incremented with every new `queryKey`, so a response
// that arrives after the sorting has changed is dropped
let queryId = 0;

const fetchFirstPage = () => {
  const currentQueryId = ++queryId;

  isFetchingFirstPage = true;
  isFetchingNextPage.value = false;

  dataSource({
    livePaginationCursor: 0,
    sortInfo: dataParams.value.sortInfo as DataSourceSingleSortInfo<Employee> | null,
  }).then((page) => {
    if (currentQueryId !== queryId) {
      return;
    }
    isFetchingFirstPage = false;
    // the previous rows stay in the table until the first page with the new sorting arrives
    pages.value = [page];
  });
};

const fetchNextPage = () => {
  const lastPage = pages.value[pages.value.length - 1];

  if (isFetchingFirstPage || isFetchingNextPage.value || !lastPage?.hasMore) {
    return;
  }

  const currentQueryId = queryId;

  isFetchingNextPage.value = true;

  dataSource({
    livePaginationCursor: lastPage.nextPageCursor,
    sortInfo: dataParams.value.sortInfo as DataSourceSingleSortInfo<Employee> | null,
  }).then((page) => {
    if (currentQueryId !== queryId) {
      return;
    }
    isFetchingNextPage.value = false;
    pages.value = [...pages.value, page];
  });
};

const onDataParamsChange = (newDataParams: DataSourceDataParams<Employee>) => {
  const params = {
    groupBy: newDataParams.groupBy,
    sortInfo: newDataParams.sortInfo,
    livePaginationCursor: newDataParams.livePaginationCursor,
  };

  dataParams.value = params;
};

const scrollTopId = ref(0);

watch(
  () => dataParams.value.sortInfo,
  () => {
    // when sorting changes, scroll to the top
    scrollTopId.value = Date.now();
  },
  { immediate: true },
);

watch(queryKey, fetchFirstPage, { immediate: true });

watch(
  () => dataParams.value.livePaginationCursor,
  () => {
    fetchNextPage();
  },
);

const livePaginationCursorFn: DataSourceLivePaginationCursorFn<Employee> = ({
  length,
}) => {
  return length;
};
</script>

<template>
  <!-- take the data from `data`, the rows of all the pages loaded so far -->
  <DataSource
    primaryKey="id"
    :data="data"
    :loading="isFetchingNextPage"
    :onDataParamsChange="onDataParamsChange"
    :livePagination="true"
    :livePaginationCursor="livePaginationCursorFn"
  >
    <InfiniteTable
      debugId="live-pagination-example"
      :scrollTopKey="scrollTopId"
      :columnDefaultWidth="200"
      :columns="columns"
    />
  </DataSource>
</template>
