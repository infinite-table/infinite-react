---
title: Live pagination in a React DataGrid
description: Load the next page when the user reaches the end of the table, keep sorting in sync with the server, and wire Infinite Table live pagination to React Query.
date: 2026-10-19
author: radu
tags: live-pagination, datasource, react-datagrid
---

Most "infinite scroll" tables are really two separate systems: the table renders rows, and another component guesses when the user is close enough to the bottom to fetch more data.

Infinite Table's [live pagination docs](/docs/learn/working-with-data/live-pagination) put that responsibility inside the `<DataSource />`. The grid already knows the rendered viewport, the current scroll position, the row height, and the server-side data params. Live pagination turns that knowledge into a clean cursor handoff for your app.

## The three pieces

Live pagination is enabled on `<DataSource />`, not on `<InfiniteTable />`. The table still renders the columns and rows, but the data source owns the "when do we need more rows?" decision.

You wire three props together:

1. <DataSourcePropLink name="livePagination" /> tells the `DataSource` to request more data as the user scrolls.
2. <DataSourcePropLink name="livePaginationCursor" /> returns the cursor for the next page.
3. <DataSourcePropLink name="onDataParamsChange" /> gives your app the latest `livePaginationCursor`, plus sorting, grouping, and other server-side params.

```tsx
const livePaginationCursor = React.useCallback(({ length }) => {
  return length;
}, []);

<DataSource
  primaryKey="id"
  data={rows}
  livePagination
  livePaginationCursor={livePaginationCursor}
  onDataParamsChange={setDataParams}
>
  <InfiniteTable columns={columns} />
</DataSource>;
```

The cursor can be whatever your backend understands: an offset, the last row id, a timestamp, or an opaque token returned by the previous request. The docs example uses an offset, so the cursor is simply the number of rows already loaded.

## Fetch from the data params

The important callback is <DataSourcePropLink name="onDataParamsChange" />. When the grid needs another page, it calls the callback with the current `livePaginationCursor`. When sorting changes, the same callback includes the new `sortInfo`.

That makes it a good boundary between Infinite Table and a data-fetching library:

```tsx
const [dataParams, setDataParams] = React.useState({
  sortInfo: undefined,
  livePaginationCursor: null,
});

const query = useInfiniteQuery({
  queryKey: ['employees', dataParams.sortInfo],
  queryFn: ({ pageParam = 0 }) => {
    return fetchEmployees({
      cursor: pageParam,
      sortInfo: dataParams.sortInfo,
    });
  },
  getNextPageParam: (lastPage) => lastPage.nextPageCursor,
});
```

The grid does not need to know about React Query. React Query does not need to know about the table viewport. `DataSource` publishes data params, your fetching layer loads pages, and the flattened result goes back into `DataSource.data`.

In the full docs example, the callback stores `groupBy`, `sortInfo`, and `livePaginationCursor`, then a small effect calls `fetchNextPage()` whenever the cursor changes.

## Why let the DataSource trigger pagination?

Live pagination is more precise than a generic scroll listener because it is based on what the grid can actually render.

The docs call out a few cases that are easy to miss when pagination lives outside the table:

- if the first page is too small to fill the viewport, `DataSource` immediately asks for more rows
- if the user scrolls to the end of a long table, it requests the next page at the right time
- if the viewport grows after a resize and there are no longer enough rows to fill it, it requests more data again
- if sorting changes, the data params change, so your backend receives the new sort state with the next request

That last point matters for server-backed grids. Sorting is not just a local header state. The next page has to be fetched from the same ordered dataset as the rows already shown.

## Try the docs example

The live demo below is the same React Query example from the docs. Scroll the table to load more rows, then sort by a column and notice how the request parameters reset around the new sort state.

<Sandpack title="Live pagination with React Query" deps="react-query" size="md" viewMode="preview">

<Description>

The demo uses `livePaginationCursor` as an offset cursor. `onDataParamsChange` stores the cursor and sort info, and React Query fetches the next page.

</Description>

```tsx live file="$DOCS/learn/working-with-data/live-pagination-example.page.tsx"

```

</Sandpack>

## Production checklist

A production live-pagination grid usually needs a few explicit decisions:

- choose a stable cursor for your backend; offsets are simple, but opaque cursors or last-seen ids are often safer for changing datasets
- include `sortInfo`, filters, grouping, and pivoting params in the server request whenever the grid can change them
- guard duplicate fetches while a page is already loading
- reset scroll position when a server-side sort or filter changes, for example with <PropLink name="scrollTopKey" />
- keep <DataSourcePropLink name="primaryKey" /> stable so row identity does not change as pages are appended

Start with the [live pagination docs](/docs/learn/working-with-data/live-pagination), then adapt the cursor shape to match your API. Once the cursor contract is clear, Infinite Table can handle the viewport side and your app can focus on loading the next slice of data.
