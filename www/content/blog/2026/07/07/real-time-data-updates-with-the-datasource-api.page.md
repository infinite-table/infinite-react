---
title: Real-time data updates in your React DataGrid
description: Use the Infinite Table DataSource API to stream row updates, batch changes, and keep large datasets responsive.
date: 2026-07-07
author: radu
tags: realtime, datasource, performance
---

Most data grids are not showing static data anymore. Dashboards receive fresh metrics, trading screens react to price changes, logistics apps track moving assets, and admin tools often need to reflect edits made by other users.

Infinite Table already has a focused docs page for [updating data in real time](/docs/learn/working-with-data/updating-data-in-realtime), so let's highlight the core idea: update the `DataSource`, not the whole grid.

## The DataSource API owns row updates

The `DataSource` component is responsible for loading, processing, and preparing data for `<InfiniteTable />`. When you need to change rows after the grid is mounted, use the [DataSource API](/docs/reference/datasource-api).

You can get access to it from `DataSource.onReady`:

```tsx
const onReady = (dataSourceApi) => {
  // store the dataSourceApi and use it when updates arrive
};

<DataSource onReady={onReady} />;
```

Or from `InfiniteTable.onReady`, where you receive both the grid API and the DataSource API:

```tsx
const onReady = ({ api, dataSourceApi }) => {
  // api controls grid behavior
  // dataSourceApi controls data updates
};

<DataSource primaryKey="id" data={data}>
  <InfiniteTable onReady={onReady} />
</DataSource>;
```

## Update one row by primary key

To update a row, call `dataSourceApi.updateData` with an object that includes the configured <DataSourcePropLink name="primaryKey" /> field. Any other fields you include are merged into the existing row data.

```tsx {1,3}
dataSourceApi.updateData({
  id: 42,
  salary: 124000,
  currency: 'USD',
  reposCount: 37,
});
```

This keeps the update local to the row data that changed. You do not need to rebuild the whole array just because one value moved.

## Update many rows without creating render noise

When several rows change together, use `dataSourceApi.updateDataArray`.

```tsx {1,3,9}
dataSourceApi.updateDataArray([
  {
    id: 42,
    salary: 124000,
    currency: 'USD',
  },
  {
    id: 73,
    salary: 118500,
    currency: 'EUR',
  },
]);
```

The docs call out an important implementation detail: DataSource row mutations are batched by default. Multiple insert, update, or delete calls made in the same `requestAnimationFrame` resolve through the same promise and trigger one render pass.

```tsx
const firstUpdate = dataSourceApi.updateData({
  id: 1,
  salary: 115000,
});

const secondUpdate = dataSourceApi.updateData({
  id: 2,
  salary: 99000,
});

firstUpdate === secondUpdate; // true
```

That batching matters when updates are frequent. It lets your app react to a stream of changes while Infinite Table keeps the rendering work grouped.

## See it with 10k rows

The live demo below uses the same example from the [Live Updates docs page](/docs/learn/examples/live-updates-example). It loads 10k rows and, when started, updates five rows from the visible viewport every 30ms.

<Sandpack title="Real-time DataSource updates with 10k rows" size="md" viewMode="preview">

<Description>

Click **Start updates** to update visible rows in real time. The example uses the DataSource API to change individual rows without replacing the whole dataset.

</Description>

```tsx live file="$DOCS/learn/working-with-data/realtime-updates-example.page.tsx"

```

</Sandpack>

## When to use this pattern

Reach for the DataSource API when data changes after initial load:

- websocket or SSE feeds
- polling that returns changed records
- optimistic updates after user edits
- background imports that append or remove rows
- dashboards where visible values change continuously

For simple local state, replacing the `data` prop can be fine. For ongoing row-level changes, the DataSource API gives you a clearer contract: every mutation includes the primary key, and Infinite Table handles the data update pipeline.

Start with the docs page on [updating data in real time](/docs/learn/working-with-data/updating-data-in-realtime), then open the live updates example and adapt the update loop to your app's data source.
