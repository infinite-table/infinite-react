---
title: Lazy loading React DataGrids with Infinite Table
description: Use DataSource.lazyLoad to fetch only the rows in view while keeping sorting, filtering, grouping, and pivoting connected to your server data.
date: 2026-09-28
author: radu
tags: lazy-loading, react-datagrid, server-side-data
---

Fast DataGrids are not only about rendering fewer DOM nodes. In real applications, the expensive part is often the data itself: search results with millions of rows, audit logs that keep growing, or analytics tables where grouping and sorting belong on the server.

Infinite Table's [lazy loading docs](/docs/learn/working-with-data/lazy-loading) cover this workflow with the <DataSourcePropLink name="lazyLoad" /> prop. The grid keeps the scrolling experience users expect, but the `<DataSource />` only asks for the slice of data it currently needs.

## What lazy loading changes

Without lazy loading, the `data` you pass to `<DataSource />` is usually the full array, or a promise for the full array. With lazy loading enabled, `data` becomes a request handler.

```tsx
<DataSource<Developer>
  primaryKey="id"
  data={dataSource}
  lazyLoad={{ batchSize: 40 }}
>
  <InfiniteTable<Developer> columns={columns} />
</DataSource>
```

When the user scrolls and then stops, Infinite Table calls the `data` function with the visible range:

```ts
const dataSource: DataSourceData<Developer> = ({
  lazyLoadStartIndex,
  lazyLoadBatchSize,
  sortInfo,
  filterValue,
}) => {
  return fetchRows({
    start: lazyLoadStartIndex,
    limit: lazyLoadBatchSize,
    sortInfo,
    filterValue,
  });
};
```

The promise should resolve to an object with `data` and `totalCount`:

```ts
{
  data: rows,
  totalCount: 10000
}
```

`totalCount` lets the grid size the scrollbar as if every remote row were already loaded, while `data` fills the requested batch. Users can keep scrolling through the whole result set without downloading it all up front.

## Pick a batch size for flat data

For ungrouped data, pass an object with `batchSize`. The docs example uses `40`, which keeps each network response small while still giving the viewport enough rows to render smoothly.

```tsx
const lazyLoad = useMemo(() => ({ batchSize: 40 }), []);

<DataSource<Developer>
  data={dataSource}
  primaryKey="id"
  lazyLoad={lazyLoad}
>
  <InfiniteTable<Developer>
    columns={columns}
    columnDefaultWidth={130}
  />
</DataSource>
```

<Sandpack title="Lazy loading ungrouped data" size="md" viewMode="preview">

<Description>

Scroll the table and watch Infinite Table request the next batch of developers only after scrolling settles.

</Description>

```tsx live file="$DOCS/learn/working-with-data/simple-lazy-load-example.page.tsx"

```

</Sandpack>

This is the right setup for logs, catalog rows, users, invoices, jobs, and any other flat result set where the server can return `start`, `limit`, and `totalCount`.

## Keep server state in the request

Lazy loading becomes more useful when the request also receives the rest of the DataGrid state. The `data` function is called with sorting, filtering, grouping, pivoting, aggregations, and group keys when those features are enabled.

That means the server can own the expensive work:

- sorting by the clicked column
- filtering by the current filter value
- grouping by the current group fields
- returning aggregated values for group rows
- pivoting data before the rows reach the browser

When one of those inputs changes, Infinite Table discards the stale batches and calls `data` again for the new result set. You do not have to manually reset the cache for common interactions such as sorting or filtering.

```ts
const dataSource: DataSourceData<Developer> = ({
  lazyLoadStartIndex,
  lazyLoadBatchSize,
  sortInfo,
  groupBy,
  groupKeys = [],
  aggregationReducers,
}) => {
  return fetch('/developers10k-sql?' + buildQueryString({
    start: lazyLoadStartIndex,
    limit: lazyLoadBatchSize,
    sortInfo,
    groupBy,
    groupKeys,
    aggregationReducers,
  })).then((response) => response.json());
};
```

The grid handles the UI state; your endpoint handles the data state.

## Lazy loading grouped data

Grouped tables need one extra idea: a batch can belong to the root level, to an expanded group, or to a sibling group that becomes visible while the user scrolls.

When grouping is enabled, the `data` function receives `groupBy` and `groupKeys`. `groupKeys` identifies the current group path, so your endpoint knows whether it should return country groups, stack groups inside one country, or leaf rows inside one stack.

```tsx
const groupBy = [{ field: 'country' }, { field: 'stack' }];

<DataSource<Developer>
  data={dataSource}
  primaryKey="id"
  groupBy={groupBy}
  lazyLoad={{ batchSize: 40 }}
  aggregationReducers={{
    salary: {
      field: 'salary',
      reducer: 'avg',
    },
  }}
>
  <InfiniteTable<Developer>
    columns={columns}
    groupRenderStrategy="single-column"
  />
</DataSource>
```

<Sandpack title="Lazy loading grouped data" size="lg" viewMode="preview">

<Description>

Expand groups and scroll through the table. Batches are requested for the group path that is currently visible.

</Description>

```tsx live file="$DOCS/learn/working-with-data/grouped-lazy-load-example.page.tsx"

```

</Sandpack>

This lets you build large grouped tables without loading every child row for every group. Users can expand the section they care about, and the grid will request more rows as that section becomes visible.

## When to use lazy loading

Use <DataSourcePropLink name="lazyLoad" /> when the browser should not own the full dataset:

- long audit trails or activity feeds
- admin tables backed by database queries
- search results where filters can match millions of records
- grouped reports where expanding every group would be wasteful
- pivoted reports where the backend already computes aggregates

For smaller datasets, client-side data can still be simpler. Lazy loading is the point where the DataGrid becomes a viewport over server data instead of a component that first downloads everything.

## Go deeper in the docs

- [Lazy loading](/docs/learn/working-with-data/lazy-loading) - the full guide with ungrouped and grouped examples
- [Server-side grouping with lazy loading](/docs/learn/grouping-and-pivoting/grouping-rows#server-side-grouping-with-lazy-loading) - the grouped data shape and batching details
- [Server-side pivoting](/docs/learn/grouping-and-pivoting/pivoting/overview#server-side-pivoting) - combining lazy loading with pivoted reports
- <DataSourcePropLink name="lazyLoad" /> - API reference for enabling lazy loading
