---
title: DataSource API
layout: API
---

When rendering the `DataSource` component, you can get access to the API by getting it from the <DPropLink name="onReady" /> callback prop.

```tsx {3}
<DataSource<DATA_TYPE>
  
  onReady={(api: DataSourceApi<DATA_TYPE>) => {
    // api is accessible here
    // you may want to store a reference to it in a ref or somewhere in your app state
  }}
/>
```

You can also get it from the `InfiniteTable` <PropLink name="onReady" /> callback prop:


```tsx {4}
<InfiniteTable<DATA_TYPE>
  columns={[...]}
  onReady={(
    {api, dataSourceApi}: {
      api: InfiniteTableApi<DATA_TYPE>,
      dataSourceApi: DataSourceApi<DATAT_TYPE>
    }) => {

    // both api and dataSourceApi are accessible here
  }}
/>
```

For API on row/group selection, see the [Selection API page](./selection-api).


<PropTable sort searchPlaceholder="Type to filter API methods">



<Prop name="addData" type="(data: DATA_TYPE) => Promise">

> Adds the specified data at the end of the data source.

The given data param should be of type `DATA_TYPE` (the TypeScript generic data type that the `DataSource` was bound to).

For adding an array of data, see the <DApiLink name="addDataArray" /> method.

<Note>

If the component has <DPropLink name="sortInfo" code={false}>sorting</DPropLink>, the added data might not be displayed at the end of the data source.

</Note>

This method batches data updates and waits for a request animation frame until it persists the data to the `DataSource`. This means you can execute multiple calls to `addData` (or <DPropLink name="updateData"/>, <DPropLink name="removeData"/>, <DPropLink name="insertData"/>) in the same frame and they will be batched and persisted together.

The return value is a `Promise` that resolves when the data has been added. When multiple `addData` (and friends) calls are executed in the same frame, the result of those calls is a reference to the same promise.


```ts
const promise1 = dataSourceApi.add({ ... })
const promise2 = dataSourceApi.add({ ... })
const promise3 = dataSourceApi.insertData({ ... }, { position: 'before', primaryKey: 4 })

// promise1, promise2 and promise3 are the same promise
// as the calls are run in the same raf and batched together
// promise1 === promise2
// promise1 === promise3
```

For adding an array of data, see the <DApiLink name="addDataArray" /> method.
For inserting data at a specific position, see the <DApiLink name="insertData" /> method.

<Sandpack title="Using DataSourceApi.addData to update the DataSource">

```ts file="addData-example.page.tsx"
```

</Sandpack>

</Prop>

<Prop name="addDataArray" type="(data: DATA_TYPE[]) => Promise">

> Adds an array of data at the end of the data source

See related <DApiLink name="addData" /> method.

For adding at the beginning of the data source, see the <DApiLink name="insertDataArray" /> method.

</Prop>



<Prop name="getDataByPrimaryKey" type="(primaryKey: string | number) => DATA_TYPE | undefined">

> Retrieves the data object for the specified primary key.

You can call this method to retrieve objects from the data source even when they have been filtered out via <DPropLink name="filterValue" /> or <DPropLink name="filterFunction" />, as long as they are present in the initial data.

<Note>

The alternative API method <DApiLink name="getRowInfoByPrimaryKey" /> can only be used to retrieve <TypeLink name="InfiniteTableRowInfo" code={false}>row info objects</TypeLink> of rows that are not filtered out - so only rows that match the filtering, if one is present.

</Note>

</Prop>

<Prop name="getIndexByPrimaryKey" type="(id: any) => number">

> Retrieves the index of a row by its primary key. If the row is not found, returns `-1`. See related <DApiLink name="getPrimaryKeyByIndex" />

<Note>

The primary key you pass in needs to exist in the current data set. If you pass in a primary key that has been filtered out or that's not in the data set, the method will return `-1`.

</Note>

</Prop>

<Prop name="getPrimaryKeyByIndex" type="(index: number) => any | undefined ">

> Retrieves the primary key of a row by its current index. If the row is not found, returns `undefined`. See related <DApiLink name="getIndexByPrimaryKey" />

<Note>

The index you pass in needs to be of an existing row, after all filtering is applied. If you pass in an non-existent index, the method will return `undefined`.

</Note>

</Prop>

<Prop name="getRowInfoByIndex" type="(index: number) => InfiniteTableRowInfo<DATA_TYPE> | null">

> Retrieves the <TypeLink name="InfiniteTableRowInfo" code={false}>row info object</TypeLink> for the row at the specified index. If none found, returns `null`. See related <DApiLink name="getRowInfoByPrimaryKey" />.

</Prop>

<Prop name="getRowInfoByPrimaryKey" type="(id: any) => InfiniteTableRowInfo<DATA_TYPE> | null">

> Retrieves the <TypeLink name="InfiniteTableRowInfo" code={false}>row info object</TypeLink> for the row with the specified primary key. If none found, returns `null`.

This method will only find row info objects for rows that are currently in the dataset and matching the filtering, if one is present. Can also be called for group rows.

<Note>

See related <DApiLink name="getDataByPrimaryKey" /> method, which retrieves the raw data object for the specified primary key, even if it has been filtered out.

</Note>

</Prop>

<Prop name="getRowInfoArray" type="() => InfiniteTableRowInfo[]">

> Returns the current row info array. See <TypeLink name="InfiniteTableRowInfo" code={false}>the type definition of the row info object</TypeLink>.

The row info array represents the current state of the DataSource. This array may contain more items than the actual data array fetched initially by the DataSource. This is because it includes group rows, when grouping is defined, as well as unfetched rows in some advanced scenarios.

</Prop>


<Prop name="insertData" type="(data: DATA_TYPE, { position, primaryKey }) => Promise">

> Inserts the given data at the specified position relative to the given primary key.

The `position` can be one of the following:

* `start` | `end` - inserts the data at the beginning or end of the data source. In this case, no `primaryKey` is needed.
* `before` | `after` - inserts the data before or after the data item that has the specified primary key. **In thise case, the `primaryKey` is required.**

We're intentionally not encouraging inserting at a specified `index`, as the index of rows in the visible viewport can change as the user sorts, filters or groups the data.

For inserting an array of data, see the <DApiLink name="insertDataArray" /> method.

<Sandpack title="Inserting data at various locations">

<Description>

Click any row in the table to make it the current active row, and then use the second button to add a new row after the active row.

</Description>

```ts file="insert-example.page.tsx"
```

</Sandpack>


</Prop>

<Prop name="insertDataArray" type="(data: DATA_TYPE[], { position, primaryKey }) => Promise">

> Inserts an array of data at the specified position (and relative to the given primary key).

Just like the <DApiLink name="insertData" /> method, the `position` can be one of the following:

* `start` | `end` - inserts the data at the beginning or end of the data source. In this case, no `primaryKey` is needed.
* `before` | `after` - inserts the data before or after the data item that has the specified primary key. **In thise case, the `primaryKey` is required.**


All the data items passed to this method will be inserted (in the order in the array) at the specified position.

</Prop>


<Prop name="updateData" type="(data: Partial<DATA_TYPE>) => Promise">

> Updates the data item to match the given data object.

<Note>

The data object must have a primary key that matches the primary key of the data item that you want to update. Besides the primary key, it can contain any number of properties that you want to update.

</Note>


```ts
dataSourceApi.updateData({
  // if the primaryKey is the id, make sure to include it
  id: 1,

  // and then include any properties you want to update - in this case, the name and age
  name: 'John Doe',
  age: 30
})
```

For updating an array of data, see the <DApiLink name="updateDataArray" /> method.

<Sandpack title="Live data updates with DataSourceApi.updateData">

<Description>

The DataSource has 10k items.

In this example, we're updating 5 rows (in the visible viewport) every 30ms.

The update rate could be much higher, but we're keeping it at current levels to make it easier to see the changes.

</Description>

```ts file="liveUpdates-example.page.tsx"
```

</Sandpack>

</Prop>

<Prop name="updateDataArray" type="(data: Partial<DATA_TYPE>[]) => Promise">

> Updates an array of data items to match the given data objects.

See related <DApiLink name="updateData" /> method.

</Prop>

<Prop name="onReady" type="(api: DataSourceApi) => void">

> Called only once, after the DataSource component has been mounted.

This callback prop will be called with an `DataSourceApi` instance. For retrieving the [`InfiniteTableApi`](/docs/reference/api), see the `InfiniteTable` <PropLink name="onReady" /> callback prop.

</Prop>

<Prop name="removeData" type="(data: Partial<DATA_TYPE>) => Promise">

> Removes the data item that matches the given data object.

The data object must at least have a primary key that matches the primary key of the data item that you want to remove. All the other properties are ignored.

For removing an array of data, see the <DApiLink name="removeDataArray" /> method.

If you only want to remove by a primary key, you can call <DApiLink name="removeDataByPrimaryKey" /> instead.
If you have an array of primary keys, you can call <DApiLink name="removeDataArrayByPrimaryKeys" /> instead.
</Prop>

<Prop name="removeDataArray" type="(data: Partial<DATA_TYPE>[]) => Promise">

> Removes the data items that match the given data objects.

The data objects must at least have a primary key that matches the primary key of the data item that you want to remove. All the other properties are ignored.

For removing only one item, see the <DApiLink name="removeData" /> method.

If you only want to remove by a primary key, you can call <DApiLink name="removeDataByPrimaryKey" /> instead.
If you have an array of primary keys, you can call <DApiLink name="removeDataArrayByPrimaryKeys" /> instead.
</Prop>

<Prop name="removeDataArrayByPrimaryKeys" type="(primaryKeys: (string | number)[]) => Promise">

> Removes the data items with the specified primary keys.

For removing only one data item, see the <DApiLink name="removeDataByPrimaryKey" /> method.

If you have a data object, you can call <DApiLink name="removeData" /> instead.
If you have an array of data objects, you can call <DApiLink name="removeDataArray" /> instead.
</Prop>

<Prop name="removeDataByPrimaryKey" type="(primaryKey: string | number) => Promise">

> Removes the data item with the specified primary key.

For removing an array of data, see the <DApiLink name="removeDataArrayByPrimaryKeys" /> method.

If you have a data object, you can call <DApiLink name="removeData" /> instead.
If you have an array of data objects, you can call <DApiLink name="removeDataArray" /> instead.
</Prop>


</PropTable>
