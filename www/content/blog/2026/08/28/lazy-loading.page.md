---
title: Lazy-loading large React DataGrids with Infinite Table
description: Use Infinite Table DataSource.lazyLoad to fetch viewport-sized batches, keep server-side sorting and grouping in sync, and render large datasets without loading every row up front.
date: 2026-08-28
author: radu
tags: lazy-loading, datasource, performance
---

Large datasets usually arrive with two competing requirements: users want the grid to feel like every row is already there, but your app should not download every row just to render the first screen.

Infinite Table's [lazy-loading docs](/docs/learn/working-with-data/lazy-loading) cover the pattern that bridges those requirements. You enable lazy loading on the `<DataSource />`, return a small batch of rows from your backend, and let the grid request more data as the user scrolls.

The important detail is that lazy loading is not just "fetch the next page." The `DataSource` passes sorting, grouping, pivoting, aggregation, group key, and batch information to your data function, so the backend can return the right slice for the current grid state.

## Start with `DataSource.lazyLoad`

Lazy loading is enabled with <DataSourcePropLink name="lazyLoad" />. For flat data, pass an object with a `batchSize` so the grid knows how many remote records to request for each viewport-driven batch.

```tsx {3}
<DataSource<Developer>
  data={dataSource}
  lazyLoad={{ batchSize: 40 }}
  primaryKey="id"
>
  <InfiniteTable<Developer> columns={columns} />
</DataSource>
```

The user still scrolls through one continuous DataGrid. Infinite Table sets the scroll height from the remote `totalCount`, renders placeholders for rows that have not been loaded yet, and asks the `DataSource.data` function for the records around the visible range.

<Sandpack title="Lazy loading a remote DataGrid" size="md" viewMode="preview">

<Description>

This example is reused from the lazy-loading docs. Scroll through the grid to trigger viewport-sized remote requests.

</Description>

```tsx live file="$DOCS/learn/working-with-data/simple-lazy-load-example.page.tsx"

```

</Sandpack>

## Return `data` and `totalCount`

For lazy loading to work, the <DPropLink name="data">DataSource.data</DPropLink> function should return a promise that resolves to an object with two core fields:

```tsx
{
  data: rows,
  totalCount: 10000,
}
```

`data` contains the rows for the requested slice. `totalCount` tells Infinite Table how large the full remote dataset is, so scrolling can behave naturally before every row is fetched.

The function receives the batch coordinates:

```tsx
const dataSource = ({
  lazyLoadStartIndex,
  lazyLoadBatchSize,
}) => {
  return fetch(
    `/api/developers?start=${lazyLoadStartIndex}&limit=${lazyLoadBatchSize}`,
  ).then((response) => response.json());
};
```

That request can map directly to SQL `OFFSET` / `LIMIT`, an indexed search query, or a backend service that knows how to return a stable window of data.

## Send grid state to the backend

The docs example forwards more than `start` and `limit`. It also serializes the current `sortInfo`, `groupBy`, `pivotBy`, `aggregationReducers`, and `groupKeys` values.

```tsx {4,5,6,7,8}
const dataSource = ({
  lazyLoadStartIndex,
  lazyLoadBatchSize,
  sortInfo,
  groupBy,
  groupKeys = [],
  pivotBy,
  aggregationReducers,
}) => {
  // Build the remote query from the current DataSource state.
};
```

This is what makes the feature useful in real products. If a user sorts by salary, filters by country, groups by department, or opens a pivoted report, the next lazy request should be for that exact view of the data. Infinite Table invalidates the old loaded rows and calls your data function again when data-affecting state changes.

In practice, your backend contract often becomes:

- `start` and `limit` for the requested batch
- `sortInfo` for server-side ordering
- `filterValue` when filters are enabled
- `groupBy` and `groupKeys` when the user expands grouped rows
- `pivotBy` and `aggregationReducers` for report-style datasets

The table handles the UI state transitions; your data function translates the request into the remote query.

## Pick the right batch behavior

<DataSourcePropLink name="lazyLoad" /> can be either `true` or an object with `batchSize`.

For ungrouped data, prefer an explicit batch size:

```tsx
<DataSource lazyLoad={{ batchSize: 40 }} />
```

That keeps each request small and predictable as the user scrolls.

For grouped or pivoted data, `lazyLoad={true}` can be useful because Infinite Table can request all rows at the current group level when a group is expanded. If you still provide a `batchSize`, grouping is batched too: expanding a group fetches the first slice, then scrolling inside or past that group requests the next needed slice.

## Lazy loading grouped data

Grouped data adds one more piece of context: `groupKeys`. The `groupKeys` array identifies which group is currently being loaded, so your backend can return children for that branch instead of another top-level slice.

```tsx {5}
const dataSource = ({
  groupBy,
  groupKeys = [],
  lazyLoadStartIndex,
  lazyLoadBatchSize,
}) => {
  return fetch('/api/developers/grouped', {
    method: 'POST',
    body: JSON.stringify({
      groupBy,
      groupKeys,
      start: lazyLoadStartIndex,
      limit: lazyLoadBatchSize,
    }),
  }).then((response) => response.json());
};
```

The grouped lazy-loading docs example also sends expanded group state as `prefetchGroupKeys`, which lets the server prepare rows for groups that are already open.

<Sandpack title="Lazy loading grouped data" size="md" viewMode="preview">

<Description>

Expand groups and scroll through the rows. The DataSource sends group and batch information to the backend for each requested range.

</Description>

```tsx live file="$DOCS/learn/working-with-data/grouped-lazy-load-example.page.tsx"

```

</Sandpack>

## When to use lazy loading

Reach for lazy loading when the full dataset is too large, too expensive, or too slow to load into the browser at once:

- admin screens over tens of thousands of records
- audit logs and event streams with server-side sorting
- customer or order lists where filters should run on indexed backend data
- grouped financial, inventory, or analytics grids
- pivoted reports where aggregated rows are computed remotely

Use regular in-memory data when the dataset is small and already available. Use lazy loading when the backend owns the source of truth and the grid should ask for only the rows needed for the current viewport and state.

## Go deeper in the docs

Start with the [lazy-loading guide](/docs/learn/working-with-data/lazy-loading), then continue with:

- [Working with data](/docs/learn/working-with-data) for the broader `DataSource` model
- [Live pagination](/docs/learn/working-with-data/live-pagination) when your backend is cursor-first rather than index-first
- [Server-side grouping](/docs/learn/grouping-and-pivoting/grouping-rows#server-side-grouping-with-lazy-loading) when grouped rows should be loaded on demand
- [Server-side pivoting](/docs/learn/grouping-and-pivoting/pivoting/overview#server-side-pivoting) when pivot values are computed remotely
