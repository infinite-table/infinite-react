---
title: "Lazy loading in a React DataGrid: fetch rows only when the viewport needs them"
description: "Use Infinite Table DataSource lazy loading to request visible row ranges, preserve the scrollbar for large remote datasets, and keep sorting, filtering, grouping, and pivoting server-aware."
date: 2026-09-22
author: radu
tags: lazy-loading, datasource, performance
---

Large datasets usually live on the server for a reason. Shipping 100k rows to the browser so a user can inspect the first screen makes the first render slower, increases memory pressure, and still leaves you with server-side sorting and filtering to solve later.

Infinite Table's [lazy loading docs](/docs/learn/working-with-data/lazy-loading) describe a more direct model: the DataGrid keeps the scroll experience for the full remote dataset, but the `<DataSource />` only asks your server for the row range the viewport needs.

## What lazy loading changes

Enable lazy loading on the `<DataSource />` with <DataSourcePropLink name="lazyLoad" />.

```tsx
const lazyLoad = { batchSize: 40 };

<DataSource<Developer>
  primaryKey="id"
  data={dataSource}
  lazyLoad={lazyLoad}
>
  <InfiniteTable<Developer> columns={columns} />
</DataSource>;
```

The grid still renders as if the whole remote dataset is available. The scrollbar height reflects the `totalCount` returned by your backend, while the data function receives the range it should load next:

```tsx
const dataSource: DataSourceData<Developer> = ({
  lazyLoadStartIndex,
  lazyLoadBatchSize,
  sortInfo,
  groupBy,
  groupKeys = [],
}) => {
  const params = new URLSearchParams({
    start: String(lazyLoadStartIndex ?? 0),
    limit: String(lazyLoadBatchSize ?? 40),
    groupKeys: JSON.stringify(groupKeys),
  });

  if (sortInfo) {
    params.set('sortInfo', JSON.stringify(sortInfo));
  }

  if (groupBy) {
    params.set('groupBy', JSON.stringify(groupBy));
  }

  return fetch(`/api/developers?${params}`).then((response) =>
    response.json(),
  );
};
```

For lazy loading, the promise resolves to an object with two fields:

```ts
{
  data: rows,
  totalCount: 10000,
}
```

That `totalCount` is what lets Infinite Table preserve the scroll range while only holding loaded batches in the client.

## Start with ungrouped data

For a flat remote dataset, pass an object with a `batchSize`. The DataSource calls your `data` function after scrolling settles, using <PropLink name="scrollStopDelay" /> to avoid turning every scroll frame into a network request.

<Sandpack title="Lazy loading ungrouped data" size="md" viewMode="preview">

<Description>

This example asks the server for batches of 40 rows. Scroll through the grid and the DataSource requests the visible range on demand.

</Description>

```tsx live file="$DOCS/learn/working-with-data/simple-lazy-load-example.page.tsx"

```

</Sandpack>

The useful part is that lazy loading composes with the DataSource state. When sorting or filtering changes, Infinite Table discards the previously loaded rows and calls the `data` function again with the new parameters. Your server receives the range request and the data operation that produced it.

That gives you one place to describe the backend query:

- `lazyLoadStartIndex` and `lazyLoadBatchSize` define the slice
- `sortInfo` defines the current server-side sort
- `groupBy`, `pivotBy`, and `aggregationReducers` describe analytical views
- `groupKeys` identifies the current group branch when grouping is enabled

## Grouped lazy loading

Lazy loading is especially useful with grouped data because expanding a group should not require loading every child row in advance.

When the user expands a group, Infinite Table can request the first batch for that group. As the user scrolls through the expanded area, it requests more rows for the same branch. If the viewport moves beyond that branch, the DataSource can fetch rows from sibling groups as needed.

<Sandpack title="Lazy loading grouped data" size="lg" viewMode="preview">

<Description>

This demo groups developers by country and stack, then lazily loads rows inside the visible group ranges. Expand a group and scroll to see the server-side batches fill in.

</Description>

```tsx live file="$DOCS/learn/working-with-data/grouped-lazy-load-example.page.tsx"

```

</Sandpack>

The same <DataSourcePropLink name="lazyLoad" /> prop can be a boolean or an object. Use `lazyLoad={{ batchSize: 40 }}` for ungrouped datasets where every viewport request should be a fixed-size slice. Use `lazyLoad={true}` when grouped or pivoted data should load the current level at once, usually after a group row is expanded.

## Lazy loading or live pagination?

Infinite Table also supports [live pagination](/docs/learn/working-with-data/live-pagination). Both approaches keep the initial payload small, but they solve different UX problems.

Use lazy loading when:

- the server can answer range-based requests
- the user should be able to scroll through the whole remote result set
- sorting, filtering, grouping, or pivoting should reset the loaded range
- the scrollbar should represent `totalCount`

Use live pagination when:

- your backend exposes cursor-based pagination
- rows should append as the user reaches the end
- there is no reliable random-access row index

If the backend can return `{ data, totalCount }` for a requested range, lazy loading usually gives the most grid-like experience.

## Implementation checklist

Before shipping a lazy-loaded grid, make sure you have:

1. a stable <DataSourcePropLink name="primaryKey" /> for every row
2. a `data` function that returns a promise
3. `{ data, totalCount }` in the server response
4. a `batchSize` for flat data
5. backend support for the DataSource params you enable in the UI
6. a tuned <PropLink name="scrollStopDelay" /> if the default scroll pause is too eager or too slow for your API

Start with the [lazy loading docs](/docs/learn/working-with-data/lazy-loading), then open the grouped example if your users need server-side grouping or pivoting over large datasets.
