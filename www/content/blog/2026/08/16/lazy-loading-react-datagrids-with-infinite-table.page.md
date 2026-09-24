---
title: Lazy loading React DataGrids with Infinite Table
description: Use Infinite Table DataSource.lazyLoad to fetch only the row ranges users need while keeping remote datasets scrollable, sortable, and groupable.
date: 2026-08-16
author: radu
tags: lazy-loading, datasource, react-datagrid
---

Large datasets usually create the same trade-off: either load too much data up front, or make users page through slices that break the flow of exploration.

Infinite Table's [Lazy Loading docs](/docs/learn/working-with-data/lazy-loading) show a third option. The grid can keep the full scroll experience while the `DataSource` asks your backend only for the row range that is needed around the current viewport.

That means a product screen can feel like a normal, scrollable DataGrid even when the source table has tens of thousands of rows.

## Lazy loading belongs in the DataSource

Lazy loading is enabled on `<DataSource />`, not on `<InfiniteTable />`, because the feature is about how data is requested and prepared before rendering.

```tsx {4}
<DataSource<Developer>
  data={dataSource}
  primaryKey="id"
  lazyLoad={{ batchSize: 40 }}
>
  <InfiniteTable<Developer> columns={columns} />
</DataSource>
```

The `lazyLoad` prop can be `true` or an object with a `batchSize`. For ungrouped data, a batch size is usually what you want: it tells the `DataSource` how many records to request when the user scrolls into a new range.

For grouped or pivoted datasets, `lazyLoad={true}` can be enough when expanding a group should load that level at once. If you also provide a `batchSize`, Infinite Table can fetch group rows in smaller ranges as users continue scrolling.

## Return both rows and total count

For lazy loading, the <DPropLink name="data" /> function must resolve to an object with two fields:

```tsx
return {
  data: rows,
  totalCount: 10000,
};
```

`data` is the batch for the requested range. `totalCount` tells the grid how tall the remote dataset is, so the scrollbar can represent the full result set even though most rows have not been downloaded yet.

The `DataSource` calls your data function with the current loading window:

```tsx
const dataSource: DataSourceData<Developer> = ({
  lazyLoadStartIndex,
  lazyLoadBatchSize,
  sortInfo,
  groupBy,
  groupKeys = [],
}) => {
  const start = lazyLoadStartIndex || 0;
  const limit = lazyLoadBatchSize || 40;

  return fetchRows({
    start,
    limit,
    sortInfo,
    groupBy,
    groupKeys,
  });
};
```

That request shape maps cleanly to SQL `LIMIT/OFFSET`, document database cursors that can emulate ranges, or an API endpoint that accepts `start` and `limit` query parameters.

## Try the basic lazy loading demo

The docs example below uses a 10k-row developers endpoint and sets `lazyLoad` to `{ batchSize: 40 }`. Scroll through the grid and notice that the component behaves like it already knows the full dataset size, while the `DataSource` keeps fetching only the ranges the viewport needs.

<Sandpack title="Lazy loading ungrouped data" size="md" viewMode="preview">

<Description>

This example is reused from the Lazy Loading docs. It requests records in batches as the visible row range changes.

</Description>

```tsx live file="$DOCS/learn/working-with-data/simple-lazy-load-example.page.tsx"

```

</Sandpack>

## Sorting and filtering stay server-aware

Lazy loading is most useful when the server owns the large dataset. Infinite Table keeps that contract intact when data parameters change.

When <DPropLink name="sortInfo" />, <DPropLink name="filterValue" />, or <DPropLink name="groupBy" /> changes, the current lazy-loaded rows are discarded and the data function is called again with the new params. Your backend returns the first matching range for the new state, and the grid renders the fresh result.

In practice, that gives you one data-loading path for several user actions:

- initial load: request the first visible range
- scroll: request the next needed range
- sort: request the first range for the new sort order
- filter: request the first range for the filtered result set
- group: request the first group-level rows and then child ranges as groups expand

You do not need to replace the whole grid setup for those cases. Keep them as inputs to the `DataSource.data` function and let Infinite Table coordinate when loading should happen.

## Grouped lazy loading

Grouped data adds one more important piece: the server needs to know which group branch is being requested.

The docs example uses `groupKeys` to identify the current group path and includes expanded group state so the backend can prefetch rows for open groups:

```tsx {6,10}
const dataSource: DataSourceData<Developer> = ({
  lazyLoadStartIndex,
  lazyLoadBatchSize,
  groupRowsState,
  groupKeys = [],
}) => {
  const args = [
    `start=${lazyLoadStartIndex || 0}`,
    `limit=${lazyLoadBatchSize || 40}`,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    `prefetchGroupKeys=${JSON.stringify(groupRowsState?.expandedRows || [])}`,
  ];

  return fetch(`/developers10k-sql?${args.join('&')}`).then((r) => r.json());
};
```

This is the difference between loading "rows 80-120" from a flat table and loading "rows 80-120 inside the Country > Stack group branch". Infinite Table supplies the data params; your backend applies them to the grouped query.

<Sandpack title="Lazy loading grouped data" size="md" viewMode="preview">

<Description>

Expand groups and scroll inside the result set. The `DataSource` requests grouped ranges with `groupKeys`, sorting info, and aggregation reducers.

</Description>

```tsx live file="$DOCS/learn/working-with-data/grouped-lazy-load-example.page.tsx"

```

</Sandpack>

## Lazy loading vs live pagination

Infinite Table also supports [live pagination](/docs/learn/working-with-data/live-pagination). Both features help with remote data, but they solve different UX problems.

Use lazy loading when:

- the scrollbar should represent the whole remote result set
- users need to jump through a large sorted or filtered table
- rows can be requested by range
- grouped or pivoted data should load as branches are expanded

Use live pagination when:

- new pages are appended as the user reaches the end
- your API is naturally cursor-based
- the UI should behave like an infinite feed

For enterprise grids, lazy loading is often the better fit because users expect a table scrollbar, not just a feed that grows downward.

## A practical checklist

When wiring lazy loading into your app, start with the data contract:

1. Add <DPropLink name="primaryKey" /> so rows have stable identities.
2. Enable <DataSourcePropLink name="lazyLoad" /> with a batch size that matches your API and expected row height.
3. Make <DPropLink name="data" /> return `{ data, totalCount }`.
4. Use `lazyLoadStartIndex` and `lazyLoadBatchSize` to request the current range.
5. Pass through sorting, filtering, grouping, pivoting, and aggregation params to the backend.
6. For grouped data, use `groupKeys` to identify the branch being requested.

From there, the grid can keep a responsive scroll surface while the server does the heavy lifting.

Start with the [Lazy Loading docs](/docs/learn/working-with-data/lazy-loading), then open the examples above and adapt the `dataSource` function to your API shape.
