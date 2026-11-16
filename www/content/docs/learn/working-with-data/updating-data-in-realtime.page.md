---
title: Updating Data in Real-Time
---

Real-Time updates of data are possible via the [DataSource API](/docs/reference/datasource-api).

In this page we explain some of the complexities and features involved.

## Getting a reference to the DataSource API

<Note>

Data Updates are related to the `DataSource` component, therefore make sure you use the [DataSource API](/docs/reference/datasource-api) for this.

You can get a reference to the [DataSource API](/docs/reference/datasource-api)

- either by using <DPropLink name="onReady" code={false}>the DataSource onReady</DPropLink> prop

```tsx file="updating-data-in-realtime.snippet.tsx" region="getting-a-reference-to-the-datasource-api"
```

- or by using the <PropLink name="onReady" code={false}>InfiniteTable onReady</PropLink> prop.

```tsx file="updating-data-in-realtime.snippet.tsx" region="infinite-table-on-ready"
```

</Note>

## Updating Rows

To update the data of a row, you need to know the `primaryKey` for that row and use the <DApiLink name="updateData" /> method of the [DataSource API](/docs/reference/datasource-api).

```tsx file="updating-data-in-realtime.snippet.tsx" region="updating-a-single-row-using-datasourceapi" title="Updating_a_single_row_using_dataSourceApi.updateData"
```

To update multiple rows, you need to pass the array of data items to the <DApiLink name="updateDataArray" /> method.

```tsx file="updating-data-in-realtime.snippet.tsx" region="updating-multiple-rows" title="Updating_multiple_rows"
```

<DemoDescription>

The DataSource has 10k items - use the **Start/Stop** button to see updates in real-time.

In this example, we're updating 5 rows (in the visible viewport) every 30ms.

The update rate could be much higher, but we're keeping it at current levels to make it easier to see the changes.

</DemoDescription>

```tsx file="realtime-updates-example.demo.tsx" title="Live data updates with DataSourceApi.updateData"
```

<Note>

For updating multiple rows, use the <DApiLink name="updateDataArray" /> method.

When updating a row, the data object you pass to the `updateData` method needs to at least include the <DPropLink name="primaryKey" /> field. Besides that field, it can include any number of properties you want to update for the specific row.

</Note>

## Batching updates

All the methods for updating/inserting/deleting rows exposed via the [DataSource API](/docs/reference/datasource-api) are batched by default. So you can call multiple methods on the same raf (requestAnimationFrame), and they will trigger a single render.

All the function calls made in the same raf return the same promise, which is resolved when the data is persisted to the `DataSource`

```tsx file="updating-data-in-realtime.snippet.tsx" region="updates-made-on-the-same-raf-are-batched" title="Updates_made_on_the_same_raf_are_batched_together"
```

## Inserting Rows

To insert a new row into the `DataSource`, you need to use the <DApiLink name="insertData" /> method. For inserting multiple rows at once, use the <DApiLink name="insertDataArray" /> method.

```tsx file="updating-data-in-realtime.snippet.tsx" region="inserting-a-single-row" title="Inserting_a_single_row"
```

When you insert new data, as a second parameter, you have to provide an object that specifies the insert `position`.

Valid values for the insert `position` are:

- `start` | `end` - inserts the data at the beginning or end of the data source. In this case, no `primaryKey` is needed.

```tsx file="updating-data-in-realtime.snippet.tsx" region="inserting-rows"
```

- `before` | `after` - inserts the data before or after the data item that has the specified primary key. **In thise case, the `primaryKey` is required.**

```tsx file="updating-data-in-realtime.snippet.tsx" region="inserting-rows-before-after"
```

<DemoDescription>

Click any row in the table to make it the current active row, and then use the second button to add a new row after the active row.

</DemoDescription>

```tsx file="insert-example.demo.tsx" title="Using dataSourceApi.insertData"
```

### Adding rows

In addition to the <DApiLink name="insertData" /> and <DApiLink name="insertDataArray" /> methods, the `DataSource` also exposes the <DApiLink name="addData" /> and <DApiLink name="addDataArray" /> methods (same as insert with `position=end`).

## Deleting Rows

To delete rows from the `DataSource` you either need to know the `primaryKey` for the row you want to delete, or you can pass the data object (or at least a partial that contains the `primaryKey`) for the row you want to delete.

All the following methods are available via the [DataSource API](/docs/reference/datasource-api):

- <DApiLink name="removeData" />
- <DApiLink name="removeDataArray" />
- <DApiLink name="removeDataByPrimaryKey" />
- <DApiLink name="removeDataArrayByPrimaryKeys" />
