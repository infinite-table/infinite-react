---
title: Cursor-based live pagination for React DataGrids
description: Use Infinite Table live pagination to append remote rows on demand, keep sorting in sync, and let React Query own the fetch lifecycle.
date: 2026-08-19
author: radu
tags: live-pagination, datasource, react-datagrid
---

Large tables rarely arrive in one neat array. Search results, audit logs, CRM records, event streams, and admin screens usually need the same interaction: render the first rows quickly, fetch the next slice when the user reaches the end, and keep sorting or grouping connected to the request that loaded the data.

Infinite Table's [live pagination docs](/docs/learn/working-with-data/live-pagination) cover this with <DataSourcePropLink name="livePagination" /> and <DataSourcePropLink name="livePaginationCursor" />. The idea is simple: the DataSource watches the rendered data and scroll position, then tells your app when it needs the next cursor. Your app can keep using `fetch`, React Query, SWR, Relay, or any other loading layer.

## Live pagination is not a pager widget

Traditional pagination asks the user to leave the table flow: click page 2, wait, click page 3, wait again. Live pagination keeps the DataGrid interaction continuous.

For product UIs, that matters in places like:

- activity feeds where people scan until they find a relevant event
- support queues where the first screen should appear immediately
- customer lists that need server-side sorting
- audit logs that can grow to millions of rows
- admin reports where filters and sort order change the remote query

You still load data in pages, but users experience it as one scrollable table.

## Turn on the DataSource contract

At the Infinite Table level, live pagination starts with two DataSource props:

```tsx {5,6}
<DataSource<Employee>
  primaryKey="id"
  data={rows}
  onDataParamsChange={onDataParamsChange}
  livePagination
  livePaginationCursor={livePaginationCursor}
>
  <InfiniteTable<Employee> columns={columns} />
</DataSource>
```

<DataSourcePropLink name="livePagination" /> enables the behavior. <DataSourcePropLink name="livePaginationCursor" /> gives the DataSource a way to compute the cursor that should be requested next.

In the docs example, the cursor is the current row count:

```tsx
const livePaginationCursor = ({ length }) => {
  return length;
};
```

That works well for offset-style APIs (`_start=rows.length`). For cursor APIs, return the last record id, timestamp, opaque token, or whatever your backend expects.

```tsx
const livePaginationCursor = ({ lastItem }) => {
  return lastItem?.nextCursor ?? null;
};
```

The DataSource does not force a pagination protocol. It only asks your app for the cursor value.

## Listen for the next data params

The companion prop is <DataSourcePropLink name="onDataParamsChange" />. It fires when DataSource inputs change, including sorting, grouping, filtering, and live pagination cursor changes.

```tsx {1,6}
const onDataParamsChange = (dataParams) => {
  setDataParams({
    groupBy: dataParams.groupBy,
    sortInfo: dataParams.sortInfo,
    filterValue: dataParams.filterValue,
    livePaginationCursor: dataParams.livePaginationCursor,
  });
};
```

This is the bridge to your request layer. Instead of making `<InfiniteTable />` know how to fetch, keep the query state outside the table and let the DataSource report the parameters that should be used for the next request.

That separation is useful because remote data requests usually depend on more than a page number:

- the current sort order
- active filters
- group keys for expanded groups
- the cursor of the next page
- authentication, tenant, or workspace state that lives outside the grid

## Pair it with React Query

The docs demo uses TanStack Query's `useInfiniteQuery`. Infinite Table owns the scroll and DataSource state; React Query owns caching, in-flight request state, page flattening, and deduplication.

```tsx {3,4,9}
const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
  initialPageParam: 0,
  queryKey: ['employees', dataParams.sortInfo, dataParams.groupBy],
  queryFn: ({ pageParam = 0 }) => {
    return getEmployees({
      sortInfo: dataParams.sortInfo,
      groupBy: dataParams.groupBy,
      livePaginationCursor: pageParam,
    });
  },
  getNextPageParam: (lastPage) => {
    return lastPage.hasMore ? lastPage.nextPageCursor : undefined;
  },
});
```

Then pass the flattened rows and loading state back into the DataSource:

```tsx {3,4}
<DataSource<Employee>
  primaryKey="id"
  data={data?.pages.flatMap((page) => page.data) ?? []}
  loading={isFetchingNextPage}
  livePagination
  livePaginationCursor={livePaginationCursor}
  onDataParamsChange={onDataParamsChange}
>
  <InfiniteTable<Employee> columns={columns} />
</DataSource>
```

This keeps the table responsive while the next page is loading, and it avoids replacing the DataGrid with a separate pagination UI.

<Sandpack title="Live pagination with React Query" size="md" viewMode="preview" deps="react-query">

<Description>

Scroll to the end of the table to request more rows. Try sorting by country or city to see the DataSource report new params and the query restart with the new order.

</Description>

```tsx live file="$DOCS/learn/working-with-data/live-pagination-example.page.tsx"

```

</Sandpack>

## What happens when sorting changes?

Sorting is where live pagination becomes more than "append the next page".

When a user sorts by `country`, the next request should not append country-sorted rows to the old unsorted list. It should reset the query around the new `sortInfo`, fetch from the beginning, and usually scroll back to the top.

The docs example does that by putting `dataParams.sortInfo` in the query key:

```tsx
queryKey: ['employees', dataParams.sortInfo, dataParams.groupBy];
```

When sorting changes, React Query treats it as a different query. The example also changes `scrollTopKey` so the DataGrid starts again at the top of the new result set.

```tsx
React.useEffect(() => {
  setScrollTop(Date.now());
}, [dataParams.sortInfo]);

<InfiniteTable<Employee> scrollTopKey={scrollTopId} />;
```

That is the main production rule: any DataSource param that changes the remote result order should become part of your fetch key.

## When to use live pagination

Use live pagination when the backend naturally returns a "next page" and the user should keep scrolling:

- cursor-based APIs that return `{ data, nextCursor, hasMore }`
- offset-based APIs that accept `_start` and `_limit`
- search result screens where users scan progressively
- admin lists where sorting and filters are server-side
- feeds where the full count is either expensive or not useful

Use [lazy loading](/docs/learn/working-with-data/lazy-loading) when you want the table to behave as if the full remote row count already exists and fetch batches for visible ranges. Use live pagination when the experience is "append more rows as the user reaches the end".

## The small API surface is the point

Live pagination only needs a few pieces:

1. <DataSourcePropLink name="livePagination" /> to enable the behavior.
2. <DataSourcePropLink name="livePaginationCursor" /> to compute the next cursor.
3. <DataSourcePropLink name="onDataParamsChange" /> to tell your request layer what changed.
4. A loading layer that appends rows and knows when `hasMore` is false.

The DataSource stays responsible for DataGrid state. Your app stays responsible for networking. That split lets you build infinite scrolling tables without locking the rest of your data stack to the grid component.

Start with the [live pagination guide](/docs/learn/working-with-data/live-pagination), then adapt the cursor function and query key to the API your product already exposes.
