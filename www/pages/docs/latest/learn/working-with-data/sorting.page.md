---
title: Sorting
---


`InfiniteTable` comes with multiple sorting behaviours:
 - **embedded (uncontrolled) sorting** - the `<DataSource />` sorts the data internally, based on the <PropLink name="defaultSortInfo" /> prop. As the user interacts with the table, <PropLink name="onSortInfoChange" /> is being called with updated sort info and the `<DataSource />` continues to sort the data accordingly.

 <Note>

 The <PropLink name="defaultSortInfo" /> prop is an uncontrolled prop, so it's all managed inside the `<DataSource />` component and you can't change it from the outside. If you need to control it from outside the component, use the <PropLink name="sortInfo" code={false}>controlled sortInfo</PropLink> prop.

 </Note>

  - **outside (controlled) sorting** - the `<DataSource />` doesn't sort the data internally, but instead it expects the <PropLink name="data" /> it is provided with to be already sorted.  In this case you need to use the controlled <PropLink name="sortInfo" /> prop and pass it to `<DataSource />` so it knows the current sort order, which is needed for displaying correct sort indicators on column headers and which should  be the next sort order when the user interacts with the table.

Both controlled <PropLink name="sortInfo" /> and uncontrolled <PropLink name="defaultSortInfo" /> work in combination with <PropLink name="onSortInfoChange" /> - use it to be notified when sorting changes, so you can react and update your app accordingly if needed.

<Note>

If you want to use remote data and sorting, be aware that the data should be updated on any interaction that triggers changes, like sorting, filtering, grouping, pivoting.

</Note>

To react to any of the operations that trigger changes in the data, you can use <PropLink name="onDataChange" />, which is called with all the sorting, filtering, grouping and pivoting information currently applied to `InfiniteTable` so you can do all of those data operations remotely.


### Single and multiple sorting

Both single and multiple sorting are supported by the <PropLink name="sortInfo" /> and <PropLink name="defaultSortInfo" /> props. For single sorting, specify an object like 
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

<Note>

If you use uncontrolled sorting via <PropLink name="defaultSortInfo" /> there's no way to switch between single and multiple sorting after the component is mounted. If you have this use-case, you need to use the controlled <PropLink name="sortInfo" /> prop.

</Note>