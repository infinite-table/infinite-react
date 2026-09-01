---
title: Lazy loading remote rows in a React DataGrid
description: Use Infinite Table lazy loading to fetch only the visible row range, preserve full-scroll behavior, and combine remote data with sorting and grouping.
date: 2026-09-01
author: radu
tags: lazy-loading, datasource, react-datagrid
---

Large datasets rarely arrive in one convenient array. Audit logs, inventory
screens, observability events, and customer exports can easily grow from a few
thousand records to millions. Rendering only the visible DOM nodes solves one
part of the problem, but you still need a clean way to fetch the data window the
user is actually looking at.

Infinite Table's [lazy loading docs](/docs/learn/working-with-data/lazy-loading)
cover that exact pattern. The key idea is simple: let `<DataSource />` ask your
server for the visible row range, while `<InfiniteTable />` keeps the scroll
experience feeling like the full dataset is already there.

## Enable lazy loading on the DataSource

Lazy loading is a `DataSource` concern because the data pipeline owns loading,
sorting, filtering, grouping, pivoting, and aggregation before the grid renders
rows.

For an ungrouped remote table, enable
<DataSourcePropLink name="lazyLoad" /> with a batch size:

```tsx {2,7}
const lazyLoad = React.useMemo(() => ({ batchSize: 40 }), []);

<DataSource<Developer>
  data={dataSource}
  primaryKey="id"
  lazyLoad={lazyLoad}
>
  <InfiniteTable<Developer> columns={columns} />
</DataSource>;
```

The `batchSize` tells the `DataSource` how many records to request for each
window. The grid still renders a scrollable surface for the whole remote result
set, because the server response includes the total row count.

## Return data plus totalCount

When lazy loading is enabled, the `data` prop is a function that returns a
promise. That promise resolves to an object with the current slice of rows and
the total number of rows available remotely:

```tsx
{
  data: rows,
  totalCount: 10000,
}
```

The `DataSource` calls that function with lazy-loading parameters:

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

  return fetch(`/developers10k-sql?${params}`).then((response) =>
    response.json(),
  );
};
```

Those parameters are the contract between Infinite Table and your API:

- `lazyLoadStartIndex` says where the requested window starts.
- `lazyLoadBatchSize` says how many rows to return.
- `sortInfo`, `filterValue`, `groupBy`, `pivotBy`, and
  `aggregationReducers` describe the active data operation.
- `groupKeys` identifies the current group when loading grouped data.

That keeps the client component small. Your backend can translate the request
into SQL `OFFSET` / `LIMIT`, cursor windows, search-engine queries, or whatever
data access layer your app already uses.

<Sandpack title="Lazy loading ungrouped data" size="md" viewMode="preview">

<Description>

Scroll through 10k developer rows. The demo uses the same example from the
[lazy loading docs](/docs/learn/working-with-data/lazy-loading), with
`DataSource.lazyLoad` requesting rows in batches.

</Description>

```tsx live file="$DOCS/learn/working-with-data/simple-lazy-load-example.page.tsx"

```

</Sandpack>

## Sorting and filtering stay server-aware

A lazy-loaded grid cannot sort only the rows currently in the browser. The
server must sort the complete remote result, then return the requested slice
from that sorted result.

Infinite Table handles the client side of that coordination. When
<DPropLink name="sortInfo" />, <DPropLink name="filterValue" />, or
<DPropLink name="groupBy" /> changes, the current loaded rows are discarded and
the `DataSource.data` function is called again with the new state.

In product terms, this means the user can click a sortable column header and
the next response represents the sorted dataset, not a local rearrangement of
the current viewport.

## Lazy loading also works with grouped rows

Grouped data has one more dimension: the server needs to know which group is
being loaded. Infinite Table passes `groupKeys` to identify the active group,
and it can request additional batches as users expand groups and continue
scrolling.

That matters for datasets such as:

- activity logs grouped by customer and event type
- orders grouped by region and fulfillment status
- tickets grouped by priority and product area
- employees grouped by country and technology stack

You can combine lazy loading with <DataSourcePropLink name="groupBy" /> and
<DataSourcePropLink name="aggregationReducers" /> so parent rows show remote
aggregate values while leaf rows are fetched only when needed.

<Sandpack title="Lazy loading grouped data" size="md" viewMode="preview">

<Description>

Expand groups and scroll through them. The server receives the active
`groupKeys`, grouping configuration, aggregation reducers, and lazy-load window
before returning the next batch.

</Description>

```tsx live file="$DOCS/learn/working-with-data/grouped-lazy-load-example.page.tsx"

```

</Sandpack>

## When to reach for this pattern

Use lazy loading when the user needs the feeling of one continuous grid, but
your app should not download the entire result set up front:

- large admin tables where filters can still match thousands of rows
- logs and event streams where recent rows are common but history must remain
  reachable
- inventory, catalog, or transaction grids backed by a database
- grouped reports where expanding every branch would be wasteful

Start with the [lazy loading guide](/docs/learn/working-with-data/lazy-loading)
and wire your `DataSource.data` function to the same parameters your backend
already understands. Infinite Table takes care of asking for the next window at
the right time, including after sorting, filtering, grouping, and scrolling
changes.
