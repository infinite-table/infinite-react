---
title: Live Pagination
description: Live Pagination DataSource documentation and examples for Infinite Table DataGrid
---


`InfiniteTable` supports live pagination in its `DataSource` via the <DataSourcePropLink name="livePagination" /> prop together with <DataSourcePropLink name="livePaginationCursor" />

Specify `DataSource.livePagination=true` and provide a pagination cursor (a good cursor would be the id of the last item in the `DataSource`).

In addition, you have to listen to <DataSourcePropLink name="onDataParamsChange" /> which will be triggered with an object that contains the following properties:

- `sortInfo` - information about the current sort state
- `groupBy` - current grouping info
- `livePaginationCursor` - the current pagination cursor

When `dataParams` change (you will be notified via <DataSourcePropLink name="onDataParamsChange" />), you have to fetch new data using the cursor from `dataParams` object.

<Note title="onDataParamsChange trigger">

Basically <DataSourcePropLink name="onDataParamsChange" /> is triggered whenever props (and state) that affect the `DataSource` change - be it via sorting, filtering, live pagination, pivoting, etc.
</Note>

Below you can see a live pagination demo implemented in combination with [react-query](https://react-query.tanstack.com/).

<Sandpack title="Live pagination - with react-query" deps="react-query">

```ts file=live-pagination-example.page.tsx

```

</Sandpack>

In the example above, play around and scroll the table and also make sure to try sorting (eg: sort by country or city).

<Note>

For demo purposes, the page size in the example above is small - it shows that `InfiniteTable` handles infinite pagination correctly by immediately triggering <DataSourcePropLink name="onDataParamsChange" /> when there are not enough rows to fill the viewport.

On the other hand, when there are many rows and there is a horizontal scrollbar, it triggers <DataSourcePropLink name="onDataParamsChange" /> only when the user scrolls to the end of the table.

It also handles the case when there is a vertical scrollbar and then the user resizes the viewport to make it bigger and no more vertical scrollbar is needed - again <DataSourcePropLink name="onDataParamsChange" /> is triggered to request more rows.

</Note>
