import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTableColumn,
  DataSourceSingleSortInfo,
  DataSourceDataParams,
  DataSourceLivePaginationCursorFn,
} from '@infinite-table/infinite-angular';

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

const livePaginationCursorFn: DataSourceLivePaginationCursorFn<Employee> = ({
  length,
}) => {
  return length;
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <!-- take the data from data(), the rows of all the pages loaded so far -->
    <infinite-data-source
      primaryKey="id"
      [data]="data()"
      [loading]="isFetchingNextPage()"
      (dataParamsChange)="onDataParamsChange($event)"
      [livePagination]="true"
      [livePaginationCursor]="livePaginationCursorFn"
    >
      <infinite-table
        debugId="live-pagination-example"
        [scrollTopKey]="scrollTopId()"
        [columnDefaultWidth]="200"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly columns = columns;
  protected readonly livePaginationCursorFn = livePaginationCursorFn;

  private dataParams: Partial<DataSourceDataParams<Employee>> = {
    groupBy: [],
    sortInfo: undefined,
    livePaginationCursor: null,
  };

  // the pages loaded so far, with the current sorting
  private readonly pages = signal<Page[]>([]);

  // all the rows of those pages - this is the `data` of the DataSource
  protected readonly data = computed(() =>
    this.pages().flatMap((page) => page.data),
  );

  protected readonly isFetchingNextPage = signal(false);
  private isFetchingFirstPage = false;

  // when sorting changes, scroll to the top
  protected readonly scrollTopId = signal(Date.now());

  // incremented with every new query key (sorting and grouping), so a
  // response that arrives after the sorting has changed is dropped
  private queryId = 0;

  constructor() {
    this.fetchFirstPage();
  }

  protected onDataParamsChange(newDataParams: DataSourceDataParams<Employee>) {
    const previous = this.dataParams;
    this.dataParams = {
      groupBy: newDataParams.groupBy,
      sortInfo: newDataParams.sortInfo,
      livePaginationCursor: newDataParams.livePaginationCursor,
    };

    const sortInfoChanged =
      JSON.stringify(previous.sortInfo) !==
      JSON.stringify(this.dataParams.sortInfo);
    if (sortInfoChanged) {
      this.scrollTopId.set(Date.now());
    }
    // when the sorting or the grouping changes, the pages are loaded again, from the first one
    if (
      sortInfoChanged ||
      JSON.stringify(previous.groupBy) !==
        JSON.stringify(this.dataParams.groupBy)
    ) {
      this.fetchFirstPage();
    }
    if (
      previous.livePaginationCursor !== this.dataParams.livePaginationCursor
    ) {
      this.fetchNextPage();
    }
  }

  private fetchFirstPage() {
    const currentQueryId = ++this.queryId;

    this.isFetchingFirstPage = true;
    this.isFetchingNextPage.set(false);

    dataSource({
      livePaginationCursor: 0,
      sortInfo: this.dataParams
        .sortInfo as DataSourceSingleSortInfo<Employee> | null,
    }).then((page) => {
      if (currentQueryId !== this.queryId) {
        return;
      }
      this.isFetchingFirstPage = false;
      // the previous rows stay in the table until the first page with the new sorting arrives
      this.pages.set([page]);
    });
  }

  private fetchNextPage() {
    const pages = this.pages();
    const lastPage = pages[pages.length - 1];

    if (
      this.isFetchingFirstPage ||
      this.isFetchingNextPage() ||
      !lastPage?.hasMore
    ) {
      return;
    }

    const currentQueryId = this.queryId;

    this.isFetchingNextPage.set(true);

    dataSource({
      livePaginationCursor: lastPage.nextPageCursor,
      sortInfo: this.dataParams
        .sortInfo as DataSourceSingleSortInfo<Employee> | null,
    }).then((page) => {
      if (currentQueryId !== this.queryId) {
        return;
      }
      this.isFetchingNextPage.set(false);
      this.pages.update((pages) => [...pages, page]);
    });
  }
}
