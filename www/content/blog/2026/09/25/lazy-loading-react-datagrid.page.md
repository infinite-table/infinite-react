---
title: Lazy loading a React DataGrid with Infinite Table
description: Fetch only the rows your users bring into view while Infinite Table keeps the full scroll experience, sorting, filtering, grouping, and server-side data params in sync.
date: 2026-09-25
author: radu
tags: lazy-loading, data-loading, react-datagrid
---

Large datasets create two separate problems for a DataGrid.

The first is rendering. Infinite Table already handles that with virtualization, so the browser only mounts the rows and cells that matter for the current viewport.

The second is data loading. If the backend has 100,000 rows, you should not have to load all of them just to show the first screen. That is where [lazy loading](/docs/learn/working-with-data/lazy-loading) comes in.

With lazy loading enabled, `<DataSource />` asks your server for the batch of rows that corresponds to the visible range. Infinite Table still renders the grid as if the full remote dataset exists, so the scrollbar has the correct height, but the client only stores the rows it has actually requested.

## Turn lazy loading on

Enable lazy loading with <DataSourcePropLink name="lazyLoad" />.

For flat, ungrouped data, use a `batchSize` so the grid knows how many records to ask for at a time:

```tsx {2}
<DataSource<Developer>
  lazyLoad={{ batchSize: 40 }}
  data={dataSource}
  primaryKey="id"
>
  <InfiniteTable<Developer> columns={columns} />
</DataSource>
```

When the user scrolls and then stops, Infinite Table waits for <PropLink name="scrollStopDelay" /> and calls your `data` function with the current lazy range.

```ts
const dataSource: DataSourceData<Developer> = ({
  lazyLoadStartIndex,
  lazyLoadBatchSize,
  sortInfo,
  groupBy,
  groupKeys,
}) => {
  return fetchRows({
    start: lazyLoadStartIndex,
    limit: lazyLoadBatchSize,
    sortInfo,
    groupBy,
    groupKeys,
  });
};
```

The promise should resolve to an object with `data` and `totalCount`:

```ts
{
  data: rows,
  totalCount: 100000,
}
```

`totalCount` is important. It lets the grid preserve the scroll height for the whole remote result while only filling in loaded ranges as they become visible.

<Sandpack title="Lazy loading a remote DataGrid" size="md" viewMode="preview">

<Description>

This example comes from the docs. Scroll through the DataGrid and notice that rows are requested in batches instead of loading the entire dataset up front.

</Description>

```tsx live file="$DOCS/learn/working-with-data/simple-lazy-load-example.page.tsx"

```

</Sandpack>

## Sorting and filtering stay server-aware

Lazy loading is not only "fetch the next rows". The `DataSource` call includes the current data params that affect the remote result:

- <DPropLink name="sortInfo" /> for server-side sorting
- <DPropLink name="filterValue" /> for server-side filtering
- <DPropLink name="groupBy" /> and `groupKeys` for grouped data
- `lazyLoadStartIndex` and `lazyLoadBatchSize` for the current batch

When sorting, filtering, grouping, or pivoting changes, Infinite Table discards the stale loaded data and asks for the right rows again. Your server receives the same state the user sees in the grid, so the batch it returns matches the current view.

That means you can keep one data-loading path:

1. Read the params from the `DataSource.data` function argument.
2. Translate them into your API query, SQL statement, or data-service request.
3. Return `{ data, totalCount }`.

The grid takes care of asking again when those params change.

## Lazy loading grouped rows

Grouped data is where lazy loading starts to feel especially useful. A grouped result may have thousands of rows under each country, account, repository, or customer, but the user only needs the groups and expanded branches they are looking at.

For grouped data, you can still provide a `batchSize`:

```tsx
const lazyLoad = { batchSize: 40 };

<DataSource
  data={dataSource}
  groupBy={groupBy}
  lazyLoad={lazyLoad}
  aggregationReducers={aggregationReducers}
>
  <InfiniteTable columns={columns} />
</DataSource>;
```

The `data` function receives `groupKeys`, which identify the current group branch. When a group is expanded, Infinite Table can request the first rows for that branch, then continue requesting more rows from the same group as the user scrolls.

<Sandpack title="Lazy loading grouped rows" size="lg" viewMode="preview">

<Description>

Expand a group and scroll inside it. The DataGrid requests grouped batches on demand while keeping aggregations and group rows visible.

</Description>

```tsx live file="$DOCS/learn/working-with-data/grouped-lazy-load-example.page.tsx"

```

</Sandpack>

If you pass `lazyLoad={true}` without a `batchSize`, Infinite Table loads all records from the current group level at once. That is often the right default for grouped or pivoted data where expansion, not viewport position alone, controls the next useful request.

## Lazy loading vs live pagination

Infinite Table also supports [live pagination](/docs/learn/working-with-data/live-pagination). The two features solve different data-loading shapes:

- Use lazy loading when the server can answer "give me rows from index N with this batch size" and can return a `totalCount`.
- Use live pagination when your API is cursor-based and appends more records as the user reaches the end.

Lazy loading is a good fit for searchable admin panels, audit logs, inventory tables, CRM records, analytics drilldowns, and other grids where users sort, filter, jump through a long result, or expand grouped branches.

Live pagination is a good fit for feed-like experiences where the next cursor matters more than the absolute row index.

## Practical defaults

A few defaults make lazy loading feel natural:

- Pick a `batchSize` larger than the visible row count so the next small scroll does not immediately trigger another request.
- Keep `primaryKey` stable. Loaded batches need reliable row identity.
- Forward `sortInfo`, `filterValue`, `groupBy`, `groupKeys`, `pivotBy`, and aggregation params to the backend when those features are enabled.
- Return an accurate `totalCount` for the current filtered result, not the unfiltered table.
- Use grouped lazy loading when expanding a group could reveal many children.

The result is a DataGrid that behaves like it has the whole dataset locally while keeping network and memory usage tied to what the user actually explores.

## Go deeper in the docs

- [Lazy loading](/docs/learn/working-with-data/lazy-loading) - the main docs page and examples
- [Working with data](/docs/learn/working-with-data) - the `DataSource` loading model
- [Server-side grouping with lazy loading](/docs/learn/grouping-and-pivoting/grouping-rows#server-side-grouping-with-lazy-loading) - grouped row format and group keys
- [Live pagination](/docs/learn/working-with-data/live-pagination) - cursor-based infinite loading
