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

<Sandpack title="Pivoting with avg aggregation">

```ts file=pivoting-example.page.tsx
```

</Sandpack>


## Customizing Pivot Columns

There are a number of ways to customize the pivot columns. This is something you generally want to do, as they are generated and you might need to tweak column headers, size, etc.

One way to do it is to specify <DPropLink name="pivotBy.column" />, as either an object, or (more importantly) as a function.
If you pass an object, it will be applied to all pivot columns corresponding to the `field` property.


```tsx
const pivotBy: DataSourcePivotBy<DATA_TYPE>[] = [
  { field: 'country' },
  { field: 'canDesign', column: { width: 400 } },
];

<DataSource pivotBy={pivotBy} />
```

In the above example, the `column.width=400` will be applied to columns generated for all `canDesign` values corresponding to each country. This is good but not good enough as you might want to customize the pivot column for every value in the pivot. You can do that by passing a function to the `pivotBy.column` property.

```tsx
const pivotBy: DataSourcePivotBy<DATA_TYPE>[] = [
  { field: 'country' },
  { field: 'canDesign', column: ({ column }) => {
    return {
      header: column.pivotGroupKeyForColumn === 'yes' ? 'Designer' : 'Not a Designer',
    }
  },
];
```



<Sandpack title="Pivoting with customized pivot column">

```ts file=pivoting-customize-column-example.page.tsx
```

</Sandpack>