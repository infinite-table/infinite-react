---
title: Single Sorting
description: Docs and examples on single-column sorting for Infinite Table DataGrid
---

By default, the Infinite Table is sortable - clicking a column will sort the grid by that column. Clicking again will reverse the sort and a third click on the column removes the sort altogether.

At any point, clicking another column header removes any existing column sort and performs a new sort by the clicked column.

<Note>

This is called single sorting - only one column can be sorted at a time.

Technically, it's the `<DataSource />` that's being sorted, not the `<InfiniteTable />` component.

</Note>

<Sandpack title="Default behavior is single sorting.">

<Description>

By default, clicking a column header sorts the column.

</Description>

```ts file="local-single-sorting-example-defaults-with-local-data.page.tsx"

```

</Sandpack>

## Apply a default sort order

You can specify a default sort order by using the <DataSourcePropLink name="defaultSortInfo" /> prop - specify an object like

```ts
// sort by `firstName`, in ascending order
defaultSortInfo = { field: 'firstName', dir: 1 };
```

<Note>

<DataSourcePropLink name="defaultSortInfo" /> is an uncontrolled property, so updating the sorting by clicking a column header does not require you to respond to user actions via the <DataSourcePropLink name="onSortInfoChange" />.

Uncontrolled sorting is managed internally by the `<DataSource />` component, so you don't need to worry about it.

For controlled sorting, make sure you use the <DataSourcePropLink name="sortInfo" /> prop and the <DataSourcePropLink name="onSortInfoChange" /> callback.

</Note>

<Sandpack title="Local + uncontrolled single-sorting example">

<Description>

The `age` column is sorted in ascending order.

</Description>

```ts file="local-uncontrolled-single-sorting-example-with-local-data.page.tsx"

```

</Sandpack>

## Controlled sorting

For controlled, single sorting, use the <DataSourcePropLink name="sortInfo" /> as an object like this:

```ts
// sort by `firstName`, in ascending order
sortInfo = { field: 'firstName', dir: 1 };
```

or you can specify `null` for explicit no sorting

```ts
// no sorting
sortInfo = null;
```

<Note>

When you use controlled sorting via <DataSourcePropLink name="sortInfo" />, make sure you also listen to <DataSourcePropLink name="onSortInfoChange" /> for changes, to get notifications when sorting is changed by the user. Also, for controlled sorting, it's your responsibility to sort the data - read bellow in the [controlled and uncontrolled section](#controlled-and-uncontrolled-sorting).

</Note>

## Describing the sort order

To describe the sorting order, you have to use an object that has the following shape:

- `dir` - `1 | -1` - the direction of the sorting
- `field?` - `keyof DATA_TYPE` - the field to sort by - optional.
- `id?` - `string` - if you don't sort by a field, you can specify an id of the column this sorting is bound to. Note that columns have a <PropLink name="columns.valueGetter">valueGetter</PropLink>, which will be used when doing local sorting and the column is not bound to an exact field.
- `type?` - the sort type - one of the keys in <DataSourcePropLink name="sortTypes"/> - eg `"string"`, `"number"`, `"date"` - will be used for local sorting, to provide the proper comparison function.

### Multiple Sorting

If you want to use multiple sorting, specify an array of objects like

```ts
// sort by age in descending order, then by `firstName` in ascending order
sortInfo = [
  { field: 'age', type: 'number', dir: -1 },
  { field: 'firstName', dir: 1 },
];

// no sorting
sortInfo = [];
```

This allows sorting by multiple fields (to which columns are bound) - you can specify however many you want - so when sorting two objects in the `DataSource`, the first `sortInfo` is used to compare the two, and then, on equal values, the next `sortInfo` is used and so on.

<Sandpack title="Local + uncontrolled multi-sorting example">

<Description>

This table allows sorting multiple columns - initially the `country` column is sorted in descending order and the `salary` column is sorted in ascending order. Click the `salary` column to toggle the column sort to descending. Clicking it a second time will remove it from the sort altogether.

</Description>

```ts file="local-uncontrolled-multi-sorting-example-with-remote-data.page.tsx"

```

</Sandpack>

<Sandpack title="Remote + uncontrolled multi-sorting example">

```ts file="remote-uncontrolled-multi-sorting-example.page.tsx"

```

</Sandpack>

<Note>

If you use uncontrolled sorting via <DataSourcePropLink name="defaultSortInfo" /> there's no way to switch between single and multiple sorting after the component is mounted. If you have this use-case, you need to use the controlled <DataSourcePropLink name="sortInfo" /> prop.

</Note>

## Understanding sort mode

Sorting can be done both locally in the browser and remotely on the server. For configuring where sorting is performed you need to specify the <DPropLink name="sortMode" code={false}>sort mode</DPropLink>. Possible values for <DPropLink name="sortMode"/> are `"local"` and `"remote"`.

This allows you fine-grained control on how sorting is done, either in the client or on the server.

### Uncontrolled sorting

If you use uncontrolled sorting (namely you don't care about updating the <DPropLink name="sortInfo" /> yourself as a result of user interaction - via <DPropLink name="onSortInfoChange" />) - then by default, the <DPropLink name="sortMode" /> is `"local"` unless you specify otherwise.

You can initially render the component with no sort state or you can specify a default sorting state, via the uncontrolled prop <DPropLink name="defaultSortInfo" />.

```tsx
// initially render the component with ascending sorting on `firstName` field
// also, note this is an array, so multiple sorting will be enabled
const defaultSortInfo = [{ field: 'firstName', dir: 1 }];

<DataSource<Developer>
  primaryKey="id"
  data={data}
  defaultSortInfo={defaultSortInfo}
>
  <InfiniteTable />
</DataSource>;
```

If your data is remote and you want the sorting to happen on the backend, you can still use uncontrolled sorting, but you need to specify <DPropLink name="sortMode">sortMode="remote"</DPropLink>.

Using remote sort mode will trigger a call to the <DPropLink name="data" /> function whenever sorting changes, so you can re-fetch the data from the backend, according to the new `sortInfo`.

Whe `local` uncontrolled sorting is used, the `<DataSource />` sorts the data internally, based on the existing sorting information. To start with a specific `sortInfo`, use the <DataSourcePropLink name="defaultSortInfo" /> prop. As the user interacts with the table, <DataSourcePropLink name="onSortInfoChange" /> is being called with updated sort info and the `<DataSource />` continues to sort the data accordingly.

<Note>

The <DataSourcePropLink name="defaultSortInfo" /> prop is an uncontrolled prop, so it's all managed inside the `<DataSource />` component and you can't change it from the outside. If you need to control it from outside the component, use the <DataSourcePropLink name="sortInfo" code={false}>controlled sortInfo</DataSourcePropLink> prop - read the next section for more details

</Note>

### Controlled Sorting

When you use the controlled <DataSourcePropLink name="sortInfo" /> prop, by default the <DPropLink name="sortMode" /> is `"remote"`, unless you specify otherwise.

Also, be aware that when the user interacts with the DataGrid when controlled sorting is configured, the <DPropLink name="sortInfo" /> prop will not update automatically - you need to listen to <DPropLink name="onSortInfoChange" /> and update the <DPropLink name="sortInfo" /> yourself.

Just like with uncontrolled sorting, updating the controlled <DPropLink name="sortInfo" /> when `sortMode=remote`, will trigger a call to the <DPropLink name="data" /> function, so new sorted data can be re-fetched.

<Note>

When the controlled <DPropLink name="sortInfo" /> is combined with <DPropLink name="sortMode">sortMode="local"</DPropLink>, the `<DataSource />` will sort the data internally, on any changes of the sorting information.

But remember it's your responsibility to update the <DPropLink name="sortInfo" /> prop when the user interacts with the DataGrid.

</Note>

Both controlled <DataSourcePropLink name="sortInfo" /> and uncontrolled <DataSourcePropLink name="defaultSortInfo" /> work in combination with <DataSourcePropLink name="onSortInfoChange" /> - use it to be notified when sorting changes, so you can react and update your app accordingly if needed.

### Local Sorting

When you use uncontrolled sorting locally, the `<DataSource />` will sort the data internally, based on the <DataSourcePropLink name="defaultSortInfo" /> prop. Local sorting is available for any configured <DataSourcePropLink name="data" /> source - be it an array or a function that returns a promise.

<Note>

You can use <DataSourcePropLink name="onDataParamsChange" />, which is called whenever any of the sorting, filtering, grouping or pivoting information changes.

</Note>

<Sandpack title="Local uncontrolled sorting + local data">

```ts file="local-uncontrolled-single-sorting-example-with-remote-data.page.tsx"

```

</Sandpack>

<Sandpack title="Local uncontrolled sorting + remote data">

```ts file="local-uncontrolled-single-sorting-example-with-remote-data.page.tsx"

```

</Sandpack>

### Remote Sorting

Sorting remotely makes a lot of sense when using a function as your <DataSourcePropLink name="data" /> source. Whenever the sort information is changed, the function will be called with all the information needed to retrieve the data from the remote endpoint.

<Note>

For remote sorting, make sure you specify <DataSourcePropLink name="sortMode">sortMode="remote"</DataSourcePropLink> - if you don't, the data will also be sorted locally in the browser (which most of the times will be harmless, but it means wasted CPU cycles).

</Note>

<Sandpack title="Remote + controlled multi-sorting example">

```ts file="remote-controlled-multi-sorting-example.page.tsx"

```

</Sandpack>

In the example above, remote and controlled sorting are combined - because `sortMode="remote"` is specified, the `<DataSource />` will call the `data` function whenever sorting changes, and will pass in the `dataParams` object that contains the sort information.

## Custom Sort Functions with `sortTypes`

By default, all columns are sorted as strings, even if they contain numeric values. To make numeric columns sort as numbers, you need to specify <PropLink name="columns.dataType" code={false}>a `dataType` for the column</PropLink>, or, <PropLink name="columns.sortType" code={false}>a column `sortType`</PropLink>.

There are two `dataType` values that can be used:

- `"string"`
- `"number"`

Each dataType has its own sorting function and its own filtering operators & functions.

Sorting works in combination with the <PropLink name="sortTypes" /> property, which is an object with keys being sort types and values being functions that compare two values of the same type.

```ts
const sortTypes = {
  string: (a, b) => a.localeCompare(b),
  number: (a, b) => a - b,
};
```

Those are the two sort types supported by default.

<Note>

The functions specified in the <PropLink name="sortTypes" /> object need to always sort data in ascending order.
</Note>

<Note>

A column can choose to use a specific <PropLink name="columns.sortType" />, in which case, for local sorting, the corresponding sort function will be used, or, it can simply specify a <PropLink name="columns.dataType">dataType</PropLink> and the `sortType` with the same name will be used (when no explicit <PropLink name="columns.sortType">sortType</PropLink> is defined).

To conclude, the <PropLink name="columns.dataType">dataType</PropLink> of a column will be used as the <PropLink name="columns.sortType">sortType</PropLink> and <PropLink name="columns.filterType">filterType</PropLink>, when those are not explicitly specified.

</Note>

<Sandpack  title="Custom sort by color - magenta will come first">

```ts file="$DOCS/reference/datasource-props/sortTypes-example.page.tsx"

```

</Sandpack>

<Note>

In this example, for the `"color"` column, we specified <PropLink name="columns.sortType">column.sortType="color"</PropLink> - we could have passed that as `column.dataType` instead, but if the grid had filtering, it wouldn't know what filters to use for "color" - so we used <PropLink name="columns.sortType">column.sortType</PropLink> to only change how the data is sorted.

</Note>

<Note>

When you provide a <DataSourcePropLink name="defaultSortInfo"/> prop and the sorting information uses a custom <DataSourcePropLink name="sortTypes">sortType</DataSourcePropLink>, make sure you specify that as the `type` property of the sorting info object.

```tsx
defaultSortInfo={{
  field: 'color',
  dir: 1,
  // note this custom sort type
  type: 'color',
}}
```

You will need to have a property for that type in your <DataSourcePropLink name="sortTypes"/> object as well.

```tsx
sortTypes={{
  color: (a, b) => //...
}}
```

</Note>

## Replacing the sort function

While there are many ways to customise sorting, including the <DPropLink name="sortTypes" /> mentioned above, you might want to completely replace the sorting function used by the `<DataSource />` component.

You can do this by configuring the <DPropLink name="sortFunction" /> prop.

```tsx
const sortFunction = (sortInfo, dataArray) => {
  // sort the dataArray according to the sortInfo
  // and return the sorted array
  // return sortedDataArray;
};
<DataSource<T> sortFunction={sortFunction} />;
```

The function specified in the <DPropLink name="sortFunction" /> prop is called with the <DPropLink name="sortInfo" /> as the first argument and the data array as the second. It should return a sorted array, as per the <DPropLink name="sortInfo" /> it was called with.

<Note>

When <DPropLink name="sortFunction" /> is specified, <DPropLink name="sortMode" /> will be forced to `"local"`, as the sorting is done in the browser.
</Note>

<Sandpack  title="Using a custom sortFunction">

```ts file="$DOCS/reference/datasource-props/local-sortFunction-single-sorting-example-with-local-data-example.page.tsx"

```

</Sandpack>
