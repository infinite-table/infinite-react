---
title: Pivoting with Infinite
---

An enteprise-level feature `InfiniteTable` provides is the pivoting functionality. Combined with grouping and advanced aggregation, it unlocks new ways to visualize data.

Pivoting is first defined at the `DataSource` level, via the <PropLink name="pivotBy" /> prop. It's an array of objects, each with a `field` property bound (so `pivotBy[].field` is keyof `DATA_TYPE`) to the `DataSource`.

<Note>

Pivoting generates columns based on the pivoting values, so you have to pass those generated columns into the `<InfiniteTable />` component.

You do that by using a `function` as a direct child of the `DataSource`, and in that function you have access to the generated `pivotColumns` array. Likewise for `pivotColumnGroups`.

</Note>

For more pivoting examples, see [our pivoting demos](/docs/learn/examples/dynamic-pivoting-example)

```ts file="overview.snippet.tsx" region="intro"
```

```tsx file="pivoting-example.demo.tsx" title="Pivoting with avg aggregation"
```

## Sorting the group column and pivot columns

Sorting the group column in a pivot table uses the same <DPropLink name="sortInfo" /> as in [row grouping](/docs/learn/grouping-and-pivoting/grouping-rows#sorting-the-group-column). For a single group column it is enough to pass `{ id: 'group-by', dir: 1 }`. Based on the current <DPropLink name="groupBy" />and your columns, it will detect the fields and the sorting it needs to apply.

```ts file="overview.snippet.tsx" region="sorting-the-group-column-and-pivot-columns"
```

Generated pivot columns inherit sortability from the original <PropLink name="columns" /> bound to the aggregation field — including <PropLink name="columnDefaultSortable" />. You can override that with `defaultSortable` on the <PropLink name="pivotColumn" /> prop on `<InfiniteTable />`:

```tsx file="overview.snippet.tsx" region="sorting-the-group-column-and-pivot-columns-2"
```

That applies <PropLink name="columns.defaultSortable" nocode>defaultSortable</PropLink> to every generated pivot column. The sort type is taken from the original <PropLink name="columns" /> bound to the aggregation field.

For narrower control — only one aggregation, or only columns in a specific pivot group — see [customizing pivot columns](/docs/learn/grouping-and-pivoting/pivoting/customizing-pivot-columns).

Passing `defaultSortInfo` as an array enables multiple sorting. Combined with <PropLink name="multiSortBehavior">multiSortBehavior="append"</PropLink>, clicking a pivot column adds that sort instead of replacing the group-column sort.

<DemoTitle>Pivoting with initial group-column sort and sortable leaf pivot columns</DemoTitle>
<DemoDescription>

This table starts sorted by the group column (`preferredLanguage`, then `stack`). Click a pivot column header — for example a `yes` or `no` column under a country — to add a sort by that aggregated value.

</DemoDescription>

```tsx file="pivoting-sorting-example.demo.tsx"
```

## Customizing Pivot Columns

There are a number of ways to customize the pivot columns and <DataSourcePropLink name="pivotBy.columnGroup" nocode>pivot column groups</DataSourcePropLink>. This is something you generally want to do, as they are generated and you might need to tweak column headers, size, etc. The three override points - <PropLink name="pivotColumn" />, <DataSourcePropLink name="pivotBy.column" />, and <DataSourcePropLink name="aggregationReducers" nocode>aggregationReducers.pivotColumn</DataSourcePropLink> — are documented in [customizing pivot columns](/docs/learn/grouping-and-pivoting/pivoting/customizing-pivot-columns).

The default behavior for pivot columns generated for aggregations is that they inherit the properties of the original columns bound to the same field as the aggregation.

```ts file="overview.snippet.tsx" region="customizing-pivot-columns"
```

```tsx file="pivot-column-inherit-example.demo.tsx" title="Pivot columns inherit from original columns bound to the same field"
```

Another way to do it is to specify <DataSourcePropLink name="pivotBy.column" />, as either an object, or (more importantly) as a function.
If you pass an object, it will be applied to all pivot columns in the column group generated for the `field` property.

```tsx file="overview.snippet.tsx" region="customizing-pivot-columns-2"
```

In the above example, the `column.defaultWidth=400` will be applied to columns generated for all `canDesign` values corresponding to each country. This is good but not good enough as you might want to customize the pivot column for every value in the pivot. You can do that by passing a function to the `pivotBy.column` property.

```tsx file="overview.snippet.tsx" region="customizing-pivot-columns-3"
```

```tsx file="pivoting-customize-column-example.demo.tsx" title="Pivoting with customized pivot column"
```

## Total and grand-total columns

In <DPropLink name="pivotBy" nocode>pivot mode</DPropLink> you can configure both <PropLink name="pivotTotalColumnPosition" nocode>total columns</PropLink> and <PropLink name="pivotGrandTotalColumnPosition" nocode>grand-total columns</PropLink>. By default, grand-total columns are not displayed, so you have to explicitly set the <PropLink name="pivotGrandTotalColumnPosition" /> prop for them to be visible.

<Note> 
Pivot total columns are only displayed when <DPropLink name="pivotBy" nocode>pivotBy</DPropLink> has two or more fields (`pivotBy.length > 1`). With a single pivot field only grand-total columns can be shown, and naving <PropLink name="pivotTotalColumnPosition" /> has no effect  — the totals would be the same as the already displayed values.

The example below pivots by `stack` and `canDesign` so both total and grand-total columns are visible.

</Note>

```tsx file="/docs/reference/pivot-grand-total-column-position-example.demo.tsx" title="Pivoting with customized position for totals and grand-total columns"
```

<Note>

**What are grand-total columns?**

For each <DPropLink name="aggregationReducers" nocode>aggregation reducer</DPropLink> specified in the `DataSource`, you can have a total column - this is what <PropLink name="pivotGrandTotalColumnPosition" nocode>grand-total columns</PropLink> basically are.

</Note>

## Server-side pivoting

By default, pivoting is client side. However, if you specify <DataSourcePropLink name="lazyLoad" code>DataSource.lazyLoad</DataSourcePropLink> and provide a function that returns a promise for the <DataSourcePropLink name="data" code>DataSource.data</DataSourcePropLink> prop, the table will use server-pivoted data.

The <DataSourcePropLink name="data" code>DataSource.data</DataSourcePropLink> function is expected to return a promise that resolves to an object with the following shape:

- `totalCount` - the total number of records in the group we're pivoting on
- `data` - an array of objects that describes child groups, each object has the following properties:
  - `keys` - an array of the group keys (usually strings) that uniquely identifies the group, from the root to the current group
  - `data` - an object that describes the common properties of the group
  - `aggregations` - an object that describes the aggregations for the current group
  - `pivot` - the pivoted values and aggregations for each value. This object will have the following properties:
    - `totals` - an object with a key for each aggregation. The value is the aggregated value for the respective aggregation reducer.
    - `values` - an object keyed with the unique values for the pivot field. The values of those keys are objects with the same shape as the `pivot` top-level object, namely `totals` and `values`.

In the example below, let's assume the following practical scenario, with the data-type being a `Developer{country, stack, preferredLanguage, canDesign, age, salary}`.

```tsx file="overview.snippet.tsx" region="server-side-pivoting"
```

```tsx file="overview.snippet.tsx" region="server-side-pivoting-2"
```

```js file="overview.snippet.tsx" region="server-side-pivoting-3"
```

```tsx file="remote-pivoting-example.demo.tsx" title="Server-side pivoting example"
```

<Note>

The <PropLink name="groupRenderStrategy" /> prop is applicable even to pivoted tables, but `groupRenderStrategy="inline"` is not supported in this case.

</Note>

### Another pivoting example with batching

Pivoting builds on the same data response as server-side grouping, but adds the pivot values for each group, as we already showed. Another difference is that in pivoting, no leaf rows are rendered or loaded, since this is pivoting and it only works with aggregated data. This means the `DataSource.data` function must always return the same format for the response data.

Just like server-side grouping, server-side pivoting also supports batching - make sure you specify <DataSourcePropLink name="lazyLoad">lazyLoad.batchSize</DataSourcePropLink>.

The example below also shows you how to customize the table rows while records are still loading.

```tsx file="server-side-pivoting-with-lazy-load-batching-example.demo.tsx" title="Server side pivoting with lazy loding batching"
```

Here's another example, that assumes grouping by `country` and `city`, aggregations by `age` and `salary` (average values) and pivot by `preferredLanguage` and `canDesign` (a boolean property):

```tsx file="overview.snippet.tsx" region="another-pivoting-example-with-batching"
```

If we were to scroll down, the next batch of data would have the same structure as the previous one, but with `lazyLoadStartIndex` set to 10 (if `lazyLoad.batchSize = 10`).

Now let's expand the first group and see how the request/response would look like:

```tsx file="overview.snippet.tsx" region="another-pivoting-example-with-batching-2"
```

<Note>

The response can contain a `mappings` key with values for `totals` and `values` keys - this can be useful for making the server-side pivot response lighter.

If `mappings` would be `{totals: "t", values: "v"}`, the response would look like this:

```tsx file="overview.snippet.tsx" region="another-pivoting-example-with-batching-3"
```

More-over, you can also give aggregationReducers shorter keys to make the server response even more compact

```tsx file="overview.snippet.tsx" region="another-pivoting-example-with-batching-4"
```

</Note>

<Note>

Adding a `cache: true` key to the resolved object in the `DataSource.data` call will cache the value for the expanded group, so that when collaped and expanded again, the cached value will be used, and no new call is made to the `DataSource.data` function. This is applicable for both pivoted and/or grouped data. Not passing `cache: true` will make the function call each time the group is expanded.

</Note>
