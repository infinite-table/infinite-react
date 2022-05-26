---
title: Sorting
---

`InfiniteTable` comes with multiple sorting behaviours, which are described below.


## Single and multiple sorting

Both single and multiple sorting are supported via the <DataSourcePropLink name="sortInfo" /> and <DataSourcePropLink name="defaultSortInfo" /> props. For single sorting, specify an object like 
```ts
// sort by `firstName`, in ascending order
sortInfo = { field: 'firstName', dir: 1 }

// no sorting
sortInfo = null
```
while if you want to specify multiple sorting, specify an array of objects like

```ts
// sort by age in descending order, then by `firstName` in ascending order
sortInfo = [
  { field: 'age', type: 'number', dir: -1 },
  { field: 'firstName', dir: 1 },
]

// no sorting
sortInfo = []
```

<Sandpack title="Local + uncontrolled multi-sorting example"> 

```ts file=local-uncontrolled-multi-sorting-example-with-remote-data.page.tsx
```
</Sandpack>


<Sandpack title="Remote + uncontrolled multi-sorting example"> 

```ts file=remote-uncontrolled-multi-sorting-example.page.tsx
```
</Sandpack>

<Note>

If you use uncontrolled sorting via <DataSourcePropLink name="defaultSortInfo" /> there's no way to switch between single and multiple sorting after the component is mounted. If you have this use-case, you need to use the controlled <DataSourcePropLink name="sortInfo" /> prop.

</Note>

The sort information object has the following shape:

 * `dir` - `1 | -1` - the direction of the sorting
 * `field`? - `keyof DATA_TYPE` - the field to sort by - optional.
 * `id`? - `string` - if you don't sort by a field, you can specify an id of the column this sorting is bound to. Note that columns have a <PropLink name="columns.valueGetter">valueGetter</PropLink>, which will be used when doing local sorting and the column is not bound to an exact field.
 * `type` - the sort type - one of the keys in <DataSourcePropLink name="sortTypes"/> - eg `"string"`, `"number"` - will be used for local sorting, to provide the proper comparison function.

## Controlled and uncontrolled sorting

 - ** uncontrolled (embedded) sorting** - the `<DataSource />` sorts the data internally (when <DataSourcePropLink name="sortMode">sortMode=local</DataSourcePropLink>, which is the default), based on the <DataSourcePropLink name="defaultSortInfo" /> prop. As the user interacts with the table, <DataSourcePropLink name="onSortInfoChange" /> is being called with updated sort info and the `<DataSource />` continues to sort the data accordingly.

 <Note>

 The <DataSourcePropLink name="defaultSortInfo" /> prop is an uncontrolled prop, so it's all managed inside the `<DataSource />` component and you can't change it from the outside. If you need to control it from outside the component, use the <DataSourcePropLink name="sortInfo" code={false}>controlled sortInfo</DataSourcePropLink> prop.

 </Note>

  - ** controlled (outside) sorting** - the `<DataSource />` doesn't sort the data internally, but instead it expects the <DataSourcePropLink name="data" /> it is provided with to be already sorted.  In this case you need to use the controlled <DataSourcePropLink name="sortInfo" /> prop and pass it to `<DataSource />` so it knows the current sort order, which is needed for displaying correct sort indicators on column headers and which should  be the next sort order when the user interacts with the table.

Both controlled <DataSourcePropLink name="sortInfo" /> and uncontrolled <DataSourcePropLink name="defaultSortInfo" /> work in combination with <DataSourcePropLink name="onSortInfoChange" /> - use it to be notified when sorting changes, so you can react and update your app accordingly if needed.

## Local and remote sorting

Sorting can be done both locally in the browser and remotely on the server. For configuring where sorting is being performed, use the <DataSourcePropLink name="sortMode" /> prop - it can be either `local` or `remote` (defaults to `local`).

<Note>

Controlled sorting (via <DataSourcePropLink name="sortInfo" />) means sorting is done outside of the `<DataSource />` component, so it's up to you to sort the data.

This is also the case for <DataSourcePropLink name="sortMode">sortMode=remote</DataSourcePropLink>, so the two are very similar.

</Note>

### Local sorting

When you use uncontrolled sorting locally, the `<DataSource />` will sort the data internally, based on the <DataSourcePropLink name="defaultSortInfo" /> prop. Local sorting is available for any configured <DataSourcePropLink name="data" /> source - be it an array or a function that returns a promise.

<Note>

You can use <DataSourcePropLink name="onDataParamsChange" />, which is called whenever any of the sorting, filtering, grouping or pivoting information changes.

</Note>


<Sandpack title="Local uncontrolled sorting + local data"> 

```ts file=local-uncontrolled-single-sorting-example-with-remote-data.page.tsx
```

</Sandpack>

<Sandpack title="Local uncontrolled sorting + remote data"> 

```ts file=local-uncontrolled-single-sorting-example-with-remote-data.page.tsx
```

</Sandpack>


### Remote sorting

Sorting remotely makes a lot of sense when using a function as your <DataSourcePropLink name="data" /> source. Whenever the sort information is changed, the function will be called with all the information needed to retrieve the data from the remote endpoint.

<Note>

For remote sorting, make sure you specify <DataSourcePropLink name="sortMode">sortMode="remote"</DataSourcePropLink> - if you don't, the data will also be sorted locally in the browser (which most of the times will be harmless, but it means wasted CPU cycles).

</Note>

<Sandpack title="Remote + controlled multi-sorting example"> 

```ts file=remote-controlled-multi-sorting-example.page.tsx
```
</Sandpack>

In the example above, remote and controlled sorting are combined - because `sortMode="remote"` is specified, the `<DataSource />` will call the `data` function whenever sorting changes, and will pass in the `dataParams` object that contains the sort information.

## Custom sort functions with sortTypes

By default, all columns are sorted as strings, even if they contain numeric values. To make numeric columns sort as numbers, you need to specify <PropLink name="columns.dataType" code={false}>a `dataType` for the column</PropLink>, or, <PropLink name="columns.sortType" code={false}>a column `sortType`</PropLink>.

There are two `dataType` values that can be used: 
* `"string"`
* `"number"`

Each dataType has its own sorting function and its own filtering operators & functions.

Sorting works in combination with the <PropLink name="sortTypes" /> property, which is an object with keys being sort types and values being functions that compare two values of the same type.

```ts
const sortTypes = {
  "string": (a, b) => a.localeCompare(b),
  "number": (a, b) => a - b,
}
```

Those are the two sort types supported by default.

<Note>

A column can choose to use a specific <PropLink name="columns.sortType" />, in which case, for local sorting, the corresponding sort function will be used, or, it can simply specify a <PropLink name="columns.dataType">dataType</PropLink> and the `sortType` with the same name will be used (when no explicit <PropLink name="columns.sortType">sortType</PropLink> is defined).

To conclude, the <PropLink name="columns.dataType">dataType</PropLink> of a column will be used as the <PropLink name="columns.sortType">sortType</PropLink> and <PropLink name="columns.filterType">filterType</PropLink>, when those are not explicitly specified.

</Note>

<Sandpack  title="Custom sort by color - magenta will come first">

```ts file=../../reference/datasource-props/sortTypes-example.page.tsx
```

</Sandpack>


<Note>

In this example, for the `"color"` column, we specified <PropLink name="columns.sortType">column.sortType="color"</PropLink> - we could have passed that as `column.dataType` instead, but if the grid had filtering, it wouldn't know what filters to use for "color" - so we used<PropLink name="columns.sortType">column.sortType</PropLink> to only change how the data is sorted.

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