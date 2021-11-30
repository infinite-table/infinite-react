---
title: Pivoting
---

An enteprise-level feature `InfiniteTable` provides is the pivoting functionality. Combined with grouping and advanced aggregation, it unlocks new ways to visualize data.

Pivoting is first defined at the `DataSource` level, via the <PropLink name="pivotBy" /> prop. It's an array of objects, each with a `field` property bound (so `pivotBy[].field` is keyof `DATA_TYPE`) to the `DataSource`.


<Note>

Pivoting generates columns based on the pivoting values, so you have to pass those generated columns into the `<InfiniteTable />` component.

You do that by using a `function` as a direct child of the `DataSource`, and in that function you have access to the generated `pivotColumns` array. Likewise for `pivotColumnGroups`.

</Note>


```ts
const pivotBy = [{ field: 'team' }]
 // field needs to be keyof DATA_TYPE both in `pivotBy` and `groupRowsBy`
const groupRowsBy = [{field: 'department'}, {field: 'country'}]

<DataSource<DATA_TYPE> pivotBy={pivotBy} groupRowsBy={groupRowsBy}>
{ ({pivotColumns, pivotColumnGroups}) => {
  return <InfiniteTable<DATA_TYPE>
    pivotColumns={pivotColumns}
    pivotColumnGroups={pivotColumnGroups}
  />
} }
</DataSource>
```

<Sandpack>

```ts file=pivoting-example.page.tsx
```

</Sandpack>