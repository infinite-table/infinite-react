---
title: Server-side Filtering
description: Learn how to integrate server-side filtering with your InfiniteTable React DataGrid
---

If you're using a remote <DPropLink name="data" /> prop (a function that returns a `Promise`) on the `<DataSource />` component, the filtering will happen server-side by default.

<Note>

You can explicitly configure server-side filtering by using <DPropLink name="filterMode">filterMode="remote"</DPropLink>.

</Note>

When remote filtering is enabled, the <DPropLink name="data" /> function prop will be called with an object argument that includes the `filterValue` property, so the filters can be sent to the server for performing the correct filtering operations.

<Note>

Obviously the filtering can be combined with sorting, grouping, etc.

It's up to the <DPropLink name="data" /> function prop to send the correct parameters to the server for remote operations.

The returned JSON can include both

- a `totalCount` property (`number`) and
- a `totalCountUnfiltered` property (also `number`) - to inform the `<DataSource />` of the size of the data, both with and without the applied filters.

</Note>

<Sandpack title="Server-side filtering example">

<Description>

All the filtering in this example happens server-side.

This example also does server-side (multiple) sorting.

</Description>

```ts file="server-side-example.page.tsx"

```

</Sandpack>

<Note>

When the filter value for a column matches the empty value - as specified in the <DPropLink name="filterTypes">filterTypes.operator.emptyValues</DPropLink> - that value is not sent to the server as part of the `filterValue` array.
</Note>

<Note>

When doing server-side filtering, it's your responsability as a developer to make sure you're sending the correct filtering parameters to the server, in a way the server understands it.

This means that the filter values, the filter type and the names of the operators are known to the server and there is a clear convention of what is supported or not.

</Note>

## Batch filtering

In order to reduce the number of requests sent to the server, filtering will be batched by default.

Batching is controlled by the <DPropLink name="filterDelay"/> prop, which, if not specified, defaults to `200` milliseconds. This means, any changes to the column filters, that happen inside a 200ms window (or the current value of <DPropLink name="filterDelay"/>), will be debounced and only the last value will be sent to the server.

<Note>

If you want to prevent debouncing/batching filter values, you can set <DPropLink name="filterDelay"/> to `0`.

</Note>
